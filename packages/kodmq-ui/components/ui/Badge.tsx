import { cva, VariantProps } from "class-variance-authority"
import { ExtendProps } from "@/lib/types"
import { cn } from "@/lib/utils"

export type BadgeProps = ExtendProps<"span", VariantProps<typeof badgeVariants>>

export default function Badge({ variant = "primary", children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </span>
  )
}

const badgeVariants = cva([
  "inline-block whitespace-nowrap rounded px-2.5 py-0.5 text-xs font-medium leading-4",
], {
  variants: {
    variant: {
      primary: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
    },
  },
})
