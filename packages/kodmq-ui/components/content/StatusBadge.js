"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var class_variance_authority_1 = require("class-variance-authority");
var src_1 = require("kodmq/src");
var badge_1 = require("@/components/ui/badge");
function StatusBadge(_a) {
    var status = _a.status;
    return (<badge_1.Badge variant="secondary">
      <span className={indicatorVariants({ status: status })}/>
      {src_1.ReadableStatuses[status]}
    </badge_1.Badge>);
}
exports.default = StatusBadge;
var indicatorVariants = (0, class_variance_authority_1.cva)([
    "inline-block w-2 h-2 rounded-full mr-1",
], {
    variants: {
        status: (_a = {},
            _a[src_1.Pending] = "bg-yellow-500",
            _a[src_1.Scheduled] = "bg-blue-500",
            _a[src_1.Active] = "bg-green-500",
            _a[src_1.Completed] = "bg-green-500",
            _a[src_1.Failed] = "bg-red-500",
            _a[src_1.Idle] = "bg-gray-500",
            _a[src_1.Stopping] = "bg-yellow-500",
            _a[src_1.Stopped] = "bg-red-500",
            _a),
    },
});
