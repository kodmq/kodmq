import { ComponentProps } from "react"

export default function HashtagIcon(props: ComponentProps<"svg">) {
  const strokeWidth = props.strokeWidth || "1.5"

  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.875 9.375H18.125M5.875 14.625H18.125"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1172 5L8.36719 19M15.6323 5L13.8823 19"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
