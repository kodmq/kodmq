"use client"

import { Active, Idle } from "kodmq/constants"
import { Worker } from "kodmq/types"
import { useCallback, useState } from "react"
import stopWorker from "@/actions/stopWorker"
import { ServerAction } from "@/actions/withServerAction"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export type WorkersTableRowActionsProps = {
  worker: Worker
}

export default function WorkersTableRowActions({ worker }: WorkersTableRowActionsProps) {
  const workerIsRunning = [Idle, Active].includes(worker.status)

  const { toast } = useToast()
  const [performingAction, setPerformingAction] = useState(false)

  const handleStop = useCallback(async () => {
    if (performingAction || !workerIsRunning) return
    setPerformingAction(true)

    const [status, _, errors] = await stopWorker(worker.id)

    if (status === ServerAction.Failure) {
      toast({
        title: "Failed to stop worker",
        description: errors.base || "Unknown reason",
        variant: "destructive",
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
          variant="destructive"
          size="sm"
          disabled={performingAction}
          onClick={handleStop}
        >
          Stop
        </Button>
      )}
    </div>
  )
}
