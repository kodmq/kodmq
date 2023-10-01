import { createElement, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ExtendProps, Icon } from "@/lib/types"

export type EmptyStateProps = ExtendProps<"div", {
  icon: Icon
  title: ReactNode
  description: ReactNode
  button?: ReactNode
}>

function EmptyState({ icon, title, description, button, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={twMerge("text-center py-16 md:py-32 lg:py-40", className)}
      {...props}
    >
      {createElement(icon, { className: "mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600", strokeWidth: 1 })}

      <h3 className="text-accent mt-2 font-semibold md:mt-4">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>

      {button && (
        <div className="mt-6 flex justify-center">
          {button}
        </div>
      )}
    </div>
  )
}

export default EmptyState
