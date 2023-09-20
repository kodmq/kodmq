"use client"

import { ComponentProps, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type JobStatusSwitcherProps = ComponentProps<typeof Tabs> & {
  currentStatus: string | number
  statuses: {
    [key: number]: string
  }
}

export default function JobStatusSwitcher({ currentStatus, statuses, ...props }: JobStatusSwitcherProps) {
  const handleChange = useCallback((value: string) => {
    console.log(value)
  }, [])

  return (
    <Tabs
      defaultValue={currentStatus.toString()}
      onValueChange={handleChange}
      {...props}
    >
      <TabsList>
        {Object.keys(statuses).map((status) => (
          <TabsTrigger key={status} value={status.toString()}>
            {statuses[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
