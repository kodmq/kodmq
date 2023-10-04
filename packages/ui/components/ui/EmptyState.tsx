import { createElement, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ExtendProps, Icon, IconProps } from "@/lib/types"
import { cn } from "@/lib/utils"

export type EmptyStateProps = ExtendProps<"div", {
  icon: Icon
  iconProps?: IconProps
  title: ReactNode
  description: ReactNode
  button?: ReactNode
}>

export default function EmptyState({ icon, iconProps = {}, title, description, button, className, ...props }: EmptyStateProps) {
  const { className: iconClassName, ...restIconProps } = iconProps
  
  return (
    <div
      className={twMerge("text-center py-16 md:py-32 lg:py-40", className)}
      {...props}
    >
      {createElement(icon, {
        className: cn("mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600", iconClassName),
        strokeWidth: 1,
        ...restIconProps,
      })}

      <h3 className="text-accent mt-2 font-semibold md:mt-4">{title}</h3>
      <p className="mx-auto mt-1 max-w-prose text-sm text-zinc-500">{description}</p>

      {button && (
        <div className="mt-6 flex justify-center">
          {button}
        </div>
      )}
    </div>
  )
}
