"use client"

import { Worker } from "kodmq"
import { ComponentProps, useCallback, useState } from "react"
import stopWorker from "@/actions/stopWorker"
import { ServerAction } from "@/actions/withServerAction"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export type WorkerStopButtonProps = ComponentProps<typeof Button> & {
  worker: Worker
}

export default function WorkerStopButton({ worker, ...props }: WorkerStopButtonProps) {
  const { toast } = useToast()
  const [performingAction, setPerformingAction] = useState(false)

  const handleStop = useCallback(async () => {
    if (performingAction) return
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
    <Button
      variant="destructive"
      size="sm"
      {...props}
      disabled={performingAction}
      onClick={handleStop}
    >
      Stop
    </Button>
  )
}
