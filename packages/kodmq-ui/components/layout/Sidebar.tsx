"use client"

import { usePathname } from "next/dist/client/components/navigation"
import Link from "next/link"
import HomeIcon from "@/components/icons/HomeIcon"
import JobIcon from "@/components/icons/JobIcon"
import Logo from "@/components/icons/Logo"
import WorkerIcon from "@/components/icons/WorkerIcon"
import { Icon } from "@/lib/types"
import { cn } from "@/lib/utils"

type NavigationItem = {
  name: string
  href: string
  icon: Icon,
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    icon: HomeIcon,
    href: "/",
  },
  {
    name: "Workers",
    icon: WorkerIcon,
    href: "/workers",
  },
  {
    name: "Jobs",
    icon: JobIcon,
    href: "/jobs",
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (item: NavigationItem) => item.href === pathname

  return (
    <>
      <Link
        href="/"
        className="flex -translate-x-1 items-center gap-2 px-7 py-6 text-lg font-extrabold"
      >
        <Logo className="inline-block h-7 w-7" />
        <span>
          KodMQ
          <sup className="font-medium text-indigo-500"> βeta</sup>
        </span>
      </Link>

      <nav className="mt-2">
        <ul className="space-y-0.5 text-sm">
          {navigationItems.map((item) => (
            <li
              key={item.name}
              className="px-4"
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-semibold",
                  isActive(item)
                    ? "bg-zinc-900/5 dark:bg-white/5"
                    : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-600/5 dark:hover:bg-zinc-400/5",
                )}
              >
                <item.icon
                  className={cn(
                    "inline-block h-4 w-4",
                    isActive(item)
                      ? "text-indigo-500"
                      : "text-zinc-500 dark:text-zinc-400",
                  )}
                  strokeWidth={isActive(item) ? 2 : 1.5}
                />

                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
