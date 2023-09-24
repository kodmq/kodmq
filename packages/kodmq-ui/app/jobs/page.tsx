import { ReadableJobStatuses, JobStatuses, Pending } from "kodmq/constants"
import { JobStatus } from "kodmq/types"
import Heading from "@/components/content/Heading"
import JobsTable from "@/components/job/JobsTable"
import JobStatusSwitcher from "@/components/job/JobStatusSwitcher"
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

      <JobsTable jobs={jobs} status={status} />
    </div>
  )
}
