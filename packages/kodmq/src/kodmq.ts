import process from "process"
import Adapter from "./adapters/Adapter"
import RedisAdapter from "./adapters/RedisAdapter"
import { KodMQError } from "./errors"
import Jobs from "./jobs"
import { Handlers, Callbacks, WorkerStatus, CallbacksMap, Config } from "./types"
import Workers from "./workers"

const DefaultConfig: Omit<Config, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}

export type GetWorkersOptions = {
  status?: WorkerStatus
  limit?: number
  offset?: number
}

export default class KodMQ<THandlers extends Handlers = Handlers> {
  config: Config<THandlers>
  adapter: Adapter
  handlers: THandlers
  jobs: Jobs<THandlers>
  workers: Workers<THandlers>
  callbacks: Callbacks

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

    this.jobs = new Jobs(this)
    this.workers = new Workers(this)
  }

  /**
   * Stop all workers and close the connection
   */
  async stopAllAndCloseConnection() {
    try {
      await this.workers.stopAll()
    } catch (e) {
      throw new KodMQError("Failed to stop workers", e as Error)
    } finally {
      await this.adapter.closeConnection()
    }
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
   * Check if this is a KodMQ instance
   */
  isKodMQ() {
    return true
  }
}
