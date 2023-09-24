import { Active } from "kodmq/constants"
import { Worker } from "kodmq/types"
import WorkerStopButton from "@/components/worker/WorkerStopButton"

export type WorkersTableRowActionsProps = {
  worker: Worker
}

export default function WorkersTableRowActions({ worker }: WorkersTableRowActionsProps) {
  return (
    <div>
      {worker.status === Active && (
        <WorkerStopButton worker={worker} />
      )}
    </div>
  )
}
