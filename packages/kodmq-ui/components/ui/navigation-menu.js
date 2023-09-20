"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationMenuViewport = exports.NavigationMenuIndicator = exports.NavigationMenuLink = exports.NavigationMenuTrigger = exports.NavigationMenuContent = exports.NavigationMenuItem = exports.NavigationMenuList = exports.NavigationMenu = exports.navigationMenuTriggerStyle = void 0;
var React = require("react");
var react_icons_1 = require("@radix-ui/react-icons");
var NavigationMenuPrimitive = require("@radix-ui/react-navigation-menu");
var class_variance_authority_1 = require("class-variance-authority");
var utils_1 = require("@/lib/utils");
var NavigationMenu = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<NavigationMenuPrimitive.Root ref={ref} className={(0, utils_1.cn)("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...props}>
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>);
});
exports.NavigationMenu = NavigationMenu;
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;
var NavigationMenuList = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<NavigationMenuPrimitive.List ref={ref} className={(0, utils_1.cn)("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...props}/>);
});
exports.NavigationMenuList = NavigationMenuList;
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;
var NavigationMenuItem = NavigationMenuPrimitive.Item;
exports.NavigationMenuItem = NavigationMenuItem;
var navigationMenuTriggerStyle = (0, class_variance_authority_1.cva)("group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50");
exports.navigationMenuTriggerStyle = navigationMenuTriggerStyle;
var NavigationMenuTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, children = _a.children, props = __rest(_a, ["className", "children"]);
    return (<NavigationMenuPrimitive.Trigger ref={ref} className={(0, utils_1.cn)(navigationMenuTriggerStyle(), "group", className)} {...props}>
    {children}{" "}
    <react_icons_1.ChevronDownIcon className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180" aria-hidden="true"/>
  </NavigationMenuPrimitive.Trigger>);
});
exports.NavigationMenuTrigger = NavigationMenuTrigger;
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;
var NavigationMenuContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<NavigationMenuPrimitive.Content ref={ref} className={(0, utils_1.cn)("left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ", className)} {...props}/>);
});
exports.NavigationMenuContent = NavigationMenuContent;
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;
var NavigationMenuLink = NavigationMenuPrimitive.Link;
exports.NavigationMenuLink = NavigationMenuLink;
var NavigationMenuViewport = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div className={(0, utils_1.cn)("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport className={(0, utils_1.cn)("origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]", className)} ref={ref} {...props}/>
  </div>);
});
exports.NavigationMenuViewport = NavigationMenuViewport;
NavigationMenuViewport.displayName =
    NavigationMenuPrimitive.Viewport.displayName;
var NavigationMenuIndicator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<NavigationMenuPrimitive.Indicator ref={ref} className={(0, utils_1.cn)("top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in", className)} {...props}>
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md"/>
  </NavigationMenuPrimitive.Indicator>);
});
exports.NavigationMenuIndicator = NavigationMenuIndicator;
NavigationMenuIndicator.displayName =
    NavigationMenuPrimitive.Indicator.displayName;
