import { JobStatus, JobStruct } from "kodmq"
import { Active, Failed, Pending, Scheduled } from "kodmq"
import pluralize from "pluralize"
import EmptyValue from "@/components/content/EmptyValue"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatDuration, numberWithOrdinal, titleize } from "@/lib/utils"
import Payload from "@/components/content/Payload"

export type JobsTableProps = {
  jobs: JobStruct[],
  status: JobStatus,
}

export default function JobsTable({ jobs, status }: JobsTableProps) {
  const showRunAt = status == Scheduled
  const showStartedAt = ![Pending, Scheduled].includes(status)
  const showElapsedTime = ![Pending, Scheduled, Active].includes(status)
  const showAttempt = status === Failed
  const showError = status === Failed
  const showRetryJobId = status === Failed
  
  return (
    <Table className="rounded overflow-hidden">
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Job ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Payload</TableHead>

          {showRunAt && <TableHead>Run At</TableHead>}
          {showStartedAt && <TableHead>Started At</TableHead>}
          {showElapsedTime && <TableHead>Elapsed Time</TableHead>}
          {showAttempt && <TableHead />}
          {showError && <TableHead>Error</TableHead>}
          {showRetryJobId && <TableHead>Retry Job ID</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium pl-4">
              {job.id}
            </TableCell>

            <TableCell>
              {titleize(job.name)}
            </TableCell>

            <TableCell>
              {job.payload !== null ? (
                <Payload className="text-sm text-neutral-500">{job.payload}</Payload>
              ) : (
                <EmptyValue />
              )}
            </TableCell>

            {showRunAt && (
              <TableCell title={job.runAt?.toString()}>
                {formatDate(job.runAt) ?? <EmptyValue />}
              </TableCell>
            )}

            {showStartedAt && (
              <TableCell title={job.startedAt?.toString()}>
                {formatDate(job.startedAt) ?? <EmptyValue />}
              </TableCell>
            )}

            {showElapsedTime && (
              <TableCell title={job.finishedAt?.toString()}>
                {formatDuration(job.startedAt, job.finishedAt) ?? <EmptyValue />}
              </TableCell>
            )}

            {showAttempt && (
              <TableCell className="text-right">
                {job.failedAttempts && job.failedAttempts > 0 ? (
                  <Badge variant="destructive" className="px-1.5 py-0.5">
                    {numberWithOrdinal(job.failedAttempts)}
                  </Badge>
                ) : (
                  <EmptyValue />
                )}
              </TableCell>
            )}

            {showError && (
              <TableCell>
                {job.errorMessage}
              </TableCell>
            )}

            {showRetryJobId && (
              <TableCell>
                {job.retryJobId ?? <EmptyValue />}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
