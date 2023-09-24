import { ReactNode } from "react"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import TopBar from "@/components/layout/TopBar"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

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
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TopBar />

          <div className="container mx-auto pt-4 sm:pt-6">
            {children}
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
