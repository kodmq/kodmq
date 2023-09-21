import { JobStatuses, WorkerStatuses } from "~/src/statuses"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any
export type StringKeyOf<T> = Extract<keyof T, string>

export type ID = string

export type Handler = (payload: JobPayload) => unknown | Promise<unknown>
export type Handlers = Record<JobName, Handler>

export type JobCallback = (job: Job) => void | Promise<void>
export type JobCallbackName =
  | "onJobPending"
  | "onJobScheduled"
  | "onJobActive"
  | "onJobCompleted"
  | "onJobFailed"
  | "onJobChanged"
  | "onScheduleJobRetry"

export type WorkerCallback = (worker: Worker) => void | Promise<void>
export type WorkerCallbackName =
  | "onWorkerIdle"
  | "onWorkerActive"
  | "onWorkerStopping"
  | "onWorkerStopped"
  | "onWorkerChanged"
  | "onWorkerCurrentJobChanged"

export type Callbacks = {
  [K in JobCallbackName]?: JobCallback
} & {
  [K in WorkerCallbackName]?: WorkerCallback
}

export type JobName = string
export type JobPayload = AllowedAny

export type JobStatus = typeof JobStatuses[number]
export type WorkerStatus = typeof WorkerStatuses[number]
export type Status = JobStatus | WorkerStatus

export type Worker = {
  id: ID
  status: WorkerStatus
  currentJob?: Pick<Job, "id" | "name" | "payload">
  startedAt?: Date
  stoppedAt?: Date
}

export type Job<T extends JobPayload = AllowedAny> = {
  id: ID
  status: JobStatus
  name: JobName
  payload: T
  runAt?: Date
  startedAt?: Date
  finishedAt?: Date
  failedAt?: Date
  failedAttempts?: number
  errorMessage?: string
  errorStack?: string
  retryJobId?: ID
}
