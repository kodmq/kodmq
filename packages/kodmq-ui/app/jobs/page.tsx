import { RocketIcon } from "@radix-ui/react-icons"
import { Pending, ReadableJobStatuses } from "kodmq"
import { JobStatus, JobStatuses } from "kodmq"
import { Failed } from "kodmq"
import Heading from "@/components/content/Heading"
import JobStatusSwitcher from "@/components/job/JobStatusSwitcher"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import kodmq from "@/lib/kodmq"
import { formatDate, formatDuration, getFromList, titleize } from "@/lib/utils"
import EmptyValue from "@/components/content/EmptyValue"

export type JobsPageProps = {
  searchParams: {
    status?: JobStatus
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const status = getFromList(JobStatuses, Number(searchParams.status), Pending)
  const jobs = await kodmq.getJobs({ status })

  return (
    <div>
      <Heading className="mb-6">Jobs</Heading>

      <JobStatusSwitcher
        current={status}
        options={ReadableJobStatuses}
        className="mb-4"
      />

      {jobs.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table className="rounded overflow-hidden">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Job ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Arguments</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Elapsed Time</TableHead>

                  {status === Failed && (
                    <>
                      <TableHead>Error</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium pl-4">{job.id}</TableCell>
                    <TableCell>{titleize(job.name)}</TableCell>
                    <TableCell><pre>{JSON.stringify(job.data)}</pre></TableCell>
                    <TableCell>{formatDate(job.startedAt) ?? <EmptyValue />}</TableCell>
                    <TableCell>{formatDuration(job.startedAt, job.finishedAt) ?? <EmptyValue />}</TableCell>

                    {status === Failed && (
                      <>
                        <TableCell>{job.errorMessage}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>No jobs</AlertTitle>
          <AlertDescription>
            There are no jobs with status <strong>{ReadableJobStatuses[status]}</strong>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
