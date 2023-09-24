import { Active, Failed, Pending, Scheduled } from "kodmq/constants"
import { JobStatus, Job } from "kodmq/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import Badge from "@/components/ui/Badge"
import { Card, CardPadding } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { formatDate, formatDuration, numberWithOrdinal, titleize } from "@/lib/utils"

export type JobsTableProps = {
  jobs: Job[],
  status: JobStatus,
}

export default function JobsTable({ jobs, status }: JobsTableProps) {
  if (!jobs.length) return null
  
  const showRunAt = status == Scheduled
  const showStartedAt = ![Pending, Scheduled].includes(status)
  const showElapsedTime = ![Pending, Scheduled, Active].includes(status)
  const showAttempt = status === Failed
  const showError = status === Failed
  const showRetryJobId = status === Failed
  
  return (
    <Card>
      <CardPadding>
        <Table className="overflow-hidden rounded">
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
                <TableCell className="pl-4 font-medium">
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
                      <Badge>
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
      </CardPadding>
    </Card>
  )
}
