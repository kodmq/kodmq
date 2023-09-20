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
var react_1 = require("react");
var tabs_1 = require("@/components/ui/tabs");
function JobStatusSwitcher(_a) {
    var currentStatus = _a.currentStatus, statuses = _a.statuses, props = __rest(_a, ["currentStatus", "statuses"]);
    var handleChange = (0, react_1.useCallback)(function (value) {
        console.log(value);
    }, []);
    return (<tabs_1.Tabs defaultValue={currentStatus.toString()} onValueChange={handleChange} {...props}>
      <tabs_1.TabsList>
        {Object.keys(statuses).map(function (status) { return (<tabs_1.TabsTrigger key={status} value={status.toString()}>
            {statuses[status]}
          </tabs_1.TabsTrigger>); })}
      </tabs_1.TabsList>
    </tabs_1.Tabs>);
}
exports.default = JobStatusSwitcher;
