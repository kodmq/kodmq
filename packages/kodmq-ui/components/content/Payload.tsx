import { ComponentProps } from "react"

export type PayloadProps = ComponentProps<"pre">

export default function Payload({ children, ...props }: PayloadProps) {
  return (
    <pre {...props}>{JSON.stringify(children)}</pre>
  )
}
