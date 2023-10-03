"use client"

import { Job } from "@kodmq/core/types"
import { AnimatePresence } from "framer-motion"
import { useState } from "react"
import HashtagIcon from "@/components/icons/HashtagIcon"
import JobModal from "@/components/job/JobModal"

export type JobIdProps = {
  job: Job
}

export default function JobId({ job }: JobIdProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <HashtagIcon className="inline-block h-4 w-4 -translate-y-px" />
      <button
        className="link"
        onClick={() => setOpen(true)}
      >
        {job.id}
      </button>

      <AnimatePresence>
        {open && (
          <JobModal
            job={job}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
