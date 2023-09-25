import { Active, Idle, Killed, Pending, ReadableStatuses, Stopped, Stopping } from "../constants"
import { KodMQError } from "../errors"
import KodMQ from "../kodmq"
import { ID, Worker } from "../types"
import Command from "./Command"
import { SaveJob } from "./SaveJob"
import { SaveWorker } from "./SaveWorker"

const DefaultStopTimeout = 30 * 1000
const StopPollingInterval = 100

export type StartWorkerArgs = {
  id: ID,
  kodmq: KodMQ,
}

export class StopWorker<TArgs extends StartWorkerArgs> extends Command<TArgs> {
  id: ID
  worker: Worker | null
  kodmq: TArgs["kodmq"]

  steps = [
    "checkIfWorkerCanBeStopped",
    "setStatusToStopping",
    "waitForStopped",
  ]

  alwaysRunSteps = []

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.id = args.id
    this.worker = null
    this.kodmq = args.kodmq
  }

  async checkIfWorkerCanBeStopped() {
    this.worker = await this.kodmq.getWorker(this.id)

    // If worker is not found, we assume it was stopped
    if (!this.worker) return this.markAsFinished()

    // Check if worker is in one of the running statuses
    if ([Idle, Active].includes(this.worker.status)) return

    throw new KodMQError(`Worker ${this.id} cannot be stopped because it is ${ReadableStatuses[this.worker.status]}`)
  }

  async setStatusToStopping() {
    const { worker } = await SaveWorker.run({
      workerId: this.id,
      attributes: { status: Stopping },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async waitForStopped() {
    const waitStartedAt = Date.now()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.worker = await this.kodmq.adapter.getWorker(this.id)
      if (!this.worker || this.worker.status === Stopped) break

      const waitDuration = Date.now() - waitStartedAt
      const stopTimeout = this.kodmq.config.stopTimeout ?? DefaultStopTimeout

      if (waitDuration > stopTimeout) {
        // TODO: Maybe we should requeue the job earlier when settings status to stopping and then remove it if it was stopped successfully
        // We can't just requeue job earlier as it would be immediately picked up by another worker
        // We need to create a temporary queue for such jobs (?)
        if (this.worker.currentJob) {
          const { job } = await SaveJob.run({
            jobId: this.worker.currentJob.id,
            attributes: { status: Pending },
            kodmq: this.kodmq,
          })

          await this.kodmq.adapter.prependJobToQueue(job.id)
        }

        await SaveWorker.run({
          workerId: this.worker.id,
          attributes: { status: Killed },
          kodmq: this.kodmq,
        })

        throw new KodMQError(`Worker ${this.worker.id} is not stopped after ${stopTimeout}ms`)
      }

      await new Promise((resolve) => setTimeout(resolve, StopPollingInterval))
    }
  }
}
