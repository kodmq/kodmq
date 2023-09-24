"use client"

import { CalendarIcon, CheckIcon, ClockIcon, Cross2Icon, TokensIcon } from "@radix-ui/react-icons"
import { ReadableJobStatuses } from "kodmq/constants"
import { ComponentProps, createElement, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams"

const Icons = [
  ClockIcon,
  CalendarIcon,
  TokensIcon,
  CheckIcon,
  Cross2Icon,
] as const

export type JobStatusSwitcherProps = ComponentProps<typeof Tabs> & {
  current: string | number
  options: {
    [key: number]: string
  }
}

export default function JobStatusSwitcher({ current, options, ...props }: JobStatusSwitcherProps) {
  const updateSearchParams = useUpdateSearchParams()

  const handleChange = useCallback((value: string) => {
    updateSearchParams({ status: value })
  }, [])

  return (
    <Tabs
      defaultValue={current.toString()}
      onValueChange={handleChange}
      {...props}
    >
      <TabsList>
        {Object.keys(ReadableJobStatuses).map((status, index) => (
          <TabsTrigger key={status} value={status.toString()}>
            {createElement(Icons[index], { className: "h-4 w-4 mr-1.5 -ml-0.5" })}
            {options[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
