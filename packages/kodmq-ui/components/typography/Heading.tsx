import { cva } from "class-variance-authority"
import { twMerge } from "tailwind-merge"
import { ExtendProps } from "@/lib/types"

export type Tag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

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
  "dark:text-white",
], {
  variants: {
    tag: {
      h1: "mb-4 text-4xl font-extrabold leading-9",
      h2: "mb-3 text-2xl font-bold leading-8",
      h3: "mb-2 text-lg font-bold leading-7",
      h4: "",
      h5: "",
      h6: "",
    },
  },
})

export default Heading
