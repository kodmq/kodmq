"use client"

import Select from "@/components/ui/Select"
import { usePathname } from "next/dist/client/components/navigation"
import { ComponentProps, useEffect, useState } from "react"
import refreshPage from "@/actions/refreshPage"
import Label from "@/components/ui/Label"
import { cn } from "@/lib/utils"

const Options = [
  {
    name: "Off",
    value: "0",
  },
  {
    name: "1s",
    value: "1000",
  },
  {
    name: "5s",
    value: "5000",
  },
  {
    name: "10s",
    value: "10000",
  },
  {
    name: "30s",
    value: "30000",
  },
  {
    name: "1m",
    value: "60000",
  },
  {
    name: "5m",
    value: "300000",
  },
]

export type RefreshDataProps = ComponentProps<"div">

export default function DataRefreshInterval({ className, ...props }: RefreshDataProps) {
  const pathname = usePathname()
  
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalId) clearInterval(intervalId)
    if (refreshInterval <= 0) return

    refreshPage(pathname)

    const id = setInterval(() => refreshPage(pathname), refreshInterval)
    setIntervalId(id)
  }, [refreshInterval])

  return (
    <div
      className={cn("space-y-1", className)}
      {...props}
    >
      <Label>Refresh data interval</Label>

      <Select
        value={refreshInterval.toString()}
        onChange={(e) => setRefreshInterval(Number(e.target.value))}
      >
        {Options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.name}
          </option>
        ))}
      </Select>
    </div>
  )
}
