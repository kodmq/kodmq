import { Worker } from "kodmq/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import { Card, CardDescription, CardPadding, CardTitle } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeaderRow, TableRow } from "@/components/ui/Table"
import WorkersTableRowActions from "@/components/worker/WorkersTableRowActions"
import { formatDate, formatDuration, titleize } from "@/lib/utils"

export type WorkersTableProps = {
  workers: Worker[]
}

export default function WorkersTable({ workers }: WorkersTableProps) {
  if (!workers.length) {
    return (
      <Card>
        <CardPadding>
          <CardTitle>Workers</CardTitle>
          <CardDescription>
            No workers found
          </CardDescription>
        </CardPadding>
      </Card>
    )
  }

  const hasClusterName = workers.some((worker) => worker.clusterName)

  return (
    <Card>
      <Table className="overflow-hidden rounded">
        <TableHeader>
          <TableHeaderRow>
            <TableHead
              first
              className="pl-4"
            >
              #
            </TableHead>

            {hasClusterName && <TableHead>Cluster</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead>Active For</TableHead>
            <TableHead>Current Job</TableHead>
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

              {hasClusterName && (
                <TableCell>
                  {worker.clusterName ?? <EmptyValue />}
                </TableCell>
              )}

              <TableCell>
                <StatusBadge status={worker.status} />
              </TableCell>

              <TableCell>
                {formatDate(worker.startedAt, { year: undefined })}
              </TableCell>

              <TableCell title={worker.stoppedAt?.toString()}>
                {formatDuration(worker.startedAt, worker.stoppedAt ?? new Date())}
              </TableCell>

              <TableCell>
                {worker.currentJob ? (
                  <>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">{titleize(worker.currentJob.name)}</span>

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
