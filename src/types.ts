export type StringKeyOf<T> = Extract<keyof T, string>

export type Handler = (data: JobData) => any | Promise<any>
export type Handlers = Record<JobName, Handler>

//
// Job
//

export type JobName = string
export type JobData = any

export enum JobStatus {
  Pending,
  Scheduled,
  Active,
  Completed,
  Failed,
}

//
// Worker
//

export enum WorkerStatus {
  Idle,
  Active,
  Stopping,
  Stopped,
}
