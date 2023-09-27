import { Scheduled } from "../constants"
import { KodMQError } from "../errors"
import KodMQ from "../kodmq"
import { Job, Worker } from "../types"
import Command from "./Command"

export type RetryJobArgs = {
  job: Job
  worker: Worker,
  kodmq: KodMQ
}

export class RetryJob<TArgs extends RetryJobArgs> extends Command<TArgs> {
  job: TArgs["job"]
  worker: TArgs["worker"]
  kodmq: TArgs["kodmq"]
  retryAt?: Date
  failedAttempts: number
  newJob?: Job

  steps = [
    "checkIfJobShouldBeRetried",
    "calculateNextRetryAt",
    "scheduleJob",
  ]

  constructor(args: TArgs) {
    super(args)

    this.name = "RetryJob"
    this.verify()

    this.job = args.job
    this.worker = args.worker
    this.kodmq = args.kodmq

    this.failedAttempts = this.job.failedAttempts || 1
  }

  checkIfJobShouldBeRetried() {
    const failedAttempts = this.failedAttempts
    const maxRetries = this.kodmq.config.maxRetries || 0

    if (failedAttempts <= maxRetries) return

    throw new KodMQError(`Job failed ${failedAttempts} times, max failed attempts reached`)
  }

  calculateNextRetryAt() {
    const { retryDelay, retryType } = this.kodmq.config

    if (typeof retryDelay === "number") {
      if (retryType === "exponential") {
        this.retryAt = new Date(Date.now() + retryDelay * Math.pow(2, this.failedAttempts - 1))
      } else {
        this.retryAt = new Date(Date.now() + retryDelay)
      }
    } else if (Array.isArray(retryDelay)) {
      const retryDelayIndex = this.failedAttempts - 1
      const retryDelayValue = retryDelay[Math.min(retryDelayIndex, retryDelay.length - 1)]

      this.retryAt = new Date(Date.now() + retryDelayValue)
    } else if (typeof retryDelay === "function") {
      this.retryAt = new Date(Date.now() + retryDelay(this.job))
    }

    if (!this.retryAt) throw new KodMQError(`Invalid retryDelay: ${retryDelay}`)
  }

  async scheduleJob() {
    this.newJob = await this.kodmq.jobs.create({
      status: Scheduled,
      runAt: this.retryAt,
      name: this.job.name,
      payload: this.job.payload,
      failedAttempts: this.failedAttempts,
    })

    await this.kodmq.jobs.pushToQueue(this.newJob.id, this.newJob.runAt)
    await this.kodmq.runCallbacks("jobScheduledRetry", this.newJob, this.retryAt!, this.job)
  }
}
