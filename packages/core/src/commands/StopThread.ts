import KodMQ from "../"
import { Killed, Pending, ReadableStatuses, Stopped, Stopping, WorkerActiveStatuses } from "../constants.js"
import { KodMQError } from "../errors.js"
import { ID, Worker } from "../types.js"
import Command from "./Command.js"

const DefaultStopTimeout = 30 * 1000
const StopPollingInterval = 100

export type StartWorkerArgs = {
  id: ID,
  kodmq: KodMQ,
}

export class StopThread<TArgs extends StartWorkerArgs> extends Command<TArgs> {
  id: ID
  worker: Worker | null
  kodmq: TArgs["kodmq"]

  steps = [
    "checkIfThreadCanBeStopped",
    "setStatusToStopping",
    "waitForStopped",
  ]

  alwaysRunSteps = []

  constructor(args: TArgs) {
    super(args)

    this.name = "StopThread"
    this.verify()

    this.id = args.id
    this.worker = null
    this.kodmq = args.kodmq
  }

  async checkIfThreadCanBeStopped() {
    this.worker = await this.kodmq.workers.find(this.id)

    // If worker is not found, we assume it was stopped
    if (!this.worker) return this.markAsFinished()

    // Check if worker is in one of the running statuses
    if (WorkerActiveStatuses.includes(this.worker.status)) return

    throw new KodMQError(`Worker ${this.id} cannot be stopped because it is ${ReadableStatuses[this.worker.status]}`)
  }

  async setStatusToStopping() {
    this.worker = await this.kodmq.workers.update(this.id, {
      status: Stopping,
    })
  }

  async waitForStopped() {
    const waitStartedAt = Date.now()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.worker = await this.kodmq.workers.find(this.id)
      if (!this.worker || this.worker.status === Stopped) break

      const waitDuration = Date.now() - waitStartedAt
      const stopTimeout = this.kodmq.config.stopTimeout ?? DefaultStopTimeout

      if (waitDuration > stopTimeout) {
        // TODO: Maybe we should requeue the job earlier when settings status to stopping and then remove it if it was stopped successfully
        // We can't just requeue job earlier as it would be immediately picked up by another worker
        // We need to create a temporary queue for such jobs (?)
        if (this.worker.currentJob) {
          const job = await this.kodmq.jobs.update(this.worker.currentJob.id, {
            status: Pending,
          })

          await this.kodmq.jobs.prependToQueue(job.id)
        }

        this.worker = await this.kodmq.workers.update(this.id, {
          status: Killed,
        })

        throw new KodMQError(`Worker ${this.worker.id} is not stopped after ${stopTimeout}ms`)
      }

      await new Promise((resolve) => setTimeout(resolve, StopPollingInterval))
    }
  }
}
