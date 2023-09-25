import Adapter from "./adapters/Adapter"
import { JobStatuses, WorkerStatuses } from "./constants"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any
export type StringKeyOf<T> = Extract<keyof T, string>

export type ID = string | number

export type Handler = (payload: JobPayload) => unknown | Promise<unknown>
export type Handlers = Record<JobName, Handler>

export type JobCallback = (job: Job) => void | Promise<void>
export type JobCallbackName =
  | "jobPending"
  | "jobScheduled"
  | "jobActive"
  | "jobCompleted"
  | "jobFailed"
  | "jobChanged"

export type WorkerCallback = (worker: Worker) => void | Promise<void>
export type WorkerCallbackName =
  | "workerStarted"
  | "workerIdle"
  | "workerActive"
  | "workerStopping"
  | "workerStopped"
  | "workerKilled"
  | "workerChanged"

export type CallbackName =
  | JobCallbackName
  | WorkerCallbackName
  | "scheduleJobRetry"

export type CallbacksMap = {
  [key in JobCallbackName]: JobCallback
} & {
  [key in WorkerCallbackName]: WorkerCallback
} & {
  scheduleJobRetry: (job: Job, retryAt: Date, failedJob: Job) => void | Promise<void>
}

export type Callbacks = Partial<{
  [key in CallbackName]: CallbacksMap[key][]
}>

// Make sure Callbacks has all the keys from CallbackName
// eslint-disable-next-line unused-imports/no-unused-vars
const CallbacksCheck: CallbackName extends StringKeyOf<Callbacks> ? true : false = true

export type JobName = string
export type JobPayload = AllowedAny

export type JobStatus = typeof JobStatuses[number]
export type WorkerStatus = typeof WorkerStatuses[number]
export type Status = JobStatus | WorkerStatus

export type Worker = {
  id: ID
  status: WorkerStatus
  clusterName?: string
  currentJob?: Pick<Job, "id" | "name" | "payload">
  startedAt?: Date
  stoppedAt?: Date
}

export type Job<T extends JobPayload = AllowedAny> = {
  id: ID
  workerId?: ID
  retryJobId?: ID
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
}

export type Config<
  THandlers extends Handlers = Handlers,
> = {
  adapter?: Adapter
  handlers?: THandlers
  callbacks?: Callbacks

  maxRetries?: number
  retryDelay?: number | number[] | ((job: Job) => number)
  retryType?: "fixed" | "exponential"

  stopTimeout?: number
}
