"use client"

import { ResponsiveLine } from "@nivo/line"
import { Completed, Failed } from "kodmq/constants"
import { Job } from "kodmq/types"
import { useState } from "react"
import { KeysOfType } from "@/lib/types"
import { filter } from "@/lib/utils"
import colors from "tailwindcss/colors"

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
    slice: 60 * 60 * 1000, // 1 hour
    axisBottomFormat: "%a %H:%M",
    axisBottomTickValues: "every 12 hours",
  },
  "30d": {
    duration: 30 * 24 * 60 * 60 * 1000,
    slice: 4 * 60 * 60 * 1000, // 4 hours
    axisBottomFormat: "%a %H:%M",
    axisBottomTickValues: "every 2 days",
  },
}

type Period = keyof typeof Periods

export type JobsChartProps = {
  jobs: Job[]
}

export default function JobsChart({ jobs }: JobsChartProps) {
  const [period, setPeriod] = useState<Period>(Object.keys(Periods)[0] as Period)

  const after = new Date(Date.now() - Periods[period].duration)

  const completedJobs = filter(jobs, { status: Completed, finishedAtAfter: after })
  const failedJobs = filter(jobs, { status: Failed, failedAtAfter: after })

  const buildData = (jobs: Job[], key: KeysOfType<Job, Date>) => {
    const data: { x: Date, y: number }[] = []

    const slice = Periods[period].slice
    const start = new Date(Date.now() - Periods[period].duration)
    start.setMilliseconds(Math.floor(start.getMilliseconds() / slice) * slice)

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
      id: "Completed",
      data: buildData(completedJobs, "finishedAt"),
    },
    {
      id: "Failed",
      data: buildData(failedJobs, "failedAt"),
    },
  ]

  return (
    <div className="h-96">
      <ResponsiveLine
        animate
        theme={{
          background: "transparent",

          axis: {
            ticks: {
              line: {
                stroke: colors.zinc[700],
              },

              text: {
                fill: colors.zinc[600],
              },
            },
          },

          grid: {
            line: {
              stroke: colors.zinc[800],
            },
          },

          tooltip: {
            container: {
              background: colors.zinc[900],
            },
          },
        }}
        axisBottom={{
          format: Periods[period].axisBottomFormat,
          tickValues: Periods[period].axisBottomTickValues,
        }}
        curve="monotoneX"
        data={data}
        // enablePointLabel
        // height={384}
        margin={{
          bottom: 40,
          left: 40,
          right: 20,
          top: 20,
        }}
        pointBorderColor={{
          from: "color",
          modifiers: [
            [
              "darker",
              0.3,
            ],
          ],
        }}
        // pointBorderWidth={1}
        // pointSize={16}
        // pointSymbol={function noRefCheck(){}}
        useMesh
        // width={900}
        xFormat="time:%Y-%m-%d"
        xScale={{
          precision: "minute",
          type: "time",
          useUTC: false,
        }}
        yScale={{
          type: "linear",
          min: 0,
          max: 10,
        }}
      />
    </div>
  )
}
