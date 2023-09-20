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
var class_variance_authority_1 = require("class-variance-authority");
var tailwind_merge_1 = require("tailwind-merge");
function Heading(_a) {
    var _b = _a.tag, tag = _b === void 0 ? "h1" : _b, className = _a.className, children = _a.children, props = __rest(_a, ["tag", "className", "children"]);
    var Tag = tag;
    return (<Tag className={(0, tailwind_merge_1.twMerge)(titleVariants({ tag: tag }), className)} {...props}>
      {children}
    </Tag>);
}
var titleVariants = (0, class_variance_authority_1.cva)([
    "scroll-m-20 tracking-tight",
], {
    variants: {
        tag: {
            h1: "text-4xl font-extrabold lg:text-5xl",
            h2: "border-b pb-2 text-3xl font-semibold transition-colors first:mt-0",
            h3: "text-2xl font-semibold",
            h4: "text-xl font-semibold",
            h5: "text-lg font-semibold",
            h6: "text-md font-semibold",
        },
    },
});
exports.default = Heading;
