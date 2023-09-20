import { KodMQError } from "@/errors"
import Job from "@/Job"
import KodMQ from "@/KodMQ"
import { Active, Completed, Failed, Idle, Stopped, Stopping } from "@/statuses"
import { WorkerStructure, WorkerStatus } from "@/types"

export default class Worker<TKodMQ extends KodMQ = KodMQ> {
  id: string | number
  status: WorkerStatus = Idle
  startedAt: Date
  currentJob: Job | null = null

  kodmq: TKodMQ

  constructor(id: string | number, kodmq: TKodMQ) {
    this.id = id
    this.startedAt = new Date()

    this.kodmq = kodmq

  }

  /**
   * Start jobs processing
   */
  async start() {
    await this.update({ status: Active })

    await this.kodmq.adapter.subscribeToJobs(async (job) => {
      if (this.status !== Active) return

      try {
        await this.update({ currentJob: job })
        await job.run(this.kodmq)
        await this.kodmq.adapter.saveJob(job, Completed)
      } catch (e) {
        job.failedAttempts += 1

        await this.kodmq.adapter.saveJob(job, Failed)
        await this.retry(job)
      } finally {
        await this.update({ currentJob: null })
      }
    }, () => this.status === Active)

    await this.update({ status: Stopped })
    await this.kodmq.adapter.deleteWorker(this)
  }

  /**
   * Stop jobs processing
   */
  async stop() {
    await this.update({ status: Stopping })
  }

  /**
   * Wait for stopped status
   */
  async waitForStatus(status: WorkerStatus, timeout: number = 50) {
    while (this.status !== status) {
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
  }

  /**
   * Update worker data and save it to the adapter
   *
   * @param attributes
   */
  async update(attributes: Partial<WorkerStructure> = {}) {
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
      throw new KodMQError(`Invalid retryDelay: ${retryDelay}`)
    }

    await this.kodmq.adapter.pushJob(job, new Date(runAt))
  }

  /**
   * Create worker instance
   */
  static async create<TKodMQ extends KodMQ = KodMQ>(kodmq: TKodMQ) {
    const id = await kodmq.adapter.getNextWorkerId()
    const worker = new Worker<TKodMQ>(id, kodmq)

    await kodmq.adapter.saveWorker(worker)

    return worker
  }
}
