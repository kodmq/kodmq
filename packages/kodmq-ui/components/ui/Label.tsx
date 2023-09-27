import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type LabelProps = ComponentProps<"label">

export default function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-zinc-600 dark:text-zinc-400 text-sm font-medium", className)}
      {...props}
    >
      {children}
    </label>
  )
}
