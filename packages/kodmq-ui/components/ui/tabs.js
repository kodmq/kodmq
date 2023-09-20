"use client";
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
exports.TabsContent = exports.TabsTrigger = exports.TabsList = exports.Tabs = void 0;
var React = require("react");
var TabsPrimitive = require("@radix-ui/react-tabs");
var utils_1 = require("@/lib/utils");
var Tabs = TabsPrimitive.Root;
exports.Tabs = Tabs;
var TabsList = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.List ref={ref} className={(0, utils_1.cn)("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props}/>);
});
exports.TabsList = TabsList;
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Trigger ref={ref} className={(0, utils_1.cn)("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className)} {...props}/>);
});
exports.TabsTrigger = TabsTrigger;
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<TabsPrimitive.Content ref={ref} className={(0, utils_1.cn)("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props}/>);
});
exports.TabsContent = TabsContent;
TabsContent.displayName = TabsPrimitive.Content.displayName;
