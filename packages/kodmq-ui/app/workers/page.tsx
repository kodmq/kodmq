import { WorkerStatuses } from "kodmq/constants"
import StatusStats from "@/components/content/StatusStats"
import Heading from "@/components/typography/Heading"
import WorkersTable from "@/components/worker/WorkersTable"
import kodmq from "@/lib/kodmq"
import { filter, getFromList } from "@/lib/utils"

type WorkersPageProps = {
  searchParams: {
    status: string
  }
}

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
  const status = getFromList(WorkerStatuses, Number(searchParams.status), undefined)
  const workers = await kodmq.getWorkers()
  const workersByStatus = status ? filter(workers, { status }) : workers

  return (
    <div>
      <Heading>Workers</Heading>

      <StatusStats
        highlight
        records={workers}
        current={status}
        type="worker"
        className="mb-4"
      />

      <WorkersTable
        workers={workersByStatus}
        status={status}
      />
    </div>
  )
}
