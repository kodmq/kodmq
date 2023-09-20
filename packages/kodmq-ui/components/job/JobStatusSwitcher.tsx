"use client"

import { ComponentProps, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams"

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
        {Object.keys(options).map((status) => (
          <TabsTrigger key={status} value={status.toString()}>
            {options[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
