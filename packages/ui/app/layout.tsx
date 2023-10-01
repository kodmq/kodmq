import { ReactNode } from "react"
import Layout from "@/components/layout/Layout"
import Providers from "@/components/Providers"
import { cn } from "@/lib/utils"
import "./global.css"

export type RootLayoutProps = {
	children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning
    >
      <body className={cn("font-sans antialiased min-h-full flex flex-col text-black dark:text-zinc-100 bg-white dark:bg-zinc-900")}>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
