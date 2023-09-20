"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var process_1 = require("process");
var Adapter_ts_1 = require("./adapters/Adapter.ts");
var RedisAdapter_ts_1 = require("./adapters/RedisAdapter.ts");
var Config_ts_1 = require("./Config.ts");
var errors_ts_1 = require("./errors.ts");
var Job_ts_1 = require("./Job.ts");
var Worker_ts_1 = require("./Worker.ts");
var statuses_ts_1 = require("./statuses.ts");
var DefaultConcurrency = parseInt(((_a = process_1.default === null || process_1.default === void 0 ? void 0 : process_1.default.env) === null || _a === void 0 ? void 0 : _a.KODMQ_CONCURRENCY) || "1");
var KodMQ = /** @class */ (function () {
    /**
     * Create a new KodMQ instance
     *
     * @param config
     */
    function KodMQ(config) {
        if (config === void 0) { config = {}; }
        this.workers = [];
        if (config.adapter) {
            var isAdapter = config.adapter instanceof Adapter_ts_1.default;
            if (!isAdapter)
                throw new errors_ts_1.KodMQError("KodMQ requires adapter to be an instance of Adapter");
        }
        this.config = __assign(__assign({}, Config_ts_1.DefaultConfig), config);
        this.adapter = (config.adapter || new RedisAdapter_ts_1.default());
        this.handlers = config.handlers || {};
    }
    /**
     * Push a job to the queue
     *
     * @param jobName
     * @param jobData
     */
    KodMQ.prototype.perform = function (jobName, jobData) {
        return __awaiter(this, void 0, void 0, function () {
            var job, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Job_ts_1.default.create(jobName, jobData, this)];
                    case 1:
                        job = _a.sent();
                        return [4 /*yield*/, this.adapter.pushJob(job)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, job];
                    case 3:
                        e_1 = _a.sent();
                        if (e_1 instanceof errors_ts_1.KodMQError)
                            throw e_1;
                        throw new errors_ts_1.KodMQError("Failed to perform job \"".concat(jobName, "\""), e_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule a job to run at a specific time
     *
     * @param jobName
     * @param jobData
     * @param runAt
     */
    KodMQ.prototype.schedule = function (runAt, jobName, jobData) {
        return __awaiter(this, void 0, void 0, function () {
            var job, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Job_ts_1.default.create(jobName, jobData, this)];
                    case 1:
                        job = _a.sent();
                        return [4 /*yield*/, this.adapter.pushJob(job, runAt)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, job];
                    case 3:
                        e_2 = _a.sent();
                        if (e_2 instanceof errors_ts_1.KodMQError)
                            throw e_2;
                        throw new errors_ts_1.KodMQError("Failed to schedule job \"".concat(jobName, "\""), e_2);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get jobs from the queue
     *
     * @param options
     */
    KodMQ.prototype.getJobs = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.adapter.getJobs(options)];
            });
        });
    };
    /**
     * Get workers
     */
    KodMQ.prototype.getWorkers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.adapter.getWorkers()];
            });
        });
    };
    /**
     * Wait until all jobs are completed
     *
     * @param timeout
     */
    KodMQ.prototype.waitUntilAllJobsCompleted = function (timeout) {
        if (timeout === void 0) { timeout = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var pendingJobs, scheduledJobs, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getJobs({ status: statuses_ts_1.Pending })];
                    case 2:
                        pendingJobs = _a.sent();
                        return [4 /*yield*/, this.getJobs({ status: statuses_ts_1.Scheduled })];
                    case 3:
                        scheduledJobs = _a.sent();
                        if (pendingJobs.length === 0 && scheduledJobs.length === 0)
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeout); })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_3 = _a.sent();
                        if (e_3 instanceof errors_ts_1.KodMQError)
                            throw e_3;
                        throw new errors_ts_1.KodMQError("Failed to wait until all jobs are completed", e_3);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * DANGER! This will clear all jobs and workers from the queue
     *
     * @param options
     */
    KodMQ.prototype.clearAll = function (options) {
        if (options === void 0) { options = { iKnowWhatIAmDoing: false }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!options.iKnowWhatIAmDoing && process_1.default.env.NODE_ENV === "production") {
                    throw new errors_ts_1.KodMQError("KodMQ.clearAll() is not allowed in production. If you really want to do this, run KodMQ.clearAll({ iKnowWhatIAmDoing: true })");
                }
                return [2 /*return*/, this.adapter.clearAll()];
            });
        });
    };
    /**
     * Start the queue
     *
     * @param options
     */
    KodMQ.prototype.start = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, concurrency, i, worker, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.workers.length > 0)
                            throw new errors_ts_1.KodMQError("KodMQ is already started");
                        if (Object.keys(this.handlers).length === 0)
                            throw new errors_ts_1.KodMQError("KodMQ requires at least one handler to start");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        promises = [];
                        concurrency = options.concurrency || DefaultConcurrency;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < concurrency)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Worker_ts_1.default.create(this)];
                    case 3:
                        worker = _a.sent();
                        this.workers.push(worker);
                        promises.push(worker.start());
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, Promise.all(promises)];
                    case 6:
                        e_4 = _a.sent();
                        if (e_4 instanceof errors_ts_1.KodMQError)
                            throw e_4;
                        throw new errors_ts_1.KodMQError("Failed to start queue", e_4);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the queue
     */
    KodMQ.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, _i, _a, worker, e_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        promises = [];
                        for (_i = 0, _a = this.workers; _i < _a.length; _i++) {
                            worker = _a[_i];
                            promises.push(worker.stop());
                            promises.push(worker.waitForStatus(statuses_ts_1.Stopped));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.adapter.closeConnection()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _b.sent();
                        if (e_5 instanceof errors_ts_1.KodMQError)
                            throw e_5;
                        throw new errors_ts_1.KodMQError("Failed to stop queue", e_5);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if this is a KodMQ instance
     */
    KodMQ.prototype.isKodMQ = function () {
        return true;
    };
    return KodMQ;
}());
exports.default = KodMQ;
