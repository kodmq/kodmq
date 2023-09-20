import process from "process"
import Adapter from "@/adapters/Adapter"
import RedisAdapter from "@/adapters/RedisAdapter"
import { Config, DefaultConfig } from "@/Config"
import { KodMQError } from "@/errors"
import Job from "@/Job"
import { Pending, Scheduled, Stopped } from "@/statuses"
import { Handlers, JobStatus, StringKeyOf } from "@/types"
import Worker from "@/Worker"

export type GetJobsOptions = {
  status: JobStatus
  limit?: number
  offset?: number
}

export type StartOptions = {
  concurrency?: number
}

const DefaultConcurrency = parseInt(process?.env?.KODMQ_CONCURRENCY || "1")

export default class KodMQ<
  TAdapter extends Adapter = Adapter,
  THandlers extends Handlers = Handlers
> {
  config: Config<TAdapter, THandlers>
  adapter: TAdapter
  handlers: THandlers

  workers: Worker<this>[] = []

  /**
   * Create a new KodMQ instance
   *
   * @param config
   */
  constructor(config: Config<TAdapter, THandlers> = {}) {
    if (config.adapter) {
      const isAdapter = config.adapter instanceof Adapter
      if (!isAdapter) throw new KodMQError("KodMQ requires adapter to be an instance of Adapter")
    }

    this.config = { ...DefaultConfig, ...config }
    this.adapter = (config.adapter || new RedisAdapter()) as TAdapter
    this.handlers = config.handlers || {} as THandlers
  }

  /**
   * Push a job to the queue
   *
   * @param jobName
   * @param jobData
   */
  async perform<T extends StringKeyOf<THandlers>>(
    jobName: T,
    jobData?: Parameters<THandlers[T]>[0]
  ) {
    try {
      const job = await Job.create(jobName, jobData, this)
      await this.adapter.pushJob(job)

      return job
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError(`Failed to perform job "${jobName}"`, e as Error)
    }
  }

  /**
   * Schedule a job to run at a specific time
   *
   * @param jobName
   * @param jobData
   * @param runAt
   */
  async schedule<T extends StringKeyOf<THandlers>>(
    runAt: Date,
    jobName: T,
    jobData?: Parameters<THandlers[T]>[0],
  ) {
    try {
      const job = await Job.create(jobName, jobData, this)
      await this.adapter.pushJob(job, runAt)

      return job
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError(`Failed to schedule job "${jobName}"`, e as Error)
    }
  }

  /**
   * Get jobs from the queue
   *
   * @param options
   */
  async getJobs(options: GetJobsOptions) {
    return this.adapter.getJobs(options)
  }

  /**
   * Get workers
   */
  async getWorkers() {
    return this.adapter.getWorkers()
  }

  /**
   * Wait until all jobs are completed
   *
   * @param timeout
   */
  async waitUntilAllJobsCompleted(timeout: number = 0) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const pendingJobs = await this.getJobs({ status: Pending })
        const scheduledJobs = await this.getJobs({ status: Scheduled })

        if (pendingJobs.length === 0 && scheduledJobs.length === 0) break

        await new Promise((resolve) => setTimeout(resolve, timeout))
      }
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to wait until all jobs are completed", e as Error)
    }
  }

  /**
   * DANGER! This will clear all jobs and workers from the queue
   *
   * @param options
   */
  async clearAll(options: { iKnowWhatIAmDoing: boolean } = { iKnowWhatIAmDoing: false }) {
    if (!options.iKnowWhatIAmDoing && process.env.NODE_ENV === "production") {
      throw new KodMQError("KodMQ.clearAll() is not allowed in production. If you really want to do this, run KodMQ.clearAll({ iKnowWhatIAmDoing: true })")
    }

    return this.adapter.clearAll()
  }

  /**
   * Start the queue
   *
   * @param options
   */
  async start(options: StartOptions = {}) {
    if (this.workers.length > 0) throw new KodMQError("KodMQ is already started")
    if (Object.keys(this.handlers).length === 0) throw new KodMQError("KodMQ requires at least one handler to start")

    try {
      const promises = []
      const concurrency = options.concurrency || DefaultConcurrency

      for (let i = 0; i < concurrency; i++) {
        const worker = await Worker.create(this)
        this.workers.push(worker)

        promises.push(worker.start())
      }

      return Promise.all(promises)
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to start queue", e as Error)
    }
  }

  /**
   * Stop the queue
   */
  async stop() {
    try {
      const promises = []

      for (const worker of this.workers) {
        promises.push(worker.stop())
        promises.push(worker.waitForStatus(Stopped))
      }

      await Promise.all(promises)
      await this.adapter.closeConnection()
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to stop queue", e as Error)
    }
  }

  /**
   * Check if this is a KodMQ instance
   */
  isKodMQ() {
    return true
  }
}
