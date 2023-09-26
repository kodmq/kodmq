import { ComponentPropsWithoutRef, useId } from "react"
import { cn } from "@/lib/utils"

const presets: Partial<GridPatternProps>[] = [
  {
    x: 8,
    y: 16,
    squares: [
      [0, 1],
      [1, 3],
    ],
  },
  {
    x: 16,
    y: -6,
    squares: [
      [-1, 2],
      [1, 3],
    ],
  },
  {
    x: 32,
    y: 32,
    squares: [
      [0, 2],
      [1, 4],
    ],
  },
  {
    x: 48,
    y: 22,
    squares: [[0, 1]],
  },
]

type GridPatternPreset = {
  width: number
  height: number
  preset: number
  x?: string | number
  y?: string | number
  squares?: never
}

type GridPatternOptions = {
  width: number
  height: number
  preset?: never
  x: string | number
  y: string | number
  squares: [x: number, y: number][]
}

export type GridPatternProps = ComponentPropsWithoutRef<"svg"> & (GridPatternPreset | GridPatternOptions)

export function GridPattern({
  width,
  height,
  preset,
  x,
  y,
  squares,
  className,
  ...props
}: GridPatternProps) {
  const patternId = useId()

  if (preset !== undefined) {
    const { x: presetX, y: presetY, squares: presetSquares } = presets[preset]

    x = x ?? presetX
    y = y ?? presetY
    squares = presetSquares
  }

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg
          x={x}
          y={y}
          className="overflow-visible"
        >
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
