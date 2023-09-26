import { Busy, Idle } from "kodmq/constants"
import StatusStats from "@/components/content/StatusStats"
import Heading from "@/components/typography/Heading"
import WorkersTable from "@/components/worker/WorkersTable"
import kodmq from "@/lib/kodmq"
import { filter } from "@/lib/utils"

export default async function HomePage() {
  const workers = await kodmq.getWorkers()
  const idleAndBusyWorkers = filter(workers, { statusIn: [Idle, Busy] })

  const jobs = await kodmq.getJobs()

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
      />
      
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
        workers={idleAndBusyWorkers}
        status={Busy}
      />
    </div>
  )
}
