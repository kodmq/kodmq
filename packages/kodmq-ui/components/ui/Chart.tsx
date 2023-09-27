import { ResponsiveLine } from "@nivo/line"
import { useTheme } from "next-themes"
import { ComponentProps } from "react"
import colors from "tailwindcss/colors"
import defaultTheme from "tailwindcss/defaultTheme"

const LightTheme: ChartProps["theme"] = {
  background: "transparent",

  axis: {
    ticks: {
      line: {
        stroke: colors.zinc[200],
      },

      text: {
        fill: colors.zinc[400],
      },
    },
  },

  grid: {
    line: {
      stroke: colors.zinc[100],
    },
  },

  crosshair: {
    line: {
      stroke: colors.indigo[500],
    },
  },

  tooltip: {
    container: {
      background: colors.zinc[100],
      boxShadow: defaultTheme.boxShadow.sm,
      borderWidth: "1px",
      borderColor: colors.zinc[200],
      borderRadius: defaultTheme.borderRadius.lg,
      padding: `${defaultTheme.spacing["3"]} ${defaultTheme.spacing["4"]}`,
    },
  },
}

const DarkTheme: ChartProps["theme"] = {
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

  crosshair: {
    line: {
      stroke: colors.indigo[400],
    },
  },

  tooltip: {
    container: {
      background: colors.zinc[900],
      boxShadow: defaultTheme.boxShadow.sm,
      borderWidth: "1px",
      borderColor: colors.zinc[800],
      borderRadius: defaultTheme.borderRadius.lg,
      padding: `${defaultTheme.spacing["3"]} ${defaultTheme.spacing["4"]}`,
    },
  },
}

export type ChartProps = ComponentProps<typeof ResponsiveLine>

export default function Chart(props: ChartProps) {
  const { resolvedTheme: theme } = useTheme()

  let maxY = 0
  let maxX = 0

  for (const series of props.data) {
    for (const point of series.data) {
      maxY = Math.max(maxY, Number(point.y))
    }
  }

  for (const series of props.data) {
    for (const point of series.data) {
      maxX = Math.max(maxX, Number(point.x))
    }
  }

  return (
    <ResponsiveLine
      useMesh
      animate
      enableArea
      enableCrosshair={false}
      motionConfig="default"
      fill={[
        {
          id: "gradientA",
          match: "*",
        },
      ]}
      defs={[
        {
          colors: [
            {
              color: "inherit",
              offset: 0,
              opacity: 0.8,
            },
            {
              color: "inherit",
              offset: 100,
              opacity: 0,
            },
          ],
          id: "gradientA",
          type: "linearGradient",
        },
      ]}
      curve="monotoneX"
      theme={theme === "dark" ? DarkTheme : LightTheme}
      margin={{
        bottom: 80,
        left: 40,
        right: 20,
        top: 30,
      }}
      xScale={{
        type: "time",
        useUTC: false,
        max: new Date(maxX + 10 * 1000), // Add some padding to the max
      }}
      yScale={{
        type: "linear",
        nice: true,
        min: 0,
        max: maxY < 5 ? maxY + 10 : maxY * 1.15, // Add some padding to the max
      }}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          itemHeight: 20,
          itemWidth: 100,
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          symbolSize: 12,
          symbolShape: "circle",
          itemTextColor: colors.zinc[600],
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: colors.zinc[400],
              },
            },
          ],
        },
      ]}
      {...props}
    />
  )
}
