import { RocketIcon } from "@radix-ui/react-icons"
import { Pending, ReadableJobStatuses } from "kodmq"
import { JobStatus, JobStatuses } from "kodmq"
import Heading from "@/components/content/Heading"
import JobsTable from "@/components/job/JobsTable"
import JobStatusSwitcher from "@/components/job/JobStatusSwitcher"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import kodmq from "@/lib/kodmq"
import { getFromList } from "@/lib/utils"

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
            <JobsTable jobs={jobs} status={status} />
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
