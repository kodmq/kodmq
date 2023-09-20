"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"


const NavigationItems = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "Workers",
    href: "/workers",
  },
  {
    name: "Jobs",
    href: "/jobs",
  },
]

export type TopBarProps = {}

export default function TopBar({}: TopBarProps) {
  return (
    <div className="container mx-auto py-2 flex gap-2 items-center">
      <Link href="/" className="font-black text-xl">
        KodMQ
      </Link>

      <NavigationMenu className="ml-auto">
        <NavigationMenuList>
          {NavigationItems.map((item) => (
            <NavigationMenuItem>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {item.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
