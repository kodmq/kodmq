import { ReactNode } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Toasts from "@/components/ui/Toasts"

export type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-screen flex flex-1 flex-row">
      <div className="shrink-0 overflow-hidden border-r border-zinc-900/10 dark:border-white/10 lg:w-72 xl:w-80">
        <Sidebar />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="w-full p-12">
          {children}
        </div>
        
        <Toasts />
      </div>
    </div>
  )
}
