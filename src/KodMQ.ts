import Worker from "./Worker.ts"
import RedisAdapter from "./adapters/RedisAdapter.ts"
import { Handlers, JobStatus, StringKeyOf } from "./types.ts"
import { Config, DefaultConfig } from "./Config.ts"
import process from "process"
import Job from "./Job.ts"
import Adapter from "./adapters/Adapter.ts"

export type GetJobsOptions = {
  status?: JobStatus
  limit?: number
  offset?: number
}

export type StartOptions = {
  concurrency?: number
}

const DefaultConcurrency = parseInt(process.env.KODMQ_CONCURRENCY || "1")

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
  constructor(config: Config<TAdapter, THandlers>) {
    if (!config) throw new Error("KodMQ requires config")

    if (!config.handlers || Object.keys(config.handlers).length === 0) {
      throw new Error("KodMQ requires handlers")
    }

    if (config.adapter && !(config.adapter instanceof Adapter)) {
      throw new Error("KodMQ requires adapter to be an instance of Adapter")
    }

    this.config = { ...DefaultConfig, ...config }
    this.adapter = (config.adapter || new RedisAdapter()) as TAdapter
    this.handlers = config.handlers
  }

  /**
   * Push a job to the queue
   *
   * @param jobName
   * @param jobData
   */
  async perform<T extends StringKeyOf<THandlers>>(
    jobName: T,
    jobData: Parameters<THandlers[T]>[0]
  ) {
    const job = Job.create(jobName, jobData)
    await this.adapter.pushJob(job)

    return job
  }

  /**
   * Schedule a job to run at a specific time
   *
   * @param jobName
   * @param jobData
   * @param runAt
   */
  async schedule<T extends StringKeyOf<THandlers>>(
    jobName: T,
    jobData: Parameters<THandlers[T]>[0],
    runAt: Date
  ) {
    const job = Job.create(jobName, jobData)
    await this.adapter.pushJob(job, runAt)

    return job
  }

  /**
   * Get jobs from the queue
   *
   * @param options
   */
  async getJobs(options: GetJobsOptions = {}) {
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
    while (true) {
      const pendingJobs = await this.getJobs({ status: JobStatus.Pending })
      const scheduledJobs = await this.getJobs({ status: JobStatus.Scheduled })

      if (pendingJobs.length === 0 && scheduledJobs.length === 0) break

      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }

  /**
   * DANGER! This will clear all jobs and workers from the queue
   *
   * @param options
   */
  async clearAll(options: { iKnowWhatIAmDoing: boolean } = { iKnowWhatIAmDoing: false }) {
    if (!options.iKnowWhatIAmDoing && process.env.NODE_ENV === "production") {
      throw new Error("KodMQ.clearAll() is not allowed in production. If you really want to do this, run KodMQ.clearAll({ iKnowWhatIAmDoing: true })")
    }

    return this.adapter.clearAll()
  }

  /**
   * Start the queue
   *
   * @param options
   */
  start(options: StartOptions = {}) {
    const workers = []
    const concurrency = options.concurrency || DefaultConcurrency

    for (let i = 0; i < concurrency; i++) {
      const worker = new Worker(this)
      workers.push(worker.start())
      this.workers.push(worker)
    }

    return Promise.all(workers)
  }

  /**
   * Stop the queue
   */
  async stop() {
    for (const worker of this.workers) {
      await worker.stop()
    }
  }

  /**
   * Check if this is a KodMQ instance
   */
  isKodMQ() {
    return true
  }
}
