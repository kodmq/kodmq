import { GetJobsOptions, GetWorkersOptions } from "~/src/KodMQ"
import { Job, JobStatus, Worker } from "~/src/types"

export type AdapterHandler = (job: Job) => Promise<void>
export type AdapterKeepSubscribed = () => Promise<boolean>

export default abstract class Adapter {
  /**
   * Get next job ID
   */
  abstract getNextJobId(): Promise<number>

  /**
   * Get all jobs from the database
   *
   * @param options
   */
  abstract getJobs(options: GetJobsOptions): Promise<Job[]>

  /**
   * Get a job from the database
   */
  abstract getJob(id: number | string): Promise<Job | null | void>

  /**
   * Get a job from the database based on status
   */
  abstract getJobFrom(id: number | string, status: JobStatus): Promise<Job | null>

  /**
   * Save a job to the database. This method is used only to store historical information about job.
   * Do not use it to push a job to the queue.
   *
   * @param job
   * @param status
   */
  abstract saveJobTo(job: Job, status: JobStatus): Promise<void>

  /**
   * Delete a job from the database
   */
  abstract removeJobFrom(job: Job, status: JobStatus): Promise<void>

  /**
   * Push a job to the queue
   *
   * @param job
   * @param runAt
   */
  abstract pushJob(job: Job, runAt?: Date): Promise<void>

  /**
   * Pop a job from the queue (including scheduled jobs)
   */
  abstract popJob(): Promise<Job | null>

  /**
   * Subscribe to new jobs. It should be used to retrieve and run jobs from the queue.
   *
   * @param handler
   * @param keepAlive
   */
  abstract subscribeToJobs(handler: AdapterHandler, keepAlive: AdapterKeepSubscribed): Promise<void>

  /**
   * Get next worker ID
   */
  abstract getNextWorkerId(): Promise<number>

  /**
   * Get all workers from the database
   */
  abstract getWorkers(options?: GetWorkersOptions): Promise<Worker[]>

  /**
   * Get a worker from the database
   */
  abstract getWorker(id: number | string): Promise<Worker | null>

  /**
   * Create or update a worker in the database
   * @param worker
   */
  abstract saveWorker(worker: Worker): Promise<void>

  /**
   * Delete a worker from the database
   *
   * @param worker
   */
  abstract removeWorker(worker: Worker): Promise<void>

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
}
