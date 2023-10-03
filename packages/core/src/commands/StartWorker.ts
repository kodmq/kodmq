import KodMQ from "../"
import { Idle, Stopped, WorkerActiveStatuses } from "../constants.js"
import { KodMQError } from "../errors.js"
import { Job, Worker } from "../types.js"
import Command from "./Command.js"
import { RunJob } from "./RunJob.js"

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
    "startRunning",
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

  async startRunning() {
    await this.kodmq.jobs.subscribe(
      this.runJob.bind(this),
      this.keepRunning.bind(this),
    )

    // If connection is closed, we assume worker was stopped or killed
    const isConnected = await this.kodmq.isConnected()
    if (!isConnected) return this.markAsFinished()
  }

  async setStatusToStopped() {
    this.worker = await this.kodmq.workers.update(this.worker.id, {
      status: Stopped,
      stoppedAt: new Date(),
    })
  }

  private async runJob(job: Job) {
    await RunJob.run({
      job,
      worker: this.worker,
      kodmq: this.kodmq,
    }, {
      allowToFail: true,
    })
  }

  private async keepRunning() {
    try {
      const updatedWorker = await this.kodmq.workers.find(this.worker.id)
      if (!updatedWorker) return false

      this.worker = updatedWorker
      return WorkerActiveStatuses.includes(this.worker.status)
    } catch (e) {
      return false
    }
  }
}
