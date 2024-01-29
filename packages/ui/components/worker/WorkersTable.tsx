import { Busy, Idle, Killed, ReadableStatuses, Stopping } from "@kodmq/core/constants"
import { Worker, WorkerStatus } from "@kodmq/core/types"
import Link from "next/link"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import HashtagIcon from "@/components/icons/HashtagIcon"
import WorkerIcon from "@/components/icons/WorkerIcon"
import CardSimple, { CardSimpleProps } from "@/components/ui/CardSimple"
import EmptyState from "@/components/ui/EmptyState"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeaderRow, TableRow } from "@/components/ui/Table"
import WorkersTableRowActions from "@/components/worker/WorkersTableRowActions"
import { formatDate, formatDuration, titleize } from "@/lib/utils"

export type WorkersTableProps = CardSimpleProps & {
  workers: Worker[]
  status?: WorkerStatus
}

export default function WorkersTable({ workers, status, ...props }: WorkersTableProps) {
  if (!workers.length) {
    return (
      <EmptyState
        icon={WorkerIcon}
        title="No workers found"
        description={(
          <>
            There are no workers with <span className="text-accent">{ReadableStatuses[status]}</span> status
          </>
        )}
      />
    )
  }

  const statusAll = status === undefined
  const isRunningStatus = [Idle, Busy, Stopping].includes(status)

  const hasName = workers.some((worker) => worker.name)

  const showStatus = statusAll
  const showCurrentJob = statusAll || [Busy, Stopping, Killed].includes(status)

  return (
    <CardSimple {...props}>
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead />

            {showStatus && (
              <TableHead>
                Status
              </TableHead>
            )}

            {hasName && (
              <TableHead>
                Cluster
              </TableHead>
            )}

            {showCurrentJob && (
              <TableHead>
                {
                  statusAll
                    ? "Current Job / Last Job"
                    : status === Killed ? "Last Job" : "Current Job"
                }
              </TableHead>
            )}

            <TableHead>
              Started At
            </TableHead>

            <TableHead>
              {
                statusAll
                  ? "Active For / Stopped In"
                  : isRunningStatus ? "Active For" : "Stopped In"
              }
            </TableHead>

            <TableHead last />
          </TableHeaderRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell first>
                <HashtagIcon className="inline-block h-4 w-4 -translate-y-px" />
                <Link
                  className="link"
                  href="#"
                >
                  {worker.id}
                </Link>
              </TableCell>

              {showStatus && (
                <TableCell>
                  <StatusBadge status={worker.status} />
                </TableCell>
              )}

              {hasName && (
                <TableCell>
                  {worker.name ?? <EmptyValue />}
                </TableCell>
              )}

              {showCurrentJob && (
                <TableCell accent>
                  {worker.currentJob ? (
                    <>
                      <p className="mb-0.5">{titleize(worker.currentJob.name)}</p>

                      {worker.currentJob.payload && (
                        <Payload className="w-48 truncate text-neutral-500 xl:w-96 2xl:w-auto">{worker.currentJob.payload}</Payload>
                      )}
                    </>
                  ) : (
                    <EmptyValue />
                  )}
                </TableCell>
              )}

              <TableCell>
                {formatDate(worker.startedAt, { year: undefined })}
              </TableCell>

              <TableCell title={worker.stoppedAt?.toString()}>
                {formatDuration(worker.startedAt, worker.stoppedAt ?? new Date())}
              </TableCell>

              <TableCell last>
                <WorkersTableRowActions worker={worker} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardSimple>
  )
}
