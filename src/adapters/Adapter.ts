import Job from "../Job.ts"
import { GetJobsOptions } from "../KodMQ.ts"

export type AdapterHandler = (job: Job) => Promise<void>
export type AdapterKeepSubscribed = () => boolean

export default abstract class Adapter {
  abstract pushJob(job: Job, runAt?: Date): Promise<void>
  abstract popJob(): Promise<Job | null>
  abstract subscribeToJobs(handler: AdapterHandler, keepAlive: AdapterKeepSubscribed): Promise<void>

  abstract getJobs(options: GetJobsOptions): Promise<Job[]>
  abstract clearAll(): Promise<void>
}
