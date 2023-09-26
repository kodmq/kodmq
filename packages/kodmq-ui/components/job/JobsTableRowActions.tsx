"use client"

import { Completed, Failed, Pending, Scheduled } from "kodmq/constants"
import { Job } from "kodmq/types"
import { useCallback, useState } from "react"
import performJob from "@/actions/performJob"
import { ServerAction } from "@/actions/withServerAction"
import Button from "@/components/ui/Button"
import Loader from "@/components/ui/Loader"
import { getErrorMessage } from "@/lib/utils"
import { toast } from "@/stores/toast"

export type JobsTableRowActionsProps = {
  job: Job
}

export default function JobsTableRowActions({ job }: JobsTableRowActionsProps) {
  const [performing, setPerforming] = useState(false)

  const performAction = useCallback(async (action: () => Promise<void>) => {
    if (performing) return

    try {
      setPerforming(true)
      await action()
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "red",
      })
    } finally {
      setPerforming(false)
    }
  }, [performing])
  
  const handleRunNow = useCallback(async () => {

  }, [job])

  const handleRunAgain = useCallback(async () => {
    await performAction(async () => {
      const [status, newJob, errors] = await performJob({
        name: job.name,
        payload: job.payload,
        runAt: new Date(0),
      })

      if (status === ServerAction.Success) {
        toast({
          title: "Job scheduled to run now",
          description: `New job is #${newJob.id}`,
          variant: "green",
        })
      } else {
        toast({
          title: "Error",
          description: errors.base ?? "Something went wrong",
          variant: "red",
        })
      }
    })
  }, [job])

  const handleDelete = useCallback(async () => {
    toast({
      title: "Deleting",
      description: "Job is deleting",
      variant: "red",
    })
  }, [job])

  return (
    <div className="flex items-center justify-center gap-2">
      {performing ? (
        <Loader
          size="sm"
          text="Running"
        />
      ) : (
        <>
          {[Pending, Scheduled].includes(job.status) && (
            <Button
              variant="greenGlassy"
              size="sm"
              onClick={handleRunNow}
            >
              Run Now
            </Button>
          )}

          {[Completed, Failed].includes(job.status) && (
            <Button
              variant="skyGlassy"
              size="sm"
              onClick={handleRunAgain}
            >
              Run Again
            </Button>
          )}

          <Button
            variant="redGlassy"
            size="sm"
            onClick={handleDelete}
          >
            Remove
          </Button>
        </>
      )}
    </div>
  )
}
