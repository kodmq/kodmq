import { cva } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { ExtendProps } from "@/lib/types"

type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export type HeadingProps<T extends Tag = "h1"> = ExtendProps<T, {
  tag?: T
}>

function Heading<T extends Tag = "h1">({ tag = "h1" as T, className, children, ...props }: HeadingProps<T>) {
  const Tag = tag as HTMLHeadingElement["tagName"]

  return (
    <Tag
      className={twMerge(
        titleVariants({ tag }),
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

const titleVariants = cva([
  "scroll-m-20 tracking-tight",
], {
  variants: {
    tag: {
      h1: "text-4xl font-extrabold lg:text-5xl",
      h2: "border-b pb-2 text-3xl font-semibold transition-colors first:mt-0",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
      h5: "text-lg font-semibold",
      h6: "text-md font-semibold",
    },
  },
})

export default Heading
