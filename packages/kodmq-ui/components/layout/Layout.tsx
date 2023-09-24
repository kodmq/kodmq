import { ReactNode } from "react"
import { HeroPattern } from "@/components/content/HeroPattern"
import Sidebar from "@/components/layout/Sidebar"
import Toasts from "@/components/ui/Toasts"

export type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-1 flex-row">
      <div className="shrink-0 border-r border-zinc-900/10 dark:border-white/10 lg:w-72 xl:w-80">
        <Sidebar />
      </div>

      <div className="relative flex-1">
        <HeroPattern />

        <div className="w-full max-w-screen-xl p-12">
          {children}
        </div>
        
        <Toasts />
      </div>
    </div>
  )
}
