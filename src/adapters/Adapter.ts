import Job from "../Job.ts"
import { GetJobsOptions } from "../KodMQ.ts"
import Worker, { WorkerData } from "../Worker.ts"
import { JobStatusHistory } from "../types.ts"

export type AdapterHandler = (job: Job) => Promise<void>
export type AdapterKeepSubscribed = () => boolean

export default abstract class Adapter {
  /**
   * Get all jobs from the database
   *
   * @param options
   */
  abstract getJobs(options: GetJobsOptions): Promise<Job[]>

  /**
   * Save a job to the database. This method is used only to store historical information about job.
   * Do not use it to push a job to the queue.
   *
   * @param job
   * @param status
   */
  abstract saveJob(job: Job, status: JobStatusHistory): Promise<void>

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
   * Get all workers from the database
   */
  abstract getWorkers(): Promise<WorkerData[]>

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
  abstract deleteWorker(worker: Worker): Promise<void>

  /**
   * Erase all data from the database
   */
  abstract clearAll(): Promise<void>
}
