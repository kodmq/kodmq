import KodMQ from "./KodMQ.ts"
import Job from "./Job.ts"
import { JobStatus } from "./types.ts"
import { randomId } from "./helpers.ts"

export type WorkerData = {
  id: string
  startedAt: Date
  isRunning: boolean
  currentJob: Job | null
}

export default class Worker<TKodMQ extends KodMQ = KodMQ> {
  kodmq: TKodMQ

  id: string
  startedAt: Date
  isRunning: boolean = false
  currentJob: Job | null = null

  constructor(kodmq: TKodMQ) {
    this.kodmq = kodmq

    this.id = randomId()
    this.startedAt = new Date()
  }

  /**
   * Start jobs processing
   */
  async start() {
    await this.update({ isRunning: true })

    await this.kodmq.adapter.subscribeToJobs(async (job) => {
      try {
        await this.update({ currentJob: job })
        await job.run(this.kodmq)
        await this.kodmq.adapter.saveJob(job, JobStatus.Completed)
      } catch (e) {
        job.failedAttempts += 1

        await this.kodmq.adapter.saveJob(job, JobStatus.Failed)
        await this.retry(job)
      } finally {
        await this.update({ currentJob: null })
      }
    }, () => this.isRunning)

    await this.kodmq.adapter.deleteWorker(this)
  }

  /**
   * Stop jobs processing
   */
  async stop() {
    await this.update({ isRunning: false })
  }

  /**
   * Update worker data and save it to the adapter
   *
   * @param attributes
   */
  async update(attributes: Partial<WorkerData> = {}) {
    Object.assign(this, attributes)
    await this.kodmq.adapter.saveWorker(this)
  }

  // TODO: Refactor and move it somewhere else
  /**
   * Retry job if applicable
   *
   * @param job
   */
  async retry(job: Job) {
    if (job.failedAttempts > (this.kodmq.config.maxRetries || 0)) return

    let runAt = Date.now()
    const { retryDelay, retryType } = this.kodmq.config

    if (typeof retryDelay === "number") {
      if (retryType === "exponential") {
        runAt += retryDelay * Math.pow(2, job.failedAttempts - 1)
      } else {
        runAt += retryDelay
      }
    } else if (Array.isArray(retryDelay)) {
      const retryDelayIndex = job.failedAttempts - 1
      const retryDelayValue = retryDelay[Math.min(retryDelayIndex, retryDelay.length - 1)]

      runAt += retryDelayValue
    } else if (typeof retryDelay === "function") {
      runAt += retryDelay(job)
    } else {
      throw new Error(`Invalid retryDelay: ${retryDelay}`)
    }

    await this.kodmq.adapter.pushJob(job, new Date(runAt))
  }
}
