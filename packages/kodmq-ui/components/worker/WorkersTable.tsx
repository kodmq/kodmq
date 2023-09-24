import { RocketIcon } from "@radix-ui/react-icons"
import { Worker } from "kodmq/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import WorkersTableRowActions from "@/components/worker/WorkersTableRowActions"
import { formatDate, formatDuration, titleize } from "@/lib/utils"

export type WorkersTableProps = {
  workers: Worker[]
}

export default function WorkersTable({ workers }: WorkersTableProps) {
  if (!workers.length) {
    return (
      <Alert>
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>No workers</AlertTitle>
        <AlertDescription>
          There are no workers 🤷
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Table className="rounded overflow-hidden">
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">#</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started At</TableHead>
          <TableHead>Active For</TableHead>
          <TableHead>Current Job</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell className="font-medium pl-4">
              {worker.id}
            </TableCell>

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
                <span>
                  {titleize(worker.currentJob.name)}
                  {worker.currentJob.payload && (
                    <>
                      <br />
                      <Payload className="text-xs text-neutral-500">{worker.currentJob.payload}</Payload>
                    </>
                  )}
                </span>
              ) : (
                <EmptyValue />
              )}
            </TableCell>

            <TableCell>
              <WorkersTableRowActions worker={worker} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
