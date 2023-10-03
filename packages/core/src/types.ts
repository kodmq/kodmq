import Adapter from "./adapter.js"
import { Idle, JobStatuses, Pending, Scheduled, WorkerStatuses } from "./constants.js"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any
export type StringKeyOf<T> = Extract<keyof T, string>

export type ID = string | number

export type Handler = (payload: JobPayload) => unknown | Promise<unknown>
export type Handlers = Record<JobName, Handler>

export type JobCallback = (job: Job) => void | Promise<void>
export type JobCallbackName =
  | "jobCreated"
  | "jobUpdated"
  | "jobPending"
  | "jobScheduled"
  | "jobActive"
  | "jobCompleted"
  | "jobFailed"
  | "jobCanceled"

export type WorkerCallback = (worker: Worker) => void | Promise<void>
export type WorkerCallbackName =
  | "workerCreated"
  | "workerUpdated"
  | "workerStarted"
  | "workerIdle"
  | "workerBusy"
  | "workerStopping"
  | "workerStopped"
  | "workerKilled"

export type CallbackName =
  | JobCallbackName
  | WorkerCallbackName
  | "jobScheduledRetry"

export type CallbacksMap = {
  [key in JobCallbackName]: JobCallback
} & {
  [key in WorkerCallbackName]: WorkerCallback
} & {
  jobScheduledRetry: (job: Job, retryAt: Date, failedJob: Job) => void | Promise<void>
}

export type Callbacks = Partial<{
  [key in CallbackName]: CallbacksMap[key] | CallbacksMap[key][]
}>

export type CallbacksArrayOnly = Partial<{
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

export type WorkerCreate = Omit<Worker, "id" | "status"> & {
  status: Extract<WorkerStatus, typeof Idle>
}

export type WorkerUpdate = Omit<Partial<Worker>, "id">

export type Job = {
  id: ID
  workerId?: ID
  retryJobId?: ID
  status: JobStatus
  name: JobName
  payload: AllowedAny
  createdAt: Date
  runAt?: Date
  startedAt?: Date
  finishedAt?: Date
  failedAt?: Date
  failedAttempts?: number
  errorMessage?: string
  errorStack?: string
}

export type JobCreate = Omit<Job, "id" | "status" | "createdAt"> & {
  status: Extract<JobStatus, typeof Pending | typeof Scheduled>
}

export type JobUpdate = Omit<Partial<Job>, "id">

export type Config<THandlers extends Handlers = Handlers> = {
  adapter: Adapter
  handlers?: THandlers
  callbacks?: Callbacks

  maxRetries?: number
  retryDelay?: number | number[] | ((job: Job) => number)
  retryType?: "fixed" | "exponential"

  stopTimeout?: number
}

export type WorkersAllOptions = {
  status?: WorkerStatus
  limit?: number
  offset?: number
}

export type WorkersStartOptions = {
  concurrency?: number
  clusterName?: string
}

export type JobsAllOptions = {
  status?: JobStatus
  limit?: number
  offset?: number
}
