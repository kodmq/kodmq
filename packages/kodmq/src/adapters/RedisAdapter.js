"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var errors_ts_1 = require("../errors.ts");
var Job_ts_1 = require("../Job.ts");
var Adapter_ts_1 = require("./Adapter.ts");
var statuses_ts_1 = require("../statuses.ts");
var GlobalPrefix = "kmq:";
var WorkersKeyPrefix = "".concat(GlobalPrefix, ":w:");
var JobKeys = (_a = {},
    _a[statuses_ts_1.Pending] = "".concat(GlobalPrefix, ":j:p"),
    _a[statuses_ts_1.Scheduled] = "".concat(GlobalPrefix, ":j:s"),
    _a[statuses_ts_1.Active] = "".concat(GlobalPrefix, ":j:a"),
    _a[statuses_ts_1.Completed] = "".concat(GlobalPrefix, ":j:c"),
    _a[statuses_ts_1.Failed] = "".concat(GlobalPrefix, ":j:f"),
    _a);
var RedisAdapter = /** @class */ (function (_super) {
    __extends(RedisAdapter, _super);
    function RedisAdapter(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        try {
            _this.client = new ioredis_1.default(options);
        }
        catch (e) {
            throw new errors_ts_1.KodMQAdapterError("Cannot create Redis client", e);
        }
        return _this;
    }
    //
    // Jobs
    //
    RedisAdapter.prototype.getNextJobId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.client.incr("".concat(GlobalPrefix, ":jid"))];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot get next job ID", e);
                }
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.getJobs = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, limit, offset, jobs, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        status_1 = options.status;
                        limit = (options.limit || 0);
                        offset = (options.offset || 0);
                        return [4 /*yield*/, this.getFromSet(JobKeys[status_1], "-inf", "+inf", offset, limit - 1)];
                    case 1:
                        jobs = _a.sent();
                        return [2 /*return*/, Promise.all(jobs.map(function (job) { return _this.deserializeJob(job); }))];
                    case 2:
                        e_1 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot get jobs", e_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.saveJob = function (job, status) {
        return __awaiter(this, void 0, void 0, function () {
            var serialized, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.serializeJob(job)];
                    case 1:
                        serialized = _a.sent();
                        return [4 /*yield*/, this.addToSet(JobKeys[status], job.id, serialized)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot save job", e_2);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Push a job to the queue. Please notice that scheduled jobs are stored in a different key and structure.
     *
     * @param job
     * @param runAt
     */
    RedisAdapter.prototype.pushJob = function (job, runAt) {
        return __awaiter(this, void 0, void 0, function () {
            var serialized, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.serializeJob(job)];
                    case 1:
                        serialized = _a.sent();
                        if (!runAt) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addToSet(JobKeys[statuses_ts_1.Scheduled], runAt.getTime(), serialized)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.addToSet(JobKeys[statuses_ts_1.Pending], job.id, serialized)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_3 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot push job to queue", e_3);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.popJob = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, scheduledJob, score, job_1, job, e_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getFromSetWithScores(JobKeys[statuses_ts_1.Scheduled], "-inf", Date.now(), 0, 1)];
                    case 1:
                        _a = _b.sent(), scheduledJob = _a[0], score = _a[1];
                        if (!scheduledJob) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.deserializeJob(scheduledJob)];
                    case 2:
                        job_1 = _b.sent();
                        return [4 /*yield*/, this.removeFromSet(JobKeys[statuses_ts_1.Scheduled], score)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, job_1];
                    case 4: return [4 /*yield*/, this.popFromSet(JobKeys[statuses_ts_1.Pending])];
                    case 5:
                        job = _b.sent();
                        if (!job)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.deserializeJob(job)];
                    case 6:
                        e_4 = _b.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot pop job from queue", e_4);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.subscribeToJobs = function (handler, keepSubscribed) {
        return __awaiter(this, void 0, void 0, function () {
            var job, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 4];
                        if (!keepSubscribed())
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, this.popJob()];
                    case 2:
                        job = _a.sent();
                        if (!job)
                            return [3 /*break*/, 1];
                        return [4 /*yield*/, handler(job)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_5 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot subscribe to jobs", e_5);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.serializeJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, JSON.stringify([job.id, job.name, job.data, job.failedAttempts, job.errorMessage, job.errorStack])];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot serialize job", e);
                }
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.deserializeJob = function (serialized) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, name_1, data, failedAttempts, errorMessage, errorStack;
            return __generator(this, function (_b) {
                try {
                    _a = JSON.parse(serialized), id = _a[0], name_1 = _a[1], data = _a[2], failedAttempts = _a[3], errorMessage = _a[4], errorStack = _a[5];
                    return [2 /*return*/, new Job_ts_1.default(id, name_1, data, failedAttempts, errorMessage, errorStack)];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot deserialize job", e);
                }
                return [2 /*return*/];
            });
        });
    };
    //
    // Workers
    //
    RedisAdapter.prototype.getNextWorkerId = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.client.incr("".concat(GlobalPrefix, ":wid"))];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot get next worker ID", e);
                }
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.getWorkers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workersKeys, workers, e_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.client.keys("".concat(WorkersKeyPrefix, "*"))];
                    case 1:
                        workersKeys = _a.sent();
                        return [4 /*yield*/, Promise.all(workersKeys.map(function (key) { return _this.client.get(key); }))];
                    case 2:
                        workers = _a.sent();
                        return [2 /*return*/, Promise.all(workers.filter(Boolean).map(function (worker) { return _this.deserializeWorker(worker); }))];
                    case 3:
                        e_6 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot get workers", e_6);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.saveWorker = function (worker) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, e_7;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _b = (_a = this.client).set;
                        _c = ["".concat(WorkersKeyPrefix).concat(worker.id)];
                        return [4 /*yield*/, this.serializeWorker(worker)];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                    case 2:
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _d.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot save worker", e_7);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.deleteWorker = function (worker) {
        return __awaiter(this, void 0, void 0, function () {
            var e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.del("".concat(WorkersKeyPrefix).concat(worker.id))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot delete worker", e_8);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.serializeWorker = function (worker) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_d) {
                try {
                    return [2 /*return*/, JSON.stringify([worker.id, worker.startedAt, worker.status, (_a = worker.currentJob) === null || _a === void 0 ? void 0 : _a.id, (_b = worker.currentJob) === null || _b === void 0 ? void 0 : _b.name, (_c = worker.currentJob) === null || _c === void 0 ? void 0 : _c.data])];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot serialize worker", e);
                }
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.deserializeWorker = function (serialized) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, id, startedAtRaw, status_2, currentJobId, currentJobName, currentJobData, startedAt, currentJob;
            return __generator(this, function (_b) {
                try {
                    _a = JSON.parse(serialized), id = _a[0], startedAtRaw = _a[1], status_2 = _a[2], currentJobId = _a[3], currentJobName = _a[4], currentJobData = _a[5];
                    startedAt = new Date(startedAtRaw);
                    currentJob = currentJobId ? new Job_ts_1.default(currentJobId, currentJobName, currentJobData) : null;
                    return [2 /*return*/, { id: id, startedAt: startedAt, status: status_2, currentJob: currentJob }];
                }
                catch (e) {
                    throw new errors_ts_1.KodMQAdapterError("Cannot deserialize worker", e);
                }
                return [2 /*return*/];
            });
        });
    };
    //
    // Other
    //
    RedisAdapter.prototype.clearAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, _i, keys_1, key, e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.client.keys("".concat(GlobalPrefix, "*"))];
                    case 1:
                        keys = _a.sent();
                        _i = 0, keys_1 = keys;
                        _a.label = 2;
                    case 2:
                        if (!(_i < keys_1.length)) return [3 /*break*/, 5];
                        key = keys_1[_i];
                        return [4 /*yield*/, this.client.del(key)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_9 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot clear all data", e_9);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.openConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.connect()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_10 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot open connection", e_10);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.closeConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.quit()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_11 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot close connection", e_11);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    //
    // Redis sorted sets
    //
    RedisAdapter.prototype.getFromSet = function (key, min, max, offset, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var e_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.zrangebyscore(key, min, max, "LIMIT", offset, offset + limit)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_12 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot get from sorted set", e_12);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.getFromSetWithScores = function (key, min, max, offset, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var e_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.zrangebyscore(key, min, max, "WITHSCORES", "LIMIT", offset, offset + limit)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_13 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot get from sorted set with scores", e_13);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.addToSet = function (key, score, value) {
        return __awaiter(this, void 0, void 0, function () {
            var e_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.zadd(key, score, value)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_14 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot add to sorted set", e_14);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.popFromSet = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var item, e_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.zpopmin(key)];
                    case 1:
                        item = _a.sent();
                        return [2 /*return*/, item ? item[0] : null];
                    case 2:
                        e_15 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot pop from sorted set", e_15);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RedisAdapter.prototype.removeFromSet = function (key, score) {
        return __awaiter(this, void 0, void 0, function () {
            var e_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.zremrangebyscore(key, score, score)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_16 = _a.sent();
                        throw new errors_ts_1.KodMQAdapterError("Cannot remove from sorted set", e_16);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RedisAdapter;
}(Adapter_ts_1.default));
exports.default = RedisAdapter;
