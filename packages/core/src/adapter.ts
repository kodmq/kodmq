import {
  ID,
  Job,
  JobCreate,
  JobsAllOptions,
  JobUpdate,
  Thread, ThreadCreate, ThreadsAllOptions, ThreadUpdate,
  Worker,
  WorkerCreate,
  WorkersAllOptions,
  WorkerUpdate,
} from "./types.js"

export type AdapterHandler = (job: Job) => Promise<void>
export type AdapterKeepSubscribed = () => Promise<boolean>

export default abstract class Adapter {
  /**
   * Get all jobs from the database
   *
   * @param options
   */
  abstract getJobs(options: JobsAllOptions): Promise<Job[]>

  /**
   * Get a job from the database
   */
  abstract getJob(id: ID): Promise<Job | null | void>

  /**
   * Create job in the database
   */
  abstract createJob(attributes: JobCreate): Promise<Job>

  /**
   * Update job in the database
   *
   * @param id
   * @param attributes
   */
  abstract updateJob(id: ID, attributes: JobUpdate): Promise<Job>

  /**
   * Remove job from the database
   *
   * @param id
   * @param attributes
   */
  abstract removeJob(id: ID, attributes: JobUpdate): Promise<void>

  /**
   * Push a job to the queue
   *
   * @param id
   * @param runAt
   */
  abstract pushJobToQueue(id: ID, runAt?: Date): Promise<void>

  /**
   * Prepend a job to the queue
   *
   * @param id
   */
  abstract prependJobToQueue(id: ID): Promise<void>

  /**
   * Remove a jobs from the queue
   *
   * @param job
   */
  abstract removeJobFromQueue(job: Job): Promise<void>

  /**
   * Pop a job from the queue (including scheduled jobs)
   */
  abstract popJobFromQueue(): Promise<Job | null>

  /**
   * Subscribe to new jobs. It should be used to retrieve and run jobs from the queue.
   *
   * @param handler
   * @param keepSubscribed
   */
  abstract subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed): Promise<void>

  /**
   * Get all workers from the database
   */
  abstract getWorkers(options?: WorkersAllOptions): Promise<Worker[]>

  /**
   * Get worker from the database
   */
  abstract getWorker(id: ID): Promise<Worker | null>

  /**
   * Create worker in the database
   */
  abstract createWorker(attributes: WorkerCreate): Promise<Worker>

  /**
   * Update worker in the database
   *
   * @param id
   * @param attributes
   */
  abstract updateWorker(id: ID, attributes: WorkerUpdate): Promise<Worker>

  /**
   * Remove worker from the database
   */
  abstract removeWorker(id: ID): Promise<void>

  /**
   * Get all threads from the database
   */
  abstract getThreads(options?: ThreadsAllOptions): Promise<Thread[]>

  /**
   * Get thread from the database
   */
  abstract getThread(id: ID): Promise<Thread | null>

  /**
   * Create thread in the database
   */
  abstract createThread(attributes: ThreadCreate): Promise<Thread>

  /**
   * Update thread in the database
   *
   * @param id
   * @param attributes
   */
  abstract updateThread(id: ID, attributes: ThreadUpdate): Promise<Thread>

  /**
   * Remove thread from the database
   */
  abstract removeThread(id: ID): Promise<void>

  /**
   * Erase all data from the database
   */
  abstract clearAll(): Promise<void>

  /**
   * Manually open connection to the database
   */
  abstract openConnection(): Promise<void>

  /**
   * Close connection to the database
   */
  abstract closeConnection(): Promise<void>

  /**
   * Check if connection to the database is established
   */
  abstract isConnected(): Promise<boolean>

  /**
   * Send ping to the database
   */
  abstract ping(): Promise<unknown>

  /**
   * Check if adapter is KodMQ adapter
   */
  abstract isKodMQAdapter(): boolean
}
