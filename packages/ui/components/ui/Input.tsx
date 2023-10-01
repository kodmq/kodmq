import { ExtendProps, Icon } from "@/lib/types"
import { cn } from "@/lib/utils"

export type InputProps = ExtendProps<"input", {
  icon?: Icon
}>

export default function Input({ className, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "flex gap-2 items-center",
        "h-8 w-full rounded-full bg-white/50 pl-4 pr-5 text-sm text-zinc-500 ring-1 ring-zinc-900/7.5 transition hover:ring-zinc-900/20 dark:bg-white/2.5 dark:text-zinc-400 dark:ring-inset dark:ring-white/5 dark:hover:ring-white/20",
        className
      )}
    >
      <input
        className="w-full border-none bg-transparent placeholder:text-zinc-500 focus:outline-none focus:ring-0"
        {...props}
      />
    </div>
  )
}
