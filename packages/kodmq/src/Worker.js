"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var errors_ts_1 = require("./errors.ts");
var statuses_ts_1 = require("./statuses.ts");
var Worker = /** @class */ (function () {
    function Worker(id, kodmq) {
        this.status = statuses_ts_1.Idle;
        this.currentJob = null;
        this.id = id;
        this.startedAt = new Date();
        this.kodmq = kodmq;
    }
    /**
     * Start jobs processing
     */
    Worker.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.update({ status: statuses_ts_1.Active })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.kodmq.adapter.subscribeToJobs(function (job) { return __awaiter(_this, void 0, void 0, function () {
                                var e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (this.status !== statuses_ts_1.Active)
                                                return [2 /*return*/];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 5, 8, 10]);
                                            return [4 /*yield*/, this.update({ currentJob: job })];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, job.run(this.kodmq)];
                                        case 3:
                                            _a.sent();
                                            return [4 /*yield*/, this.kodmq.adapter.saveJob(job, statuses_ts_1.Completed)];
                                        case 4:
                                            _a.sent();
                                            return [3 /*break*/, 10];
                                        case 5:
                                            e_1 = _a.sent();
                                            job.failedAttempts += 1;
                                            return [4 /*yield*/, this.kodmq.adapter.saveJob(job, statuses_ts_1.Failed)];
                                        case 6:
                                            _a.sent();
                                            return [4 /*yield*/, this.retry(job)];
                                        case 7:
                                            _a.sent();
                                            return [3 /*break*/, 10];
                                        case 8: return [4 /*yield*/, this.update({ currentJob: null })];
                                        case 9:
                                            _a.sent();
                                            return [7 /*endfinally*/];
                                        case 10: return [2 /*return*/];
                                    }
                                });
                            }); }, function () { return _this.status === statuses_ts_1.Active; })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.update({ status: statuses_ts_1.Stopped })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.kodmq.adapter.deleteWorker(this)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop jobs processing
     */
    Worker.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.update({ status: statuses_ts_1.Stopping })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Wait for stopped status
     */
    Worker.prototype.waitForStatus = function (status, timeout) {
        if (timeout === void 0) { timeout = 50; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.status !== status)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeout); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update worker data and save it to the adapter
     *
     * @param attributes
     */
    Worker.prototype.update = function (attributes) {
        if (attributes === void 0) { attributes = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Object.assign(this, attributes);
                        return [4 /*yield*/, this.kodmq.adapter.saveWorker(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // TODO: Refactor and move it somewhere else
    /**
     * Retry job if applicable
     *
     * @param job
     */
    Worker.prototype.retry = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var runAt, _a, retryDelay, retryType, retryDelayIndex, retryDelayValue;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (job.failedAttempts > (this.kodmq.config.maxRetries || 0))
                            return [2 /*return*/];
                        runAt = Date.now();
                        _a = this.kodmq.config, retryDelay = _a.retryDelay, retryType = _a.retryType;
                        if (typeof retryDelay === "number") {
                            if (retryType === "exponential") {
                                runAt += retryDelay * Math.pow(2, job.failedAttempts - 1);
                            }
                            else {
                                runAt += retryDelay;
                            }
                        }
                        else if (Array.isArray(retryDelay)) {
                            retryDelayIndex = job.failedAttempts - 1;
                            retryDelayValue = retryDelay[Math.min(retryDelayIndex, retryDelay.length - 1)];
                            runAt += retryDelayValue;
                        }
                        else if (typeof retryDelay === "function") {
                            runAt += retryDelay(job);
                        }
                        else {
                            throw new errors_ts_1.KodMQError("Invalid retryDelay: ".concat(retryDelay));
                        }
                        return [4 /*yield*/, this.kodmq.adapter.pushJob(job, new Date(runAt))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create worker instance
     */
    Worker.create = function (kodmq) {
        return __awaiter(this, void 0, void 0, function () {
            var id, worker;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, kodmq.adapter.getNextWorkerId()];
                    case 1:
                        id = _a.sent();
                        worker = new Worker(id, kodmq);
                        return [4 /*yield*/, kodmq.adapter.saveWorker(worker)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, worker];
                }
            });
        });
    };
    return Worker;
}());
exports.default = Worker;
