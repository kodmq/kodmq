import { CalendarIcon, CheckIcon, ClockIcon, Cross2Icon, TokensIcon } from "@radix-ui/react-icons"
import { Active, Completed, Failed, Pending, Scheduled } from "kodmq/constants"
import { JobStatus } from "kodmq/types"
import { FC } from "react"

export const JobStatusIcons: Record<JobStatus, FC<{ className?: string }>> = {
  [Pending]: ClockIcon,
  [Scheduled]: CalendarIcon,
  [Active]: TokensIcon,
  [Completed]: CheckIcon,
  [Failed]: Cross2Icon,
} as const
