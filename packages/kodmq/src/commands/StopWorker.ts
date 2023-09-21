import KodMQ, { Active, ReadableStatuses, Stopped, Stopping, Worker } from "~/src"
import Command from "~/src/commands/Command"
import { SaveWorker } from "~/src/commands/SaveWorker"
import { KodMQError } from "~/src/errors"

const StopTimeout = 30 * 1000
const StopPollingInterval = 100

export type StartWorkerArgs<
  TWorker extends Worker = Worker,
  TKodMQ extends KodMQ = KodMQ,
> = {
  worker: TWorker,
  kodmq: TKodMQ,
}

export class StopWorker<TArgs extends StartWorkerArgs> extends Command<TArgs> {
  worker: TArgs["worker"]
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

    this.worker = args.worker
    this.kodmq = args.kodmq
  }

  async checkIfWorkerCanBeStopped() {
    const worker = await this.kodmq.getWorker(this.worker.id)
    if (!worker) return this.markAsFinished()
    if (worker.status === Active) return

    throw new KodMQError(`Worker ${this.worker.id} cannot be stopped because it is ${ReadableStatuses[worker.status]}`)
  }

  async setStatusToStopping() {
    const { worker } = await SaveWorker.run({
      worker: this.worker,
      attributes: { status: Stopping },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async waitForStopped() {
    const waitStartedAt = Date.now()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.worker = await this.kodmq.adapter.getWorker(this.worker.id) as TArgs["worker"]
      if (!this.worker || this.worker.status === Stopped) break

      const waitDuration = Date.now() - waitStartedAt
      if (waitDuration > StopTimeout) {
        // TODO: Move current job to pending
        throw new KodMQError(`Worker ${this.worker.id} is not stopped after ${StopTimeout}ms`)
      }

      await new Promise((resolve) => setTimeout(resolve, StopPollingInterval))
    }
  }
}
