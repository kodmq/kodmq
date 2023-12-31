import process from "process"
import Adapter from "./adapter.js"
import { KodMQError } from "./errors.js"
import Jobs from "./jobs.js"
import { Handlers, CallbacksMap, Config, CallbacksArrayOnly } from "./types.js"
import Workers from "./workers.js"

const DefaultConfig: Omit<Config, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}

type StopAllOptions = {
  closeConnection?: boolean
}

export default class KodMQ<THandlers extends Handlers = Handlers> {
  config: Config<THandlers>
  adapter: Adapter
  handlers: THandlers
  jobs: Jobs<THandlers>
  workers: Workers<THandlers>
  callbacks: CallbacksArrayOnly

  /**
   * Create a new KodMQ instance
   *
   * @param config
   */
  constructor(config: Config<THandlers>) {
    if (!config) throw new KodMQError("Config is required")

    if (config.adapter) {
      try {
        config.adapter.isKodMQAdapter()
      } catch (e) {
        throw new KodMQError("Adapter must be an instance of Adapter")
      }
    }

    this.config = { ...DefaultConfig, ...config }
    this.adapter = config.adapter
    this.handlers = config.handlers ?? {} as THandlers
    this.callbacks = {}

    this.jobs = new Jobs<THandlers>(this)
    this.workers = new Workers<THandlers>(this)

    // Convert callbacks to array
    for (const callbackKey of Object.keys(this.config.callbacks ?? {})) {
      const key = callbackKey as keyof CallbacksMap
      const isArray = Array.isArray(this.config.callbacks![key])
      const callbacks = this.config.callbacks![key]

      this.callbacks[key] = []
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.callbacks[key].push(...(isArray ? callbacks : [callbacks]))
    }
  }

  /**
   * Stop all workers and close the connection
   */
  async stopAll(options: StopAllOptions = {}) {
    try {
      await this.workers.stopAll()
    } catch (e) {
      throw new KodMQError("Failed to stop workers", e as Error)
    } finally {
      if (options.closeConnection ?? true) await this.adapter.closeConnection()
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
    this.callbacks[callbackName]!.push(callback)
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
   * Open the connection
   */
  async openConnection() {
    return this.adapter.openConnection()
  }

  /**
   * Close the connection
   */
  async closeConnection() {
    return this.adapter.closeConnection()
  }

  /**
   * Check if connection is open
   */
  async isConnected() {
    return this.adapter.isConnected()
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
