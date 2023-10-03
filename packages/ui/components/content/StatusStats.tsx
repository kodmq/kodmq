import { JobStatuses, ReadableStatuses, WorkerStatuses } from "@kodmq/core/constants"
import { Job, Worker } from "@kodmq/core/types"
import Card from "@/components/ui/Card"
import { ExtendProps } from "@/lib/types"
import { cn, filter } from "@/lib/utils"

const GridClasses = {
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  7: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
}

export type StatusStatsProps<T extends Job | Worker> = ExtendProps<"div", {
  records: T[]
  type: T extends Job ? "job" : "worker"
  current?: T extends Job ? Job["status"] : Worker["status"]
  highlight?: boolean
}>

export default function StatusStats<T extends Job | Worker>({ records, type, current, highlight, className, ...props }: StatusStatsProps<T>) {
  const href = type === "job" ? "/jobs" : "/workers"
  const statuses = type === "job" ? JobStatuses : WorkerStatuses
  const cardsCount = statuses.length + 1

  return (
    <div
      className={cn("grid gap-4", GridClasses[cardsCount], className)}
      {...props}
    >
      <Card
        href={href}
        pattern={1}
        highlight={highlight && current === undefined}
      >
        <Card.Padding>
          <Card.Title>Total</Card.Title>
          <Card.Content className="text-4xl font-semibold text-black dark:text-white">
            {records.length}
          </Card.Content>
        </Card.Padding>
      </Card>

      {statuses.map((status, index) => (
        <Card
          key={status}
          href={`${href}?status=${status}`}
          pattern={index % 4}
          highlight={highlight && current === status}
        >
          <Card.Padding>
            <Card.Title>{ReadableStatuses[status]}</Card.Title>
            <Card.Content className="text-4xl font-semibold text-black dark:text-white">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              {filter(records, { status }).length}
            </Card.Content>
          </Card.Padding>
        </Card>
      ))}
    </div>
  )
}
