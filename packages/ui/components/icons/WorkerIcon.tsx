import { ComponentProps } from "react"

export default function WorkerIcon(props: ComponentProps<"svg">) {
  const strokeWidth = props.strokeWidth ?? 1.5

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
        d="M5.93739 20.9999H18.0626C19.6697 20.9999 20.9726 19.6971 20.9726 18.0899V16.5223C20.9726 14.9152 19.6697 13.6123 18.0626 13.6123H5.93739C4.33021 13.6123 3.02734 14.9152 3.02734 16.5223V18.0899C3.02734 19.6971 4.33021 20.9999 5.93739 20.9999Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.39062 17.3057H7.91346M13.1027 17.3057H16.6636"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.93739 10.3867H18.0626C19.6697 10.3867 20.9726 9.08379 20.9726 7.47662V5.91004C20.9726 4.30287 19.6697 3 18.0626 3H5.93739C4.33021 3 3.02734 4.30287 3.02734 5.91004V7.47661C3.02734 9.08379 4.33021 10.3867 5.93739 10.3867Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.39062 6.69336H7.91346M13.1027 6.69336H16.6636"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
