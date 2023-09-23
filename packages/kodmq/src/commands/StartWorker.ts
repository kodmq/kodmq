import KodMQ from "~/src"
import Command from "~/src/commands/Command"
import { RunJob } from "~/src/commands/RunJob"
import { SaveWorker } from "~/src/commands/SaveWorker"
import { KodMQError } from "~/src/errors"
import { Active, Idle, Stopped } from "~/src/statuses"
import { Worker } from "~/src/types"

export type StartWorkerArgs<
  TWorker extends Worker = Worker,
  TKodMQ extends KodMQ = KodMQ,
> = {
  worker: TWorker,
  kodmq: TKodMQ,
}

export class StartWorker<TArgs extends StartWorkerArgs> extends Command<TArgs> {
  worker: TArgs["worker"]
  kodmq: TArgs["kodmq"]

  steps = [
    "checkIfWorkerCanBeStarted",
    "setStatusToActive",
    "startProcessingJobs",
    "setStatusToStopped",
  ]

  alwaysRunSteps = []

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.worker = args.worker
    this.kodmq = args.kodmq
  }

  async checkIfWorkerCanBeStarted() {
    if ([Idle, Stopped].includes(this.worker.status)) return

    throw new KodMQError(`Worker ${this.worker.id} can't be started because it's not in Idle or Stopped status`)
  }

  async setStatusToActive() {
    const { worker } = await SaveWorker.run({
      workerId: this.worker.id,
      attributes: {
        status: Active,
        startedAt: new Date(),
      },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async startProcessingJobs() {
    await this.kodmq.adapter.subscribeToJobs(async (job) => {
      await RunJob.run({
        job,
        worker: this.worker,
        kodmq: this.kodmq,
      }, { 
        allowToFail: true, 
      })
    }, async () => {
      const updatedWorker = await this.kodmq.adapter.getWorker(this.worker.id)
      if (!updatedWorker) return false

      this.worker = updatedWorker as TArgs["worker"]
      return this.worker.status === Active
    })
  }

  async setStatusToStopped() {
    const { worker } = await SaveWorker.run({
      workerId: this.worker.id,
      attributes: {
        status: Stopped,
        stoppedAt: new Date(),
      },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }
}
