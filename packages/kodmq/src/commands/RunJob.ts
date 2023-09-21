import KodMQ, { Active, Completed, Failed, Job, Worker } from "~/src"
import Command from "~/src/commands/Command"
import { SaveJobTo } from "~/src/commands/SaveJobTo"
import { RetryJob } from "~/src/commands/RetryJob"
import { KodMQError } from "~/src/errors"
import { getErrorMessage } from "~/src/utils"
import { SaveWorker } from "~/src/commands/SaveWorker"

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
    "moveJobToActive",
    "setWorkerCurrentJob",
    "runJob",
    "unsetWorkerCurrentJob",
    "moveJobToCompleted",
  ]

  alwaysRunSteps = [
    "unsetWorkerCurrentJob",
    "moveJobToFailed",
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

  async moveJobToActive() {
    const { job } = await SaveJobTo.run({
      job: this.job,
      attributes: { startedAt: new Date() },
      to: Active,
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async setWorkerCurrentJob() {
    const { worker } = await SaveWorker.run({
      worker: this.worker,
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
    } finally {
      this.job.finishedAt = new Date()
    }
  }

  async unsetWorkerCurrentJob() {
    if (!this.worker.currentJob) return

    const { worker } = await SaveWorker.run({
      worker: this.worker,
      attributes: { currentJob: undefined },
      kodmq: this.kodmq,
    })

    this.worker = worker
  }

  async moveJobToCompleted() {
    const { job } = await SaveJobTo.run({
      job: this.job,
      to: Completed,
      from: Active,
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async moveJobToFailed() {
    if (!this.isFailed) return

    this.job.failedAttempts = (this.job.failedAttempts || 0) + 1
    this.job.errorMessage = this.errorMessage
    this.job.errorStack = this.errorStack

    const { job } = await SaveJobTo.run({
      job: this.job,
      to: Failed,
      from: Active,
      kodmq: this.kodmq,
    })

    this.job = job
  }

  async retryJob() {
    if (!this.isFailed) return

    await RetryJob.run({
      job: this.job,
      worker: this.worker,
      kodmq: this.kodmq,
    })
  }
}
