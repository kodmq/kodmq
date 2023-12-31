import { Busy, Idle } from "@kodmq/core/constants"
import { Job, Worker } from "@kodmq/core/types"
import StatusStats from "@/components/content/StatusStats"
import JobsChart from "@/components/job/JobsChart"
import Heading from "@/components/typography/Heading"
import WorkersTable from "@/components/worker/WorkersTable"
import withKodMQ from "@/lib/kodmq"
import { filter } from "@/lib/utils"

export default async function HomePage() {
  let jobs: Job[]
  let workers: Worker[]

  await withKodMQ(async (kodmq) => {
    jobs = await kodmq.jobs.all()
    workers = await kodmq.workers.all()
  })
  
  const idleAndBusyWorkers = filter(workers, { statusIn: [Idle, Busy] })
  
  return (
    <div>
      <Heading className="mb-8">Dashboard</Heading>

      <Heading
        tag="h2"
      >
        Jobs
      </Heading>
      <StatusStats
        records={jobs}
        type="job"
        className="mb-4"
      />
      <JobsChart
        jobs={jobs}
        className="mb-4"
      />

      {/*<JobsTable jobs={jobs.slice(0, 5)} />*/}
      
      <hr className="my-8 border-zinc-100 dark:border-zinc-800" />
      
      <Heading
        tag="h2"
        className="mt-8"
      >
        Workers
      </Heading>
      <StatusStats
        records={workers}
        className="mb-4"
        type="worker"
      />
      <WorkersTable
        workers={idleAndBusyWorkers.slice(0, 5)}
        status={Busy}
      />
    </div>
  )
}
