import { ComponentProps } from "react"

export default function Logo(props: ComponentProps<"svg">) {
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
        d="M12.0011 20.7094V15.0469"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.29004 15.0469L12.001 8.94922L20.7119 15.0469M12.0011 3.28906V8.95163"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1815 3.53143C11.6786 3.20827 12.3194 3.20827 12.8166 3.53143L20.3166 8.40683C20.7422 8.68354 20.999 9.15677 20.999 9.66447V14.3355C20.999 14.8432 20.7422 15.3164 20.3166 15.5931L12.8166 20.4685C12.3194 20.7917 11.6786 20.7917 11.1815 20.4685L3.68149 15.5931C3.25583 15.3164 2.99902 14.8432 2.99902 14.3355V9.66447C2.99902 9.15677 3.25583 8.68354 3.68149 8.40683L11.1815 3.53143Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.7099 8.94922L11.999 15.0469L3.28809 8.94922"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
