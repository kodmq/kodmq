"use client"

import { Completed, Failed } from "kodmq/constants"
import { Job } from "kodmq/types"
import { useState } from "react"
import colors from "tailwindcss/colors"
import Card, { CardProps } from "@/components/ui/Card"
import CardSimple from "@/components/ui/CardSimple"
import Chart, { ChartProps } from "@/components/ui/Chart"
import Label from "@/components/ui/Label"
import Select from "@/components/ui/Select"
import { KeysOfType } from "@/lib/types"
import { cn, filter } from "@/lib/utils"

const Periods = {
  "15m": {
    duration: 15 * 60 * 1000,
    slice: 60 * 1000, // 1 minute
    axisBottomFormat: "%H:%M",
    axisBottomTickValues: "every 1 minute",
  },
  "1h": {
    duration: 60 * 60 * 1000,
    slice: 60 * 1000, // 1 minute
    axisBottomFormat: "%H:%M",
    axisBottomTickValues: "every 5 minutes",
  },
  "6h": {
    duration: 6 * 60 * 60 * 1000,
    slice: 5 * 60 * 1000, // 5 minutes
    axisBottomFormat: "%H:%M",
    axisBottomTickValues: "every 30 minutes",
  },
  "12h": {
    duration: 12 * 60 * 60 * 1000,
    slice: 10 * 60 * 1000, // 10 minutes
    axisBottomFormat: "%H:%M",
    axisBottomTickValues: "every 1 hour",
  },
  "24h": {
    duration: 24 * 60 * 60 * 1000,
    slice: 30 * 60 * 1000, // 30 minutes
    axisBottomFormat: "%H:%M",
    axisBottomTickValues: "every 2 hours",
  },
  "7d": {
    duration: 7 * 24 * 60 * 60 * 1000,
    slice: 4 * 60 * 60 * 1000, // 4 hours
    axisBottomFormat: "%a %H:%M",
    axisBottomTickValues: "every 12 hours",
  },
  "30d": {
    duration: 30 * 24 * 60 * 60 * 1000,
    slice: 12 * 60 * 60 * 1000, // 12 hours
    axisBottomFormat: "%a %H:%M",
    axisBottomTickValues: "every 2 days",
  },
}

type Period = keyof typeof Periods

export type JobsChartProps = CardProps & {
  jobs: Job[]
}

export default function JobsChart({ jobs, className, ...props }: JobsChartProps) {
  const [period, setPeriod] = useState<Period>(Object.keys(Periods)[0] as Period)

  const after = new Date(Date.now() - Periods[period].duration)

  const queuedJobs = filter(jobs, { createdAtAfter: after })
  const completedJobs = filter(jobs, { status: Completed, finishedAtAfter: after })
  const failedJobs = filter(jobs, { status: Failed, failedAtAfter: after })

  const buildData = (jobs: Job[], key: KeysOfType<Job, Date>) => {
    const data: { x: Date, y: number }[] = []

    const slice = Periods[period].slice
    const start = new Date(Date.now() - Periods[period].duration)
    start.setTime(Math.floor(start.getTime() / slice) * slice)

    for (let time = start.getTime(); time <= Date.now(); time += slice) {
      const x = new Date(time)
      const y = filter(jobs, { 
        [`${key}After`]: x, 
        [`${key}Before`]: new Date(time + slice), 
      }).length

      data.push({ x, y })
    }

    return data
  }

  const data = [
    {
      id: "Queued",
      data: buildData(queuedJobs, "createdAt"),
    },
    {
      id: "Completed",
      data: buildData(completedJobs, "finishedAt"),
    },
    {
      id: "Failed",
      data: buildData(failedJobs, "failedAt"),
    },
  ]

  return (
    <CardSimple
      className={cn("relative", className)}
      {...props}
    >
      <div className="h-96">
        <Chart
          data={data}
          xFormat={`time:${Periods[period].axisBottomFormat}`}
          enableGridX={false}
          tooltip={Tooltip}
          axisBottom={{
            format: Periods[period].axisBottomFormat,
            tickValues: Periods[period].axisBottomTickValues,
          }}
          colors={[
            colors.sky[500],
            colors.green[500],
            colors.red[500],
          ]}
        />
      </div>

      <div className="absolute right-1 top-1 flex w-36 flex-row items-center gap-2 rounded-xl bg-white py-1 pl-3.5 pr-1 shadow shadow-white dark:bg-zinc-900 dark:shadow-zinc-900">
        <Label>Period</Label>

        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
        >
          {Object.keys(Periods).map((period) => (
            <option
              key={period}
              value={period}
            >
              {period}
            </option>
          ))}
        </Select>
      </div>
    </CardSimple>
  )
}

function Tooltip({ point }: Parameters<ChartProps["tooltip"]>[0]) {
  if (!point.data.y) return null

  return (
    <Card>
      <Card.Padding>
        <Card.Content className="m-0 flex items-center gap-1.5 text-sm font-medium text-zinc-500">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: point.serieColor }}
          />

          <span>
            {point.serieId}
            <span className="text-accent"> {point.data.yFormatted} </span>
            at
            <span className="text-accent"> {point.data.xFormatted}</span>
          </span>
        </Card.Content>
      </Card.Padding>
    </Card>
  )
}
