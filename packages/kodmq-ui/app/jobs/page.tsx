import { JobStatuses } from "kodmq/constants"
import StatusStats from "@/components/content/StatusStats"
import JobsTable from "@/components/job/JobsTable"
import Heading from "@/components/typography/Heading"
import kodmq from "@/lib/kodmq"
import { filter, getFromList } from "@/lib/utils"

type JobsPageProps = {
  searchParams: {
    status: string
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const status = getFromList(JobStatuses, Number(searchParams.status), undefined)
  const jobs = await kodmq.jobs.all()
  const jobsByStatus = status ? filter(jobs, { status }) : jobs

  return (
    <div>
      <Heading>Jobs</Heading>
      
      <StatusStats
        highlight
        records={jobs}
        current={status}
        type="job"
        className="mb-4"
      />

      <JobsTable
        jobs={jobsByStatus}
        status={status}
      />
    </div>
  )
}
