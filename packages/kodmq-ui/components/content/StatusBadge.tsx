import { cva } from "class-variance-authority"
import { Statuses, ReadableStatuses } from "kodmq/constants"
import { Status } from "kodmq/types"
import { Badge } from "@/components/ui/badge"

export type StatusBadgeProps = {
  status: Status
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
  "inline-block w-2 h-2 rounded-full mr-1.5",
], {
  variants: {
    status: {
      [Statuses.Pending]: "bg-yellow-500",
      [Statuses.Scheduled]: "bg-blue-500",
      [Statuses.Active]: "bg-green-500",
      [Statuses.Completed]: "bg-green-500",
      [Statuses.Failed]: "bg-red-500",
      [Statuses.Idle]: "bg-sky-500",
      [Statuses.Stopping]: "bg-yellow-500",
      [Statuses.Stopped]: "bg-red-500",
      [Statuses.Killed]: "bg-red-500",
    },
  },
})
