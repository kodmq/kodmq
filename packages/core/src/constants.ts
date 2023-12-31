import { JobStatus, Status, WorkerStatus } from "./types.js"

export const Pending = 0
export const Scheduled = 1
export const Active = 2
export const Completed = 3
export const Failed = 4
export const Canceled = 5
export const Idle = 6
export const Busy = 7
export const Stopping = 8
export const Stopped = 9
export const Killed = 10

export const Statuses = {
  Pending,
  Scheduled,
  Active,
  Completed,
  Failed,
  Canceled,
  Idle,
  Busy,
  Stopping,
  Stopped,
  Killed,
} as const

export const JobStatuses = [
  Pending,
  Scheduled,
  Active,
  Completed,
  Failed,
  Canceled,
] as const

// TODO: Add `as const` and fix all the errors
export const JobFinishedStatuses = [
  Completed,
  Failed,
  Canceled,
]

export const WorkerStatuses = [
  Idle,
  Busy,
  Stopping,
  Stopped,
  Killed,
] as const

// TODO: Add `as const` and fix all the errors
export const WorkerActiveStatuses = [
  Idle,
  Busy,
]

export const ReadableStatuses: Record<Status, string> = {
  [Pending]: "Pending",
  [Scheduled]: "Scheduled",
  [Active]: "Active",
  [Completed]: "Completed",
  [Failed]: "Failed",
  [Canceled]: "Canceled",
  [Idle]: "Idle",
  [Busy]: "Busy",
  [Stopping]: "Stopping",
  [Stopped]: "Stopped",
  [Killed]: "Killed",
}

export const ReadableJobStatuses = JobStatuses.reduce((acc, status) => {
  acc[status] = ReadableStatuses[status]
  return acc
}, {} as Record<JobStatus, string>)

export const ReadableWorkerStatuses = WorkerStatuses.reduce((acc, status) => {
  acc[status] = ReadableStatuses[status]
  return acc
}, {} as Record<WorkerStatus, string>)
