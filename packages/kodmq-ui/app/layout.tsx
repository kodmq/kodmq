import { ReactNode } from "react"
import { ThemeProvider } from "@/components/layout/ThemeProvider"

import "./globals.css"
import TopBar from "@/components/layout/TopBar"

export const metadata = {
  title: "KodMQ UI",
  description: "Control panel for KodMQ",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-background text-foreground">
            <TopBar />

            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
