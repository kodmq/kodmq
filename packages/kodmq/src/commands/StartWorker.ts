import { Active, Idle, Stopped } from "../constants.js"
import { KodMQError } from "../errors.js"
import KodMQ from "../kodmq.js"
import { Worker } from "../types.js"
import Command from "./Command.js"
import { RunJob } from "./RunJob.js"
import { SaveWorker } from "./SaveWorker.js"

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
    "setStartedAt",
    "triggerWorkerStartedCallback",
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

  async setStartedAt() {
    const { worker } = await SaveWorker.run({
      workerId: this.worker.id,
      attributes: {
        startedAt: new Date(),
      },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async triggerWorkerStartedCallback() {
    await this.kodmq.runCallbacks("workerStarted", this.worker)
  }

  async startProcessingJobs() {
    const keepProcessing = async () => {
      const updatedWorker = await this.kodmq.adapter.getWorker(this.worker.id)
      if (!updatedWorker) return false

      this.worker = updatedWorker as TArgs["worker"]
      return [Idle, Active].includes(this.worker.status)
    }

    await this.kodmq.adapter.subscribeToJobs(async (job) => {
      await RunJob.run({
        job,
        worker: this.worker,
        kodmq: this.kodmq,
      }, { 
        allowToFail: true, 
      })
    }, keepProcessing)
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
