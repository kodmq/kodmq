import KodMQ from "../"
import { Active, Busy, Completed, Failed, Idle } from "../constants.js"
import { getErrorMessage, KodMQError } from "../errors.js"
import { Job, Worker } from "../types.js"
import Command from "./Command.js"
import { RetryJob } from "./RetryJob.js"

export type RunJobArgs = {
  job: Job
  worker: Worker,
  kodmq: KodMQ
}

export class RunJob<TArgs extends RunJobArgs> extends Command<TArgs> {
  job: TArgs["job"]
  worker: TArgs["worker"]
  kodmq: TArgs["kodmq"]

  isJobFailed: boolean = false

  steps = [
    "makeSureNoOtherWorkerRunningJob",
    "setStatusToActive",
    "setWorkerCurrentJob",
    "runJob",
    "unsetWorkerCurrentJob",
    "setWorkerStatusToIdle",
    "setStatusToCompletedOrFailed",
    "retryJob",
  ]

  constructor(args: TArgs) {
    super(args)

    this.name = "RunJob"
    this.verify()

    this.job = args.job
    this.worker = args.worker
    this.kodmq = args.kodmq
  }

  async makeSureNoOtherWorkerRunningJob() {
    const workers = await this.kodmq.workers.all()
    
    const otherWorker = workers.find((worker) => worker.currentJob?.id === this.job.id && worker.id !== this.worker.id)
    if (otherWorker) this.markAsFinished()
  }

  async setStatusToActive() {
    this.job = await this.kodmq.jobs.update(this.job.id, {
      workerId: this.worker.id,
      status: Active,
      startedAt: new Date(),
    })
  }

  async setWorkerCurrentJob() {
    this.worker = await this.kodmq.workers.update(this.worker.id, {
      status: Busy,
      currentJob: this.job,
    })
  }

  async runJob() {
    const handler = this.kodmq.handlers[this.job.name]
    if (!handler) throw new KodMQError("No handler found for job")

    try {
      await handler(this.job.payload)
    } catch (error) {
      this.isJobFailed = true

      if (error instanceof Error) {
        this.errorMessage = error.message
        this.errorStack = error.stack
      } else {
        this.errorMessage = getErrorMessage(error)
      }
    }
  }

  async unsetWorkerCurrentJob() {
    this.worker = await this.kodmq.workers.update(this.worker.id, { currentJob: undefined })
  }

  async setWorkerStatusToIdle() {
    // Do not set status Idle if worker in status Stopping or any other status
    if (this.worker.status !== Busy) return

    this.worker = await this.kodmq.workers.update(this.worker.id, { status: Idle })
  }

  async setStatusToCompletedOrFailed() {
    if (this.isJobFailed) {
      this.job = await this.kodmq.jobs.update(this.job.id, {
        status: Failed,
        failedAt: new Date(),
        failedAttempts: (this.job.failedAttempts || 0) + 1,
        errorMessage: this.errorMessage,
        errorStack: this.errorStack,
      })
    } else {
      this.job = await this.kodmq.jobs.update(this.job.id, {
        status: Completed,
        finishedAt: new Date(),
      })
    }

  }

  async retryJob() {
    if (!this.isJobFailed) return

    const { newJob } = await RetryJob.run({
      job: this.job,
      kodmq: this.kodmq,
    })

    if (!newJob) return

    this.job = await this.kodmq.jobs.update(this.job.id, {
      retryJobId: newJob.id,
    })
  }
}
