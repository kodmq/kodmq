import { Statuses, ReadableStatuses } from "@kodmq/core/constants"
import { Status } from "@kodmq/core/types"
import { cva } from "class-variance-authority"
import Badge from "@/components/ui/Badge"

export type StatusBadgeProps = {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="primary">
      <span className={indicatorVariants({ status })} />
      {ReadableStatuses[status]}
    </Badge>
  )
}

const indicatorVariants = cva([
  "mr-1.5 inline-block h-2 w-2 rounded-full",
], {
  variants: {
    status: {
      [Statuses.Pending]: "bg-yellow-500",
      [Statuses.Scheduled]: "bg-blue-500",
      [Statuses.Active]: "bg-green-500",
      [Statuses.Completed]: "bg-green-500",
      [Statuses.Failed]: "bg-red-500",
      [Statuses.Canceled]: "bg-red-500",
      [Statuses.Idle]: "bg-sky-500",
      [Statuses.Busy]: "bg-green-500",
      [Statuses.Stopping]: "bg-yellow-500",
      [Statuses.Stopped]: "bg-red-500",
      [Statuses.Killed]: "bg-red-500",
    },
  },
})
