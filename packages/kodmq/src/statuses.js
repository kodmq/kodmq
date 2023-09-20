"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadableWorkerStatuses = exports.ReadableJobStatuses = exports.ReadableStatuses = exports.WorkerStatuses = exports.JobStatuses = exports.Stopped = exports.Stopping = exports.Idle = exports.Failed = exports.Completed = exports.Active = exports.Scheduled = exports.Pending = void 0;
exports.Pending = 0;
exports.Scheduled = 1;
exports.Active = 2;
exports.Completed = 3;
exports.Failed = 4;
exports.Idle = 5;
exports.Stopping = 6;
exports.Stopped = 7;
exports.JobStatuses = [
    exports.Pending,
    exports.Scheduled,
    exports.Active,
    exports.Completed,
    exports.Failed,
];
exports.WorkerStatuses = [
    exports.Idle,
    exports.Active,
    exports.Stopping,
    exports.Stopped,
];
exports.ReadableStatuses = (_a = {},
    _a[exports.Pending] = "Pending",
    _a[exports.Scheduled] = "Scheduled",
    _a[exports.Active] = "Active",
    _a[exports.Completed] = "Completed",
    _a[exports.Failed] = "Failed",
    _a[exports.Idle] = "Idle",
    _a[exports.Stopping] = "Stopping",
    _a[exports.Stopped] = "Stopped",
    _a);
exports.ReadableJobStatuses = exports.JobStatuses.reduce(function (acc, status) {
    acc[status] = exports.ReadableStatuses[status];
    return acc;
}, {});
exports.ReadableWorkerStatuses = exports.WorkerStatuses.reduce(function (acc, status) {
    acc[status] = exports.ReadableStatuses[status];
    return acc;
}, {});
