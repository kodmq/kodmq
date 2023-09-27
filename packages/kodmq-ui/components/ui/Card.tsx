import { cva, VariantProps } from "class-variance-authority"
import Link from "next/link"
import { ComponentProps } from "react"
import { GridPattern } from "@/components/content/GridPattern"
import Text from "@/components/typography/Text"
import { ExtendProps } from "@/lib/types"
import { cn } from "@/lib/utils"

export type CardProps = ExtendProps<"div", {
  variant?: VariantProps<typeof cardVariants>["variant"]
  href?: string
  pattern?: boolean | number
  highlight?: boolean
}>

export default function Card({ variant = "default", href, pattern, highlight, className, children, ...props }: CardProps) {
  return (
    <div 
      className={cn("bg-white dark:bg-zinc-900 rounded-2xl", className)}
      {...props}
    >
      <div className={cardVariants({ variant, href: Boolean(href), highlight: Boolean(highlight) })}>
        {pattern !== undefined && (
          <GridPattern
            preset={typeof pattern === "number" ? pattern : 0}
            x="50%"
            width={50}
            height={50}
            className={gridPatternVariants({ variant, href: Boolean(href), highlight: Boolean(highlight) })}
          />
        )}

        {children}

        {href && (
          <Link
            href={href}
            className="absolute inset-0 z-10"
          />
        )}
      </div>
    </div>
  )
}

function Padding({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative px-5 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function Title({ className, children, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "relative text-base font-semibold leading-7 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

function Description({ className, children, ...props }: ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "relative text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  )
}

function Content({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Padding = Padding
Card.Title = Title
Card.Description = Description
Card.Content = Content

const cardVariants = cva([
  "group relative overflow-hidden rounded-2xl border",
], {
  variants: {
    variant: {
      default: "",
      red: "",
      green: "",
    },

    href: {
      true: "cursor-pointer hover:border-black/10 hover:dark:border-white/7.5",
      false: "",
    },
    
    highlight: {
      true: "border-transparent shadow-sm",
      false: "border-black/5 bg-black/2.5 dark:border-white/5 dark:bg-white/1",
    },
  },
  
  compoundVariants: [
    { variant: "default", href: true, className: "hover:bg-indigo-900/5 hover:dark:bg-indigo-900/10" },
    { variant: "default", highlight: true, className: "bg-indigo-900/5 shadow-indigo-600 dark:bg-indigo-900/10 dark:shadow-indigo-500" },

    { variant: "red", href: true, className: "hover:bg-red-900/5 hover:dark:bg-red-900/10" },
    { variant: "red", highlight: true, className: "bg-red-900/5 shadow-red-600 dark:bg-red-900/10 dark:shadow-red-500" },

    { variant: "green", href: true, className: "hover:bg-green-900/5 hover:dark:bg-green-900/10" },
    { variant: "green", highlight: true, className: "bg-green-900/5 shadow-green-600 dark:bg-green-900/10 dark:shadow-green-500" },
  ],
})

const gridPatternVariants = cva([
  "absolute inset-x-0 inset-y-[-30%] h-[160%] w-full opacity-50",
], {
  variants: {
    variant: {
      default: "",
      red: "",
      green: "",
    },
    
    href: {
      true: "",
      false: "",
    },
    
    highlight: {
      true: "",
      false: "",
    },
  },
  
  compoundVariants: [
    { variant: "default", href: true, className: "group-hover:fill-indigo-900/10 group-hover:stroke-indigo-900/20 group-hover:dark:fill-indigo-900/10 group-hover:dark:stroke-indigo-900/50" },
    { variant: "default", highlight: true, className: "fill-indigo-900/20 stroke-indigo-900/30 dark:fill-indigo-900/20 dark:stroke-indigo-900/70" },

    { variant: "red", href: true, className: "group-hover:fill-red-900/10 group-hover:stroke-red-900/20 group-hover:dark:fill-red-900/10 group-hover:dark:stroke-red-900/50" },
    { variant: "red", highlight: true, className: "fill-red-900/20 stroke-red-900/30 dark:fill-red-900/20 dark:stroke-red-900/70" },

    { variant: "green", href: true, className: "group-hover:fill-green-900/10 group-hover:stroke-green-900/20 group-hover:dark:fill-green-900/10 group-hover:dark:stroke-green-900/50" },
    { variant: "green", highlight: true, className: "fill-green-900/20 stroke-green-900/30 dark:fill-green-900/20 dark:stroke-green-900/70" },
  ],
})
