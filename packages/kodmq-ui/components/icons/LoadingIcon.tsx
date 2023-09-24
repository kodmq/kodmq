import { ComponentProps } from "react"

export default function LoadingIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      width="32px"
      height="32px"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.2"
      />

      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="25, 100"
        strokeDashoffset="0"
        className="origin-center animate-spin"
      />
    </svg>
  )
}
