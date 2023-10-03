import { ComponentProps, ReactNode } from "react"
import { ExtendProps } from "@/lib/types"
import { cn } from "@/lib/utils"

export type InfoListRootProps = ComponentProps<"dl">

export function Root({ className, children, ...props }: InfoListRootProps) {
  return (
    <dl
      className={cn("divide-y divide-gray-100 dark:divide-zinc-800", className)}
      {...props}
    >
      {children}
    </dl>
  )
}

export type InfoListItemProps = ExtendProps<"div", {
  label: ReactNode
  children: ReactNode
}>

export function Item({ label, children, className, ...props }: InfoListItemProps) {
  return (
    <div
      className={cn("px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0", className)}
      {...props}
    >
      <dt className="text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">{children}</dd>
    </div>
  )
}
