import { Busy, Idle, Stopped } from "../constants"
import { KodMQError } from "../errors"
import KodMQ from "../kodmq"
import { Worker } from "../types"
import Command from "./Command"
import { RunJob } from "./RunJob"

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

    this.name = "StartWorker"
    this.verify()

    this.worker = args.worker
    this.kodmq = args.kodmq
  }

  async checkIfWorkerCanBeStarted() {
    if ([Idle, Stopped].includes(this.worker.status)) return

    throw new KodMQError(`Worker ${this.worker.id} can't be started because it's not in Idle or Stopped status`)
  }

  async setStartedAt() {
    this.worker = await this.kodmq.workers.update(this.worker.id, {
      startedAt: new Date(),
    })
  }

  async triggerWorkerStartedCallback() {
    await this.kodmq.runCallbacks("workerStarted", this.worker)
  }

  async startProcessingJobs() {
    const keepProcessing = async () => {
      try {
        const updatedWorker = await this.kodmq.workers.find(this.worker.id)
        if (!updatedWorker) return false

        this.worker = updatedWorker as TArgs["worker"]
        return [Idle, Busy].includes(this.worker.status)
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
    this.worker = await this.kodmq.workers.update(this.worker.id, {
      status: Stopped,
      stoppedAt: new Date(),
    })
  }
}
