import process from "process"
import Adapter from "./adapters/Adapter"
import RedisAdapter from "./adapters/RedisAdapter"
import { SaveJob } from "./commands/SaveJob"
import { SaveWorker } from "./commands/SaveWorker"
import { StartWorker } from "./commands/StartWorker"
import { StopWorker } from "./commands/StopWorker"
import { Idle, Pending, Scheduled } from "./constants"
import { KodMQError } from "./errors"
import { Handlers, Job, StringKeyOf, Worker, Callbacks, ID, JobStatus, WorkerStatus, CallbacksMap, Config } from "./types"

let DefaultConcurrency: number

try {
  DefaultConcurrency = parseInt(process.env.KODMQ_CONCURRENCY || "1")
} catch (e) {
  DefaultConcurrency = 1
}

const DefaultConfig: Omit<Config, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}

export type GetJobsOptions = {
  status?: JobStatus
  limit?: number
  offset?: number
}

export type GetWorkersOptions = {
  status?: WorkerStatus
  limit?: number
  offset?: number
}

export type StartOptions = {
  concurrency?: number
  clusterName?: string
}

export default class KodMQ<THandlers extends Handlers = Handlers> {
  config: Config<THandlers>
  adapter: Adapter
  handlers: THandlers
  callbacks: Callbacks

  workersIds: ID[] = []

  /**
   * Create a new KodMQ instance
   *
   * @param config
   */
  constructor(config: Config<THandlers> = {}) {
    if (config.adapter) {
      const isAdapter = config.adapter instanceof Adapter
      if (!isAdapter) throw new KodMQError("KodMQ requires adapter to be an instance of Adapter")
    }

    this.config = { ...DefaultConfig, ...config }
    this.adapter = config.adapter || new RedisAdapter()
    this.handlers = config.handlers || {} as THandlers
    this.callbacks = config.callbacks || {}
  }

  /**
   * Push a job to the queue
   *
   * @param name
   * @param payload
   * @param runAt
   */
  async perform<T extends StringKeyOf<THandlers>>(
    name: T,
    payload?: Parameters<THandlers[T]>[0],
    runAt?: Date,
  ) {
    try {
      const job = await this.createJob({
        name,
        payload,
        runAt,
      })

      await SaveJob.run({
        jobId: job.id,
        attributes: job,
        kodmq: this,
      })

      await this.adapter.pushJobToQueue(job.id, runAt)
      return job
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError(`Failed to perform job "${name}"`, e as Error)
    }
  }

  /**
   * Schedule a job to run at a specific time
   *
   * @param name
   * @param payload
   * @param runAt
   */
  async performAt<T extends StringKeyOf<THandlers>>(
    runAt: Date,
    name: T,
    payload?: Parameters<THandlers[T]>[0],
  ) {
    try {
      return this.perform(name, payload, runAt)
    } catch (e) {
      throw new KodMQError(`Failed to schedule job "${name}"`, e as Error)
    }
  }

  /**
   * Schedule a job to run after a specific delay
   *
   * @param delay
   * @param name
   * @param payload
   */
  async performIn<T extends StringKeyOf<THandlers>>(
    delay: number,
    name: T,
    payload?: Parameters<THandlers[T]>[0],
  ) {
    try {
      const runAt = new Date(Date.now() + delay)
      return this.perform(name, payload, runAt)
    } catch (e) {
      throw new KodMQError(`Failed to schedule job "${name}"`, e as Error)
    }
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
   * Get a specific job
   *
   * @param id
   */
  async getJob(id: ID) {
    return this.adapter.getJob(id)
  }

  /**
   * Get workers
   */
  async getWorkers(options: GetWorkersOptions = {}) {
    return this.adapter.getWorkers(options)
  }

  /**
   * Get a specific worker
   */
  async getWorker(id: ID) {
    return this.adapter.getWorker(id)
  }

  /**
   * Start the queue
   *
   * @param options
   */
  async start(options: StartOptions = {}) {
    if (this.workersIds.length > 0) throw new KodMQError("KodMQ is already started")
    if (Object.keys(this.handlers).length === 0) throw new KodMQError("KodMQ requires at least one handler to start")

    try {
      const promises = []
      const concurrency = options.concurrency || DefaultConcurrency

      for (let i = 0; i < concurrency; i++) {
        const worker = await this.createWorker({ clusterName: options.clusterName })
        this.workersIds.push(worker.id)

        await SaveWorker.run({
          workerId: worker.id,
          attributes: worker,
          kodmq: this,
        })

        promises.push(this.startWorker(worker))
      }

      return Promise.all(promises)
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to start queue", e as Error)
    }
  }

  /**
   * Start a worker
   *
   * @param worker
   */
  async startWorker(worker: Worker) {
    await StartWorker.run({ worker, kodmq: this })
  }

  /**
   * Stop specific worker
   *
   * @param id
   */
  async stopWorker(id: ID) {
    await StopWorker.run({ id, kodmq: this })
  }

  /**
   * Wait until all jobs are completed
   *
   * @param interval
   */
  async waitUntilAllJobsCompleted(interval = 300) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const pendingJobs = await this.getJobs({ status: Pending })
        const scheduledJobs = await this.getJobs({ status: Scheduled })

        if (pendingJobs.length === 0 && scheduledJobs.length === 0) break

        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to wait until all jobs are completed", e as Error)
    }
  }

  /**
   * Wait until all workers are stopped
   */
  async waitUntilAllWorkersStopped(interval = 300) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!await this.adapter.isConnected()) break

        let allStopped = true

        for (const id of this.workersIds) {
          const worker = await this.getWorker(id)

          if (worker?.status !== Idle) {
            allStopped = false
            break
          }
        }

        if (allStopped) break

        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQError("Failed to wait until all workers are stopped", e as Error)
    }
  }

  /**
   * Stop all workers
   */
  async stopAllAndCloseConnection() {
    try {
      const promises = []

      for (const id of this.workersIds) {
        promises.push(this.stopWorker(id))
      }

      await Promise.all(promises)
    } catch (e) {
      throw new KodMQError("Failed to stop queue", e as Error)
    } finally {
      await this.adapter.closeConnection()
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
   * Register a callback
   *
   * @param callbackName
   * @param callback
   */
  on<T extends keyof CallbacksMap>(callbackName: T, callback: CallbacksMap[T]) {
    if (!this.callbacks[callbackName]) this.callbacks[callbackName] = []
    this.callbacks[callbackName]?.push(callback)
  }

  /**
   * Run a specific callback
   *
   * @param callbackName
   * @param args
   * @protected
   */
  async runCallbacks<T extends keyof CallbacksMap>(callbackName: T, ...args: Parameters<CallbacksMap[T]>) {
    const callbacks = this.callbacks[callbackName]
    if (!callbacks) return

    const promises = []

    for (const callback of callbacks) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      promises.push(callback(...args))
    }

    await Promise.all(promises)
  }

  /**
   * Check if this is a KodMQ instance
   */
  isKodMQ() {
    return true
  }

  /**
   * Create a new worker using the adapter
   *
   * @param attributes
   * @private
   */
  private async createWorker(attributes: Pick<Worker, "clusterName">): Promise<Worker> {
    return {
      ...attributes,
      id: await this.adapter.getNextWorkerId(),
      status: Idle,
    }
  }

  /**
   * Create a new job using the adapter
   *
   * @param attributes
   * @private
   */
  private async createJob(attributes: Omit<Job, "id" | "status">): Promise<Job> {
    return {
      ...attributes,
      id: await this.adapter.getNextJobId(),
      status: attributes.runAt ? Scheduled : Pending,
    }
  }
}
