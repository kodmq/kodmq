import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type CardSimpleProps = ComponentProps<"div">

export default function CardSimple({ className, children, ...props }: CardSimpleProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 bg-black/2.5 dark:border-white/5 dark:bg-white/1  ",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
