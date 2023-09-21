import { JobStatuses, WorkerStatuses } from "~/src/statuses"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any
export type StringKeyOf<T> = Extract<keyof T, string>

export type Handler = (payload: JobPayload) => unknown | Promise<unknown>
export type Handlers = Record<JobName, Handler>

export type JobCallbackName = "onJobActive" | "onJobCompleted" | "onJobFailed" | "onScheduleJobRetry"
export type JobCallback = (job: Job) => void | Promise<void>

export type WorkerCallbackName = "onWorkerIdle" | "onWorkerActive" | "onWorkerStopping" | "onWorkerStopped" | "onWorkerChanged" | "onWorkerCurrentJobChanged"
export type WorkerCallback = (worker: Worker) => void | Promise<void>

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
  id: string | number
  status: WorkerStatus
  currentJob?: Job
  startedAt?: Date
  stoppedAt?: Date
}

export type Job<T extends JobPayload = AllowedAny> = {
  id: string | number
  name: JobName
  payload: T
  runAt?: Date
  startedAt?: Date
  finishedAt?: Date
  failedAt?: Date
  failedAttempts?: number
  errorMessage?: string
  errorStack?: string
  retryJobId?: string | number
}
