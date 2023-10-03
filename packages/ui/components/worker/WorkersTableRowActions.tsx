"use client"

import { Active, Idle } from "@kodmq/core/constants"
import { Worker } from "@kodmq/core/types"
import { useCallback, useState } from "react"
import stopWorker from "@/actions/stopWorker"
import { ServerAction } from "@/actions/withServerAction"
import Button from "@/components/ui/Button"
import { toast } from "@/stores/toast"

export type WorkersTableRowActionsProps = {
  worker: Worker
}

export default function WorkersTableRowActions({ worker }: WorkersTableRowActionsProps) {
  const workerIsRunning = [Idle, Active].includes(worker.status)

  const [performingAction, setPerformingAction] = useState(false)

  const handleStop = useCallback(async () => {
    if (performingAction || !workerIsRunning) return
    setPerformingAction(true)

    const [status, _, errors] = await stopWorker(worker.id)

    if (status === ServerAction.Failure) {
      toast({
        title: "Failed to stop worker",
        description: errors.base || "Unknown reason",
      })
    } else {
      toast({
        title: "Worker stopped",
        description: "The worker has been stopped successfully",
      })
    }

    setPerformingAction(false)
  }, [worker])

  return (
    <div>
      {workerIsRunning && (
        <Button
          variant="redGlassy"
          size="xs"
          disabled={performingAction}
          onClick={handleStop}
        >
          Stop
        </Button>
      )}
    </div>
  )
}
