import { JobStatus, Status, WorkerStatus } from "~/src/types"

export const Pending = 0
export const Scheduled = 1
export const Active = 2
export const Completed = 3
export const Failed = 4
export const Idle = 5
export const Stopping = 6
export const Stopped = 7

export const JobStatuses = [
  Pending,
  Scheduled,
  Active,
  Completed,
  Failed,
] as const

export const WorkerStatuses = [
  Idle,
  Active,
  Stopping,
  Stopped,
] as const

export const ReadableStatuses: Record<Status, string> = {
  [Pending]: "Pending",
  [Scheduled]: "Scheduled",
  [Active]: "Active",
  [Completed]: "Completed",
  [Failed]: "Failed",
  [Idle]: "Idle",
  [Stopping]: "Stopping",
  [Stopped]: "Stopped",
}

export const ReadableJobStatuses = JobStatuses.reduce((acc, status) => {
  acc[status] = ReadableStatuses[status]
  return acc
}, {} as Record<JobStatus, string>)

export const ReadableWorkerStatuses = WorkerStatuses.reduce((acc, status) => {
  acc[status] = ReadableStatuses[status]
  return acc
}, {} as Record<WorkerStatus, string>)
