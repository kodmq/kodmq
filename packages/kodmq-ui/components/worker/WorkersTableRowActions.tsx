import { Worker } from "kodmq"
import { Active } from "kodmq"
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
