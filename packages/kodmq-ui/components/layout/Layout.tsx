import { ReactNode } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Toasts from "@/components/ui/Toasts"

export type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-screen flex flex-1 flex-row">
      <div className="fixed flex h-screen shrink-0 flex-col overflow-hidden dark:border-white/10 lg:w-72 xl:w-80">
        <Sidebar />
      </div>

      <div className="relative min-h-screen flex-1 overflow-hidden border-l border-zinc-100 dark:border-zinc-800 lg:ml-72 xl:ml-80">
        <div className="w-full p-12">
          {children}
        </div>
        
        <Toasts />
      </div>
    </div>
  )
}
