import Adapter from "./adapters/Adapter"
import { StartWorker } from "./commands/StartWorker"
import { StopWorker } from "./commands/StopWorker"
import { Busy, Idle, Killed, Stopped, Stopping } from "./constants"
import { KodMQError } from "./errors"
import KodMQ from "./kodmq"
import { Handlers, ID, Worker, WorkerCallbackName, WorkerCreate, WorkerStatus, WorkerUpdate } from "./types"

const StatusCallbacks: Record<WorkerStatus, WorkerCallbackName> = {
  [Idle]: "workerIdle",
  [Busy]: "workerBusy",
  [Stopping]: "workerStopping",
  [Stopped]: "workerStopped",
  [Killed]: "workerKilled",
}

export type WorkersAllOptions = {
  status?: WorkerStatus
  limit?: number
  offset?: number
}

export type StartOptions = {
  concurrency?: number
  clusterName?: string
}

export default class Workers<THandlers extends Handlers = Handlers> {
  kodmq: KodMQ<THandlers>
  adapter: Adapter

  startedIds: ID[] = []

  constructor(kodmq: KodMQ<THandlers>) {
    this.kodmq = kodmq
    this.adapter = kodmq.adapter
  }

  /**
   * Get workers from the queue
   *
   * @param options
   */
  async all(options: WorkersAllOptions = {}) {
    return this.adapter.getWorkers(options)
  }

  /**
   * Get specific worker
   *
   * @param id
   */
  async find(id: ID) {
    return this.adapter.getWorker(id)
  }

  /**
   * Create a new worker
   *
   * @param attributes
   */
  async create(attributes: WorkerCreate): Promise<Worker> {
    const worker = await this.adapter.createWorker(attributes)

    await this.kodmq.runCallbacks("workerCreated", worker)
    await this.kodmq.runCallbacks(StatusCallbacks[attributes.status], worker)

    return worker
  }

  /**
   * Update worker
   */
  async update(id: ID, attributes: WorkerUpdate): Promise<Worker> {
    const worker = await this.adapter.updateWorker(id, attributes)

    await this.kodmq.runCallbacks("workerUpdated", worker)
    if (attributes.status !== undefined) await this.kodmq.runCallbacks(StatusCallbacks[attributes.status], worker)

    return worker
  }

  /**
   * Start workers
   *
   * @param options
   */
  async start(options: StartOptions = {}) {
    if (this.startedIds.length > 0) throw new KodMQError("Workers are already started")
    if (Object.keys(this.kodmq.handlers).length === 0) throw new KodMQError("At least one handler is required to start workers")

    try {
      const promises = []
      const concurrency = options.concurrency ?? 1

      for (let i = 0; i < concurrency; i++) {
        const worker = await this.create({ status: Idle, clusterName: options.clusterName })
        this.startedIds.push(worker.id)

        promises.push(StartWorker.run({ worker: worker, kodmq: this.kodmq }))
      }

      return Promise.all(promises)
    } catch (e) {
      throw new KodMQError("Failed to start workers", e as Error)
    }
  }


  /**
   * Stop specific worker
   *
   * @param id
   */
  async stop(id: ID) {
    try {
      await StopWorker.run({ id, kodmq: this.kodmq })
      this.startedIds = this.startedIds.filter((startedId) => startedId !== id)
    } catch (e) {
      throw new KodMQError(`Failed to stop worker ${id}`, e as Error)
    }
  }

  /**
   * Stop all workers
   */
  async stopAll() {
    try {
      const promises = []

      for (const id of this.startedIds) {
        promises.push(this.stop(id))
      }

      await Promise.all(promises)
    } catch (e) {
      throw new KodMQError("Failed to stop all workers", e as Error)
    }
  }

  /**
   * Wait until all workers are in a specific status
   */
  async waitUntilAllInStatus(status: WorkerStatus, interval = 300) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!await this.adapter.isConnected()) break

        let allInStatus = true

        for (const id of this.startedIds) {
          const worker = await this.find(id)
          if (!worker) continue

          if (worker.status !== status) {
            allInStatus = false
            break
          }
        }

        if (allInStatus) break

        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    } catch (e) {
      throw new KodMQError("Failed to wait until all workers are stopped", e as Error)
    }
  }
}
