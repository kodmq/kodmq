export type Handler = (data: JobData) => void | Promise<void>
export type Handlers = Record<JobName, Handler>

export type JobName = string
export type JobData = any

export enum JobStatus {
  Pending,
  Scheduled,
  Active,
  Completed,
  Failed,
}

export type StringKeyOf<T> = Extract<keyof T, string>
