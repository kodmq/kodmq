import { ComponentProps } from "react"

export default function AlertIcon(props: ComponentProps<"svg">) {
  const strokeWidth = props.strokeWidth || "1.5"

  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g
          transform="translate(2.000000, 3.000000)"
          stroke="currentColor"
        >
          <path
            d="M2.814,17.4368 L17.197,17.4368 C18.779,17.4368 19.772,15.7268 18.986,14.3528 L11.8,1.7878 C11.009,0.4048 9.015,0.4038 8.223,1.7868 L1.025,14.3518 C0.239,15.7258 1.231,17.4368 2.814,17.4368 Z"
            strokeWidth={strokeWidth}
          />
          <line
            x1="10.0025"
            y1="10.4148"
            x2="10.0025"
            y2="7.3148"
            strokeWidth={strokeWidth}
          />
          <line
            x1="9.995"
            y1="13.5"
            x2="10.005"
            y2="13.5"
            strokeWidth={strokeWidth}
          />
        </g>
      </g>
    </svg>
  )
}
