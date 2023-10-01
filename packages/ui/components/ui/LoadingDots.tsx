/* eslint-disable react/jsx-max-props-per-line */
import { ReactNode } from "react"
import { ExtendProps } from "@/lib/types"

export type LoadingDotsProps = ExtendProps<"span", {
  text?: ReactNode
}>

export default function LoadingDots({ text = "", ...props }: LoadingDotsProps) {
  return (
    <span {...props}>
      {text && <span>{text}</span>}

      <span className="animate-ping">.</span>
      <span className="animate-ping" style={{ animationDelay: "100ms" }}>.</span>
      <span className="animate-ping" style={{ animationDelay: "200ms" }}>.</span>
    </span>
  )
}
