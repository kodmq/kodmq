"use client"

import { motion } from "framer-motion"
import { JobStatuses, ReadableStatuses, WorkerStatuses } from "@kodmq/core/constants"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import DataRefreshInterval from "@/components/app/DataRefreshInterval"
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
  active?: boolean
  subItems?: NavigationSubItem[]
}

type NavigationSubItem = {
  name: string
  queryParams: Record<string, string>
  active?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    icon: HomeIcon,
    href: "/",
  },
  {
    name: "Jobs",
    icon: JobIcon,
    href: "/jobs",
    subItems: [
      {
        name: "All",
        queryParams: {},
      },
      ...JobStatuses.map((status) => ({
        name: ReadableStatuses[status],
        queryParams: { status: status.toString() },
      })),
    ],
  },
  {
    name: "Workers",
    icon: WorkerIcon,
    href: "/workers",
    subItems: [
      {
        name: "All",
        queryParams: {},
      },
      ...WorkerStatuses.map((status) => ({
        name: ReadableStatuses[status],
        queryParams: { status: status.toString() },
      })),
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (item: NavigationItem) => item.href === pathname
  const isActiveSubItem = (item: NavigationItem, subItem: NavigationSubItem) => {
    if (!isActive(item)) return false
    if (!Object.keys(subItem.queryParams).length) return !searchParams.size

    return Object.entries(subItem.queryParams).every(([key, value]) => searchParams.get(key) === value)
  }

  const items = useMemo(() => (
    navigationItems.map((item) => ({
      ...item,
      active: isActive(item),

      subItems: item.subItems?.map((subItem) => ({
        ...subItem,
        active: isActiveSubItem(item, subItem),
      })),
    }))
  ), [pathname, searchParams])

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
          {items.map((item) => (
            <li
              key={item.name}
              className="px-4"
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-semibold",
                  item.active
                    ? "bg-zinc-900/5 dark:bg-white/5"
                    : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-600/5 dark:hover:bg-zinc-400/5",
                )}
              >
                <item.icon
                  className={cn(
                    "inline-block h-4 w-4",
                    item.active
                      ? "text-indigo-500"
                      : "text-zinc-500 dark:text-zinc-400",
                  )}
                  strokeWidth={item.active ? 2 : 1.5}
                />

                <span>{item.name}</span>
              </Link>

              {item.subItems && (
                <motion.ul
                  initial={item.active ? "open" : "closed"}
                  animate={item.active ? "open" : "closed"}
                  exit="closed"
                  variants={{
                    open: {
                      opacity: 1,
                      height: "auto",
                    },
                    closed: {
                      opacity: 0,
                      height: 0,
                    },
                  }}
                  className="mt-1 space-y-0.5 overflow-hidden pl-2.5 text-sm"
                >
                  {item.subItems.map((subItem) => (
                    <li
                      key={subItem.name}
                      className="px-4"
                    >
                      <Link
                        href={{ pathname: item.href, query: subItem.queryParams }}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-medium",
                          "hover:bg-zinc-600/5 dark:hover:bg-zinc-400/5",
                          subItem.active
                            ? "text-indigo-500"
                            : "text-zinc-500",
                        )}
                      >
                        <span>{subItem.name}</span>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <DataRefreshInterval className="mt-auto px-7 py-6" />
    </>
  )
}
