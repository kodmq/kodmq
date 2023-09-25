import { Active, Idle, Stopped } from "../constants"
import { KodMQError } from "../errors"
import KodMQ from "../kodmq"
import { Worker } from "../types"
import Command from "./Command"
import { RunJob } from "./RunJob"
import { SaveWorker } from "./SaveWorker"

export type StartWorkerArgs = {
  worker: Worker,
  kodmq: KodMQ,
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
      try {
        const updatedWorker = await this.kodmq.adapter.getWorker(this.worker.id)
        if (!updatedWorker) return false

        this.worker = updatedWorker as TArgs["worker"]
        return [Idle, Active].includes(this.worker.status)
      } catch (e) {
        return false
      }
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

    // Check if worker was killed
    const isConnected = await this.kodmq.adapter.isConnected()
    if (!isConnected) return this.markAsFinished()
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
