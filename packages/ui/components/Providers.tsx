"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"

export type ProvidersProps = {
	children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  )
}
