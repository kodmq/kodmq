import { cva } from "class-variance-authority"
import {
  Active,
  Completed,
  Failed,
  Idle,
  JobStatus,
  Pending,
  ReadableStatuses,
  Scheduled,
  Stopped,
  Stopping,
  WorkerStatus,
} from "kodmq"
import { Badge } from "@/components/ui/badge"

export type StatusBadgeProps = {
  status: JobStatus | WorkerStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="secondary">
      <span className={indicatorVariants({ status })} />
      {ReadableStatuses[status]}
    </Badge>
  )
}

const indicatorVariants = cva([
  "inline-block w-2 h-2 rounded-full mr-1",
], {
  variants: {
    status: {
      [Pending]: "bg-yellow-500",
      [Scheduled]: "bg-blue-500",
      [Active]: "bg-green-500",
      [Completed]: "bg-green-500",
      [Failed]: "bg-red-500",
      [Idle]: "bg-gray-500",
      [Stopping]: "bg-yellow-500",
      [Stopped]: "bg-red-500",
    },
  },
})
