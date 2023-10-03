import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "./adapter.js"
import { Active, Canceled, Completed, Failed, JobFinishedStatuses, Pending, Scheduled } from "./constants.js"
import { KodMQError } from "./errors.js"
import KodMQ from "./kodmq.js"
import { Handlers, ID, Job, JobCallbackName, JobCreate, JobsAllOptions, JobStatus, JobUpdate, StringKeyOf } from "./types.js"

const StatusCallbacks: Record<JobStatus, JobCallbackName> = {
  [Pending]: "jobPending",
  [Scheduled]: "jobScheduled",
  [Active]: "jobActive",
  [Completed]: "jobCompleted",
  [Failed]: "jobFailed",
  [Canceled]: "jobCanceled",
}

export default class Jobs<THandlers extends Handlers = Handlers> {
  kodmq: KodMQ<THandlers>
  adapter: Adapter

  constructor(kodmq: KodMQ<THandlers>) {
    this.kodmq = kodmq
    this.adapter = kodmq.adapter
  }

  /**
   * Get jobs from the queue
   *
   * @param options
   */
  async all(options: JobsAllOptions = {}) {
    return this.adapter.getJobs(options)
  }

  /**
   * Get specific job
   *
   * @param id
   */
  async find(id: ID) {
    return this.adapter.getJob(id)
  }

  /**
   * Create a new job
   *
   * @param attributes
   */
  async create(attributes: JobCreate): Promise<Job> {
    const job = await this.adapter.createJob(attributes)

    await this.kodmq.runCallbacks("jobCreated", job)
    await this.kodmq.runCallbacks(StatusCallbacks[attributes.status], job)

    return job
  }

  /**
   * Update job
   */
  async update(id: ID, attributes: JobUpdate): Promise<Job> {
    const job = await this.adapter.updateJob(id, attributes)

    await this.kodmq.runCallbacks("jobUpdated", job)
    if (attributes.status !== undefined) await this.kodmq.runCallbacks(StatusCallbacks[attributes.status], job)

    return job
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
      const job = await this.create({
        name,
        payload,
        runAt, status: runAt ? Scheduled : Pending,
      })

      await this.pushToQueue(job.id, runAt)

      return job
    } catch (e) {
      throw new KodMQError(`Failed to perform job "${name}" with payload ${JSON.stringify(payload)}`, e as Error)
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
    payload?: Parameters<THandlers[T]>[0]
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
   * Boost job priority to the top of the queue
   *
   * @param id
   */
  async boost(id: ID) {
    try {
      const job = await this.find(id)
      if (!job) throw new KodMQError(`Job with ID ${id} not found`)

      await this.adapter.removeJobFromQueue(job)
      await this.adapter.prependJobToQueue(job.id)
    } catch (e) {
      throw new KodMQError("Failed to boost job", e as Error)
    }
  }

  /**
   * Push to queue
   *
   * @param id
   * @param runAt
   */
  async pushToQueue(id: ID, runAt?: Date) {
    try {
      await this.adapter.pushJobToQueue(id, runAt)
    } catch (e) {
      throw new KodMQError("Failed to push job to queue", e as Error)
    }
  }

  /**
   * Prepend to queue
   *
   * @param id
   */
  async prependToQueue(id: ID) {
    try {
      await this.adapter.prependJobToQueue(id)
    } catch (e) {
      throw new KodMQError("Failed to prepend job to queue", e as Error)
    }
  }

  /**
   * Subscribe to jobs to be run
   *
   * @param handler
   * @param keepSubscribed
   */
  async subscribe(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    try {
      await this.kodmq.adapter.subscribeToJobs(handler, keepSubscribed)
    } catch (e) {
      throw new KodMQError("Failed to subscribe to jobs", e as Error)
    }
  }

  /**
   * Wait until all jobs are finished
   *
   * @param options
   */
  async waitUntilAllFinished(options: { interval?: number } = {}) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const jobs = await this.all()
        const isFinished = jobs.every((job) => JobFinishedStatuses.includes(job.status))

        if (isFinished) break

        await new Promise((resolve) => setTimeout(resolve, options.interval ?? 300))
      }
    } catch (e) {
      throw new KodMQError("Failed to wait until all jobs are completed", e as Error)
    }
  }
}
