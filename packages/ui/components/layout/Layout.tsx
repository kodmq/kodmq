"use client"

import { ReactNode, useState } from "react"
import { GridPattern } from "@/components/content/GridPattern"
import HamburgerMenuIcon from "@/components/icons/HamburgerMenuIcon"
import Sidebar from "@/components/layout/Sidebar"
import Input from "@/components/ui/Input"
import Toasts from "@/components/ui/Toasts"
import { cn } from "@/lib/utils"

export type LayoutProps = {
	children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="max-w-screen relative flex flex-1 flex-row">
      <div
        className={cn(
          "fixed flex h-screen shrink-0 flex-col overflow-hidden dark:border-white/10 z-30 transition-all duration-300 ease-in-out",
          "w-72 bg-white dark:bg-zinc-900 lg:bg-transparent lg:left-0 xl:w-80 border-r border-zinc-100 dark:border-zinc-800 lg:border-0",
          sidebarOpen ? "left-0" : "-left-72"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
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

        <div className="relative flex h-14 items-center justify-between gap-12 border-b border-zinc-100 bg-white/1 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/2.5 dark:backdrop-blur sm:px-6 lg:px-12">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors duration-200 ease-in-out hover:bg-black/2.5 hover:text-zinc-700 dark:hover:bg-white/2.5 dark:hover:text-zinc-300 lg:hidden"
          >
            <HamburgerMenuIcon className="h-5 w-5" />
          </button>

          <Input
            placeholder="Find jobs..."
            className="w-96"
          />
        </div>

        <div className="relative w-full p-4 sm:p-6 lg:p-12">
          {children}
        </div>
        
        <Toasts />
      </div>
    </div>
  )
}
