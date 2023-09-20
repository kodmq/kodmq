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
var RedisAdapter_ts_1 = require("../src/adapters/RedisAdapter.ts");
var KodMQ_ts_1 = require("../src/KodMQ.ts");
var statuses_ts_1 = require("../src/statuses.ts");
var handlers_ts_1 = require("./handlers.ts");
describe("KodMQ", function () {
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var adapter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adapter = new RedisAdapter_ts_1.default();
                    return [4 /*yield*/, adapter.clearAll()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, adapter.closeConnection()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not allow to create instance with wrong adapter", function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(function () { return new KodMQ_ts_1.default({ adapter: "hello", handlers: handlers_ts_1.handlers }); }).toThrow("KodMQ requires adapter to be an instance of Adapter");
    });
    it("does not allow to start worker without handlers", function () {
        var kodmq = new KodMQ_ts_1.default();
        expect(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, kodmq.start()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); }).rejects.toThrow("KodMQ requires at least one handler to start");
    });
    it("does not allow to start worker twice", function () { return __awaiter(void 0, void 0, void 0, function () {
        var kodmq;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    kodmq = new KodMQ_ts_1.default({ handlers: handlers_ts_1.handlers });
                    setTimeout(function () { return kodmq.start(); }, 1);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 1:
                    _a.sent();
                    expect(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, kodmq.start()];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }).rejects.toThrow("KodMQ is already started");
                    return [4 /*yield*/, kodmq.stop()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("creates instance with config", function () { return __awaiter(void 0, void 0, void 0, function () {
        var kodmq;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    kodmq = new KodMQ_ts_1.default({
                        adapter: new RedisAdapter_ts_1.default(),
                        handlers: handlers_ts_1.handlers,
                    });
                    expect(kodmq).toBeInstanceOf(KodMQ_ts_1.default);
                    expect(kodmq.adapter).toBeInstanceOf(RedisAdapter_ts_1.default);
                    expect(kodmq.handlers).toEqual(handlers_ts_1.handlers);
                    return [4 /*yield*/, kodmq.stop()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds jobs to adapter", function () { return __awaiter(void 0, void 0, void 0, function () {
        var kodmq, job1, job2, job3, scheduleIn, scheduledJob1, pendingJobs, scheduledJobs, _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    kodmq = new KodMQ_ts_1.default({ handlers: handlers_ts_1.handlers });
                    return [4 /*yield*/, kodmq.perform("welcomeMessage", "John")];
                case 1:
                    job1 = _h.sent();
                    return [4 /*yield*/, kodmq.perform("happyBirthdayMessage", { name: "John", age: 18 })];
                case 2:
                    job2 = _h.sent();
                    return [4 /*yield*/, kodmq.perform("promotionMessage", true)
                        // Schedule a job
                    ];
                case 3:
                    job3 = _h.sent();
                    scheduleIn = 250;
                    return [4 /*yield*/, kodmq.schedule(new Date(Date.now() + scheduleIn), "promotionMessage", false)
                        // Get all jobs from adapter
                    ];
                case 4:
                    scheduledJob1 = _h.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Pending })];
                case 5:
                    pendingJobs = _h.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Scheduled })
                        // Make sure all pending jobs in the queue
                    ];
                case 6:
                    scheduledJobs = _h.sent();
                    // Make sure all pending jobs in the queue
                    expect(pendingJobs.length).toBe(3);
                    expect(pendingJobs[0].name).toBe(job1.name);
                    expect(pendingJobs[0].data).toEqual(job1.data);
                    expect(pendingJobs[1].name).toBe(job2.name);
                    expect(pendingJobs[1].data).toEqual(job2.data);
                    expect(pendingJobs[2].name).toBe(job3.name);
                    expect(pendingJobs[2].data).toEqual(job3.data);
                    // Make sure all scheduled jobs in the queue
                    expect(scheduledJobs.length).toBe(1);
                    expect(scheduledJobs[0].name).toBe(scheduledJob1.name);
                    expect(scheduledJobs[0].data).toEqual(scheduledJob1.data);
                    // Make sure all jobs pops in the right order
                    _a = expect;
                    return [4 /*yield*/, kodmq.adapter.popJob()];
                case 7:
                    // Make sure all jobs pops in the right order
                    _a.apply(void 0, [_h.sent()]).toEqual(job1);
                    _b = expect;
                    return [4 /*yield*/, kodmq.adapter.popJob()];
                case 8:
                    _b.apply(void 0, [_h.sent()]).toEqual(job2);
                    _c = expect;
                    return [4 /*yield*/, kodmq.adapter.popJob()];
                case 9:
                    _c.apply(void 0, [_h.sent()]).toEqual(job3);
                    _d = expect;
                    return [4 /*yield*/, kodmq.adapter.popJob()];
                case 10:
                    _d.apply(void 0, [_h.sent()]).toBeNull();
                    // Make sure scheduled job pops when time comes
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, scheduleIn + 10); })];
                case 11:
                    // Make sure scheduled job pops when time comes
                    _h.sent();
                    _e = expect;
                    return [4 /*yield*/, kodmq.adapter.popJob()];
                case 12:
                    _e.apply(void 0, [_h.sent()]).toEqual(scheduledJob1);
                    // Make sure there is no more jobs
                    _f = expect;
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Pending })];
                case 13:
                    // Make sure there is no more jobs
                    _f.apply(void 0, [_h.sent()]).toEqual([]);
                    _g = expect;
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Scheduled })];
                case 14:
                    _g.apply(void 0, [_h.sent()]).toEqual([]);
                    return [4 /*yield*/, kodmq.stop()];
                case 15:
                    _h.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("runs jobs", function () { return __awaiter(void 0, void 0, void 0, function () {
        var welcomeMessage, happyBirthdayMessage, promotionMessage, kodmq, job1, job2, job3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    welcomeMessage = jest.fn(function (_) { });
                    happyBirthdayMessage = jest.fn(function (_) { });
                    promotionMessage = jest.fn(function (_) { });
                    kodmq = new KodMQ_ts_1.default({
                        handlers: {
                            welcomeMessage: welcomeMessage,
                            happyBirthdayMessage: happyBirthdayMessage,
                            promotionMessage: promotionMessage,
                        },
                    });
                    return [4 /*yield*/, kodmq.perform("welcomeMessage", "John")];
                case 1:
                    job1 = _a.sent();
                    return [4 /*yield*/, kodmq.perform("happyBirthdayMessage", { name: "John", age: 18 })];
                case 2:
                    job2 = _a.sent();
                    return [4 /*yield*/, kodmq.perform("promotionMessage", true)];
                case 3:
                    job3 = _a.sent();
                    expect(welcomeMessage).not.toHaveBeenCalled();
                    expect(happyBirthdayMessage).not.toHaveBeenCalled();
                    expect(promotionMessage).not.toHaveBeenCalled();
                    return [4 /*yield*/, Promise.race([
                            kodmq.start(),
                            kodmq.waitUntilAllJobsCompleted(),
                        ])
                            .then(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, kodmq.stop()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                case 4:
                    _a.sent();
                    expect(welcomeMessage).toHaveBeenCalledTimes(1);
                    expect(welcomeMessage.mock.calls[0][0]).toEqual(job1.data);
                    expect(happyBirthdayMessage).toHaveBeenCalledTimes(1);
                    expect(happyBirthdayMessage.mock.calls[0][0]).toEqual(job2.data);
                    expect(promotionMessage).toHaveBeenCalledTimes(1);
                    expect(promotionMessage.mock.calls[0][0]).toEqual(job3.data);
                    return [2 /*return*/];
            }
        });
    }); });
    it("gets information about workers", function () { return __awaiter(void 0, void 0, void 0, function () {
        var kodmq, workers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    kodmq = new KodMQ_ts_1.default({ handlers: handlers_ts_1.handlers });
                    return [4 /*yield*/, kodmq.getWorkers()];
                case 1:
                    workers = _a.sent();
                    expect(workers.length).toBe(0);
                    setTimeout(function () { return kodmq.start(); }, 1);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, kodmq.getWorkers()];
                case 3:
                    workers = _a.sent();
                    expect(workers.length).toBe(1);
                    expect(workers[0].id).toBe(1);
                    expect(workers[0].startedAt).toBeInstanceOf(Date);
                    return [4 /*yield*/, kodmq.stop()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("gracefully stops workers", function () { return __awaiter(void 0, void 0, void 0, function () {
        var kodmq, job, pendingJobs, completedJobs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    kodmq = new KodMQ_ts_1.default({ handlers: handlers_ts_1.handlers });
                    return [4 /*yield*/, kodmq.perform("longRunningJob")];
                case 1:
                    job = _a.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Pending })];
                case 2:
                    pendingJobs = _a.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Completed })];
                case 3:
                    completedJobs = _a.sent();
                    expect(pendingJobs.length).toBe(1);
                    expect(pendingJobs[0].id).toBe(job.id);
                    expect(completedJobs.length).toBe(0);
                    // Start workers, wait them to start and stop them before job is completed
                    setTimeout(function () { return kodmq.start(); }, 1);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, kodmq.stop()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })
                        // Make sure job is completed due to graceful stop
                    ];
                case 6:
                    _a.sent();
                    // Make sure job is completed due to graceful stop
                    return [4 /*yield*/, kodmq.adapter.openConnection()];
                case 7:
                    // Make sure job is completed due to graceful stop
                    _a.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Pending })];
                case 8:
                    pendingJobs = _a.sent();
                    return [4 /*yield*/, kodmq.getJobs({ status: statuses_ts_1.Completed })];
                case 9:
                    completedJobs = _a.sent();
                    return [4 /*yield*/, kodmq.adapter.closeConnection()];
                case 10:
                    _a.sent();
                    expect(pendingJobs.length).toBe(0);
                    expect(completedJobs.length).toBe(1);
                    expect(completedJobs[0].id).toBe(job.id);
                    return [2 /*return*/];
            }
        });
    }); });
});
