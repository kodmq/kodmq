import { Busy, Idle, Killed, ReadableStatuses, Stopping } from "kodmq/constants"
import { Worker, WorkerStatus } from "kodmq/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import WorkerIcon from "@/components/icons/WorkerIcon"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeaderRow, TableRow } from "@/components/ui/Table"
import WorkersTableRowActions from "@/components/worker/WorkersTableRowActions"
import { formatDate, formatDuration, titleize } from "@/lib/utils"

export type WorkersTableProps = {
  workers: Worker[]
  status?: WorkerStatus
}

export default function WorkersTable({ workers, status }: WorkersTableProps) {
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
  const isRunningStatus = [Idle, Busy].includes(status)

  const hasClusterName = workers.some((worker) => worker.clusterName)

  const showStatus = statusAll
  const showCurrentJob = statusAll || [Busy, Stopping, Killed].includes(status)

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHead
              first
              className="pl-4"
            >
              #
            </TableHead>

            {showStatus && (
              <TableHead>
                Status
              </TableHead>
            )}

            {hasClusterName && (
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
              <TableCell
                first
                className="pl-4 font-medium"
              >
                {worker.id}
              </TableCell>

              {showStatus && (
                <TableCell>
                  <StatusBadge status={worker.status} />
                </TableCell>
              )}

              {hasClusterName && (
                <TableCell>
                  {worker.clusterName ?? <EmptyValue />}
                </TableCell>
              )}

              {showCurrentJob && (
                <TableCell accent>
                  {worker.currentJob ? (
                    <>
                      {titleize(worker.currentJob.name)}

                      {worker.currentJob.payload && (
                        <>
                          <br />
                          <Payload className="text-xs text-neutral-500">{worker.currentJob.payload}</Payload>
                        </>
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
    </Card>
  )
}
