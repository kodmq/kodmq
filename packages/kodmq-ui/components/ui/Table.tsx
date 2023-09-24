import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type TableProps = ComponentProps<"table">

export function Table({ children }: TableProps) {
  return (
    <table className="min-w-full divide-y divide-zinc-300 overflow-hidden rounded-2xl dark:divide-zinc-700">
      {children}
    </table>
  )
}

export function TableHeader({ children, className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-white/5 dark:bg-white/5", className)}
      {...props}
    >
      {children}
    </thead>
  )
}

export function TableHeaderRow({ children, className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("", className)}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ first, last, children, className, ...props }: ComponentProps<"th"> & { first?: boolean, last?: boolean }) {
  return (
    <th
      className={cn(
        "py-3.5 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100",
        first && "pl-4 pr-3 sm:pl-6 lg:pl-8",
        last && "pl-3 pr-4 sm:pr-6 lg:pr-8",
        !first && !last && "px-3",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableBody({ children, className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn("divide-y divide-zinc-200 dark:divide-zinc-800", className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("hover:bg-zinc-500/5", className)}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ first, last, children, className, ...props }: ComponentProps<"td"> & { first?: boolean, last?: boolean }) {
  return (
    <td
      className={cn(
        "whitespace-nowrap py-4 text-sm text-zinc-500",
        first && "pl-4 pr-3 sm:pl-6 lg:pl-8",
        last && "pl-3 pr-4 sm:pr-6 lg:pr-8",
        !first && !last && "px-3",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  )
}
