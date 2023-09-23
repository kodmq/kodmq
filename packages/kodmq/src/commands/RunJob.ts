import { Active, Completed, Failed } from "../constants"
import { KodMQError, getErrorMessage } from "../errors"
import KodMQ from "../kodmq"
import { Job, Worker } from "../types"
import Command from "./Command"
import { RetryJob } from "./RetryJob"
import { SaveJob } from "./SaveJob"
import { SaveWorker } from "./SaveWorker"

export type RunJobArgs<
  TJob extends Job = Job,
  TWorker extends Worker = Worker,
  TKodMQ extends KodMQ = KodMQ,
> = {
  job: TJob
  worker: TWorker,
  kodmq: TKodMQ
}

export class RunJob<TArgs extends RunJobArgs> extends Command<TArgs> {
  job: TArgs["job"]
  worker: TArgs["worker"]
  kodmq: TArgs["kodmq"]

  steps = [
    "makeSureNoOtherWorkerIsWorkingOnJob",
    "setStatusToActive",
    "setWorkerCurrentJob",
    "runJob",
    "unsetWorkerCurrentJob",
    "setStatusToCompleted",
  ]

  alwaysRunSteps = [
    "unsetWorkerCurrentJob",
    "setStatusToFailed",
    "retryJob",
  ]

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.job = args.job
    this.worker = args.worker
    this.kodmq = args.kodmq
  }

  async makeSureNoOtherWorkerIsWorkingOnJob() {
    const workers = await this.kodmq.adapter.getWorkers()
    const otherWorker = workers.find((worker) => worker.currentJob?.id === this.job.id && worker.id !== this.worker.id)

    if (!otherWorker) return

    this.markAsFinished()
  }

  async setStatusToActive() {
    const { job } = await SaveJob.run({
      jobId: this.job.id,
      attributes: {
        workerId: this.worker.id,
        status: Active,
        startedAt: new Date(),
      },
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async setWorkerCurrentJob() {
    const { worker } = await SaveWorker.run({
      workerId: this.worker.id,
      attributes: { currentJob: this.job },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async runJob() {
    const handler = this.kodmq.handlers[this.job.name]
    if (!handler) throw new KodMQError("No handler found for job")

    try {
      await handler(this.job.payload)
    } catch (error) {
      this.isFailed = true

      if (error instanceof Error) {
        this.errorMessage = error.message
        this.errorStack = error.stack
      } else {
        this.errorMessage = getErrorMessage(error)
      }
    }
  }

  async unsetWorkerCurrentJob() {
    if (!this.worker.currentJob) return

    const { worker } = await SaveWorker.run({
      workerId: this.worker.id,
      attributes: { currentJob: undefined },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async setStatusToCompleted() {
    const { job } = await SaveJob.run({
      jobId: this.job.id,
      attributes: {
        status: Completed,
        finishedAt: new Date(),
      },
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async setStatusToFailed() {
    if (!this.isFailed) return

    const { job } = await SaveJob.run({
      jobId: this.job.id,
      attributes: {
        status: Failed,
        failedAt: new Date(),
        failedAttempts: (this.job.failedAttempts || 0) + 1,
        errorMessage: this.errorMessage,
        errorStack: this.errorStack,
      },
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async retryJob() {
    if (!this.isFailed) return

    const { newJob } = await RetryJob.run({
      job: this.job,
      worker: this.worker,
      kodmq: this.kodmq,
    })

    if (!newJob) return

    const { job } = await SaveJob.run({
      jobId: this.job.id,
      attributes: { retryJobId: newJob.id },
      kodmq: this.kodmq,
    })

    this.job = job
  }
}
