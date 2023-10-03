import { Active, Failed, Pending, ReadableStatuses, Scheduled } from "@kodmq/core/constants"
import { JobStatus, Job } from "@kodmq/core/types"
import Link from "next/link"
import EmptyValue from "@/components/content/EmptyValue"
import Payload from "@/components/content/Payload"
import StatusBadge from "@/components/content/StatusBadge"
import HashtagIcon from "@/components/icons/HashtagIcon"
import JobIcon from "@/components/icons/JobIcon"
import JobsTableRowActions from "@/components/job/JobsTableRowActions"
import Badge from "@/components/ui/Badge"
import CardSimple, { CardSimpleProps } from "@/components/ui/CardSimple"
import EmptyState from "@/components/ui/EmptyState"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { formatDate, formatDuration, numberWithOrdinal, titleize } from "@/lib/utils"

export type JobsTableProps = CardSimpleProps & {
  jobs: Job[],
  status?: JobStatus,
}

export default function JobsTable({ jobs, status, ...props }: JobsTableProps) {
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
    <CardSimple {...props}>
      <Table className="overflow-hidden rounded">
        <TableHeader>
          <TableRow>
            <TableHead />

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

            {showElapsedTime && (
              <TableHead>
                {status === Active ? "Active For" : "Elapsed Time"}
              </TableHead>
            )}

            {showStartedAt && (
              <TableHead>
                Started At
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
              <TableCell first>
                <HashtagIcon className="inline-block h-4 w-4 -translate-y-px" />
                <Link
                  className="link"
                  href="#"
                >
                  {job.id}
                </Link>
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
                  <Payload className="w-48 truncate text-sm text-neutral-500 xl:w-96">{job.payload}</Payload>
                ) : (
                  <EmptyValue />
                )}
              </TableCell>

              {showRunAt && (
                <TableCell title={job.runAt?.toString()}>
                  {formatDate(job.runAt) ?? <EmptyValue />}
                </TableCell>
              )}

              {showElapsedTime && (
                <TableCell title={job.finishedAt?.toString()}>
                  {formatDuration(
                    job.startedAt,
                    job.status === Active ? new Date() : job.finishedAt,
                  ) ?? <EmptyValue />}
                </TableCell>
              )}

              {showStartedAt && (
                <TableCell title={job.startedAt?.toString()}>
                  {formatDate(job.startedAt) ?? <EmptyValue />}
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
                  {job.retryJobId ? (
                    <span>
                      <HashtagIcon className="inline-block h-4 w-4 -translate-y-px" />
                      <Link
                        className="link"
                        href="#"
                      >
                        {job.retryJobId}
                      </Link>
                    </span>
                  ) : (
                    <EmptyValue />
                  )}
                </TableCell>
              )}

              {showWorkerId && (
                <TableCell>
                  {job.workerId ? (
                    <span>
                      <HashtagIcon className="inline-block h-4 w-4 -translate-y-px" />
                      <Link
                        className="link"
                        href="#"
                      >
                        {job.workerId}
                      </Link>
                    </span>
                  ) : (
                    <EmptyValue />
                  )}
                </TableCell>
              )}

              <TableCell last>
                <JobsTableRowActions job={job} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardSimple>
  )
}
