"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var link_1 = require("next/link");
var navigation_menu_1 = require("@/components/ui/navigation-menu");
var NavigationItems = [
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
];
function TopBar(_a) {
    return (<div className="container mx-auto py-2 flex gap-2 items-center">
      <link_1.default href="/" className="font-black text-xl">
        KodMQ
      </link_1.default>

      <navigation_menu_1.NavigationMenu className="ml-auto">
        <navigation_menu_1.NavigationMenuList>
          {NavigationItems.map(function (_a) {
            var name = _a.name, href = _a.href;
            return (<navigation_menu_1.NavigationMenuItem key={name}>
              <link_1.default href={href} legacyBehavior passHref>
                <navigation_menu_1.NavigationMenuLink className={(0, navigation_menu_1.navigationMenuTriggerStyle)()}>
                  {name}
                </navigation_menu_1.NavigationMenuLink>
              </link_1.default>
            </navigation_menu_1.NavigationMenuItem>);
        })}
        </navigation_menu_1.NavigationMenuList>
      </navigation_menu_1.NavigationMenu>
    </div>);
}
exports.default = TopBar;
