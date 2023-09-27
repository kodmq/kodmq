import { ReactNode } from "react"
import { GridPattern } from "@/components/content/GridPattern"
import Sidebar from "@/components/layout/Sidebar"
import Input from "@/components/ui/Input"
import Toasts from "@/components/ui/Toasts"

export type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="max-w-screen relative flex flex-1 flex-row">
      <div className="fixed flex h-screen shrink-0 flex-col overflow-hidden dark:border-white/10 lg:w-72 xl:w-80">
        <Sidebar />
      </div>

      <div className="relative min-h-screen flex-1 overflow-hidden border-l border-zinc-100 dark:border-zinc-800 lg:ml-72 xl:ml-80">
        <div className="absolute inset-0 -top-32 h-64 skew-y-[-9deg]">
          <GridPattern
            x="6%"
            width={50}
            height={50}
            preset={0}
            className="h-full w-full skew-y-0 fill-indigo-900/20 stroke-indigo-900/30 dark:fill-indigo-900/10 dark:stroke-indigo-900/50"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-900" />
        </div>

        <div className="relative flex h-14 items-center justify-between gap-12 border-b border-zinc-100 bg-white/1 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/2.5 dark:backdrop-blur sm:px-6 lg:px-8">
          <Input
            placeholder="Find jobs..."
            className="w-96"
          />
        </div>

        <div className="relative w-full p-12">
          {children}
        </div>
        
        <Toasts />
      </div>
    </div>
  )
}
