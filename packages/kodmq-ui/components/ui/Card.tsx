"use client"

import { type MotionValue, motion, useMotionTemplate, useMotionValue } from "framer-motion"
import Link from "next/link"
import { ComponentPropsWithoutRef, ReactNode } from "react"
import { GridPattern } from "@/components/content/GridPattern"
import Heading, { HeadingProps } from "@/components/typography/Heading"
import Text, { TextProps } from "@/components/typography/Text"
import { ExtendProps, Icon } from "@/lib/types"
import { cn } from "@/lib/utils"

type Pattern = Pick<
  ComponentPropsWithoutRef<typeof GridPattern>,
  "y" | "squares"
>

const patterns: Pattern[] = [
  {
    y: 16,
    squares: [
      [0, 1],
      [1, 3],
    ],
  },
  {
    y: -6,
    squares: [
      [-1, 2],
      [1, 3],
    ],
  },
  {
    y: 32,
    squares: [
      [0, 2],
      [1, 4],
    ],
  },
  {
    y: 22,
    squares: [[0, 1]],
  },
]

export type CardProps = ExtendProps<"div", {
  icon?: Icon
  href?: string
  pattern?: number
  animated?: boolean
  children: ReactNode
}>

export function Card({ href, pattern = 0, animated = false, children }: CardProps) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    if (!animated) return

    let { left, top } = currentTarget.getBoundingClientRect()

    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn(
        "overflow-hidden group relative flex rounded-2xl bg-zinc-50 transition-shadow dark:bg-white/2.5",
        animated && "hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/5",
      )}
    >
      <CardPattern
        {...patterns[pattern]}
        animated={animated}
        mouseX={mouseX}
        mouseY={mouseY}
      />

      <div
        className={cn(
          "absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 dark:ring-white/10",
          animated && "group-hover:ring-zinc-900/10 dark:group-hover:ring-white/20",
        )}
      />

      <div className="relative w-full rounded-2xl">
        {children}
      </div>

      {href && (
        <Link
          href={href}
          className="absolute inset-0 rounded-2xl"
        />
      )}
    </div>
  )
}

export function CardIcon({ icon: Icon }: { icon: Icon }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-indigo-300/10 dark:group-hover:ring-indigo-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-indigo-300/10 dark:group-hover:stroke-indigo-400" />
    </div>
  )
}

export function CardTitle({ tag, className, children, ...props }: HeadingProps) {
  return (
    <Heading
      tag={tag || "h3"}
      className={cn("mb-0", className)}
      {...props}
    >
      {children}
    </Heading>
  )
}

export function CardDescription({ children, className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-sm", className)}
      {...props}
    >
      {children}
    </Text>
  )
}

export function CardPadding({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-4">
      {children}
    </div>
  )
}

function CardPattern({
  animated,
  mouseX,
  mouseY,
  ...gridProps
}: Pattern & {
  animated: boolean
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>

      {animated && (
        <>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-indigo-950 dark:to-indigo-900"
            style={style}
          />

          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
            style={style}
          >
            <GridPattern
              width={72}
              height={56}
              x="50%"
              className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
              {...gridProps}
            />
          </motion.div>
        </>
      )}
    </div>
  )
}
