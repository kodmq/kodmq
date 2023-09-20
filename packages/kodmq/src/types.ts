import { JobStatuses, WorkerStatuses } from "@/statuses"

export type StringKeyOf<T> = Extract<keyof T, string>

export type Handler = (data: JobData) => any | Promise<any>
export type Handlers = Record<JobName, Handler>

export type JobName = string
export type JobData = any

export type JobStatus = typeof JobStatuses[number]
export type WorkerStatus = typeof WorkerStatuses[number]

export type WorkerStructure = {
  id: string | number
  startedAt: Date
  status: WorkerStatus
  currentJob: JobStructure | null
}

export type JobStructure<T extends JobData = any> = {
  id: string | number
  name: JobName
  data: T
  failedAttempts: number
  errorMessage: string | null
  errorStack: string | null
}
