import { cva, VariantProps } from "class-variance-authority"
import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import LoadingIcon from "@/components/icons/LoadingIcon"
import LoadingDots from "@/components/ui/LoadingDots"
import { ExtendProps } from "@/lib/types"

export type LoaderProps = ExtendProps<"svg", VariantProps<typeof loaderVariants> & {
	text?: ReactNode
}>

function Loader({ size = "md", text, className, ...props }: LoaderProps) {
  const icon = (
    <LoadingIcon
      className={twMerge(loaderVariants({ size }), className)}
      {...props}
    />
  )

  if (!text) return icon

  return (
    <div className={containerVariants({ size })}>
      {icon}

      <LoadingDots
        text={text}
        className={textVariants({ size })}
      />
    </div>
  )
}

const loaderVariants = cva([""], {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
})

const textVariants = cva(["inline-block font-medium"], {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
})

const containerVariants = cva(["flex items-center"], {
  variants: {
    size: {
      xs: "gap-0.5",
      sm: "gap-1.5",
      md: "gap-1.5",
      lg: "gap-2",
    },
  },
})

export default Loader
