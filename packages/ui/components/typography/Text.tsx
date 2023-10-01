import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type TextProps = ComponentProps<"p">

export default function Text({ children, className, ...props }: TextProps) {
  return (
    <p
      className={cn("w-prose mb-0.5 leading-7 dark:text-zinc-400", className)}
      {...props}
    >
      {children}
    </p>
  )
}
