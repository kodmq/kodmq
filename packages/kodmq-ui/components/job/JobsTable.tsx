import { Failed, Pending, ReadableStatuses, Scheduled } from "kodmq/constants"
import { JobStatus, Job } from "kodmq/types"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import HashtagIcon from "@/components/icons/HashtagIcon"
import JobIcon from "@/components/icons/JobIcon"
import JobsTableRowActions from "@/components/job/JobsTableRowActions"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { formatDate, formatDuration, numberWithOrdinal, titleize } from "@/lib/utils"

export type JobsTableProps = {
  jobs: Job[],
  status?: JobStatus,
}

export default function JobsTable({ jobs, status }: JobsTableProps) {
  if (!jobs.length) {
    return (
      <EmptyState
        icon={JobIcon}
        title="No jobs found"
        description={(
          <>
            There are no jobs with <span className="text-accent">{ReadableStatuses[status]}</span> status
          </>
        )}
      />
    )
  }

  const statusAll = status === undefined

  const showStatus = statusAll
  const showRunAt = statusAll || status == Scheduled
  const showStartedAt = statusAll || ![Pending, Scheduled].includes(status)
  const showElapsedTime = statusAll || ![Pending, Scheduled].includes(status)
  const showAttempt = statusAll || status === Failed
  const showError = statusAll || status === Failed
  const showWorkerId = statusAll || ![Pending, Scheduled].includes(status)
  const showRetryJobId = statusAll || status === Failed
  
  return (
    <Card>
      <Table className="overflow-hidden rounded">
        <TableHeader>
          <TableRow>
            <TableHead
              first
              title="Job ID"
              className="pl-4"
            >
              <HashtagIcon className="h-4 w-4 text-zinc-500" />
            </TableHead>

            {showStatus && (
              <TableHead>
                Status
              </TableHead>
            )}

            <TableHead>
              Name
            </TableHead>

            <TableHead>
              Payload
            </TableHead>

            {showRunAt && (
              <TableHead>
                Run At
              </TableHead>
            )}

            {showStartedAt && (
              <TableHead>
                Started At
              </TableHead>
            )}

            {showElapsedTime && (
              <TableHead>
                Elapsed Time
              </TableHead>
            )}

            {showAttempt && (
              <TableHead />
            )}

            {showError && (
              <TableHead>
                Error
              </TableHead>
            )}

            {showRetryJobId && (
              <TableHead title="Retry Job ID">
                Retry
                <HashtagIcon className="ml-0.5 inline-block h-4 w-4 -translate-y-px text-zinc-500" />
              </TableHead>
            )}

            {showWorkerId && (
              <TableHead title="Worker ID">
                Worker
                <HashtagIcon className="ml-0.5 inline-block h-4 w-4 -translate-y-px text-zinc-500" />
              </TableHead>
            )}

            <TableHead last />
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell
                first  
                className="pl-4 font-medium"
              >
                {job.id}
              </TableCell>

              {showStatus && (
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
              )}

              <TableCell accent>
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
                  {job.retryJobId ? `#${job.retryJobId}` : <EmptyValue />}
                </TableCell>
              )}

              {showWorkerId && (
                <TableCell>
                  {job.workerId ?? <EmptyValue />}
                </TableCell>
              )}

              <TableCell last>
                <JobsTableRowActions job={job} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
