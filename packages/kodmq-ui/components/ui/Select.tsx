import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type SelectProps = ComponentProps<"select">

export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "relative w-full rounded-lg border-r-[12px] border-transparent bg-zinc-100 px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-0 dark:bg-zinc-800",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
