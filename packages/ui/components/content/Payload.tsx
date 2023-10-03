import { ExtendProps } from "@/lib/types"

export type PayloadProps = ExtendProps<"pre", {
  format?: boolean
}>

export default function Payload({ format = false, children, ...props }: PayloadProps) {
  return (
    <pre {...props}>{JSON.stringify(children, null, format ? 2 : 0)}</pre>
  )
}
