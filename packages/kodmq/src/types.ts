export type StringKeyOf<T> = Extract<keyof T, string>

export type Handler = (data: JobData) => any | Promise<any>
export type Handlers = Record<JobName, Handler>

export type JobName = string
export type JobData = any

export const Pending = 0
export const Scheduled = 1
export const Active = 2
export const Completed = 3
export const Failed = 4

export const Idle = 5
export const Stopping = 6
export const Stopped = 7

export type JobStatus =
  | typeof Pending
  | typeof Scheduled
  | typeof Active
  | typeof Completed
  | typeof Failed

export type WorkerStatus =
  | typeof Idle
  | typeof Active
  | typeof Stopping
  | typeof Stopped
