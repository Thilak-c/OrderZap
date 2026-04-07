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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.convexMonitor = void 0;
var events_1 = require("events");
var convexClient_js_1 = require("./convexClient.js");
var dockerManager_js_1 = require("./dockerManager.js");
var ConvexMonitor = /** @class */ (function (_super) {
    __extends(ConvexMonitor, _super);
    function ConvexMonitor() {
        var _this = _super.call(this) || this;
        _this.intervalId = null;
        _this.failureCount = 0;
        _this._status = "unknown";
        _this.isRecovering = false;
        _this.checkIntervalMs = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || "10000", 10);
        _this.maxFailures = parseInt(process.env.HEALTH_CHECK_MAX_FAILURES || "3", 10);
        return _this;
    }
    Object.defineProperty(ConvexMonitor.prototype, "status", {
        /** Current status of the Convex backend */
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    /** Start the health check loop */
    ConvexMonitor.prototype.start = function () {
        var _this = this;
        if (this.intervalId) {
            console.warn("⚠️  ConvexMonitor already running");
            return;
        }
        console.log("\uD83D\uDD0D Convex health monitor started (interval: ".concat(this.checkIntervalMs, "ms, max failures: ").concat(this.maxFailures, ")"));
        // Run first check immediately
        this.runCheck();
        // Then schedule periodic checks
        this.intervalId = setInterval(function () { return _this.runCheck(); }, this.checkIntervalMs);
    };
    /** Stop the health check loop */
    ConvexMonitor.prototype.stop = function () {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("🔍 Convex health monitor stopped");
        }
    };
    /** Run a single health check */
    ConvexMonitor.prototype.runCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var healthy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Skip check if we're already in recovery mode
                        if (this.isRecovering)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, convexClient_js_1.isConvexHealthy)()];
                    case 1:
                        healthy = _a.sent();
                        if (healthy) {
                            // Reset failure count on success
                            if (this.failureCount > 0 || this._status !== "healthy") {
                                console.log("✅ Convex backend is healthy");
                            }
                            this.failureCount = 0;
                            this._status = "healthy";
                            this.emit("convex:healthy");
                            return [2 /*return*/];
                        }
                        // Health check failed
                        this.failureCount++;
                        this._status = "unhealthy";
                        console.warn("\u26A0\uFE0F  Convex health check failed (".concat(this.failureCount, "/").concat(this.maxFailures, ")"));
                        this.emit("convex:unhealthy", { failureCount: this.failureCount });
                        if (!(this.failureCount >= this.maxFailures)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.triggerRecovery()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Attempt to recover by restarting the Convex container */
    ConvexMonitor.prototype.triggerRecovery = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, recovered, err_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isRecovering = true;
                        this._status = "recovering";
                        console.log("🔄 Triggering Convex auto-recovery...");
                        this.emit("convex:recovering");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, dockerManager_js_1.restartConvex)()];
                    case 2:
                        result = _a.sent();
                        if (!result.success) {
                            throw new Error(result.message);
                        }
                        return [4 /*yield*/, (0, dockerManager_js_1.waitForHealthy)(60000, 3000)];
                    case 3:
                        recovered = _a.sent();
                        if (recovered) {
                            this.failureCount = 0;
                            this._status = "healthy";
                            console.log("🎉 Convex auto-recovery successful!");
                            this.emit("convex:recovered");
                        }
                        else {
                            this._status = "unhealthy";
                            console.error("❌ Convex auto-recovery failed — container did not become healthy");
                            this.emit("convex:fatal", { message: "Recovery timeout" });
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        this._status = "unhealthy";
                        message = err_1 instanceof Error ? err_1.message : String(err_1);
                        console.error("❌ Convex auto-recovery error:", message);
                        this.emit("convex:fatal", { message: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.isRecovering = false;
                        // Reset failure count so the monitor starts fresh
                        this.failureCount = 0;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ConvexMonitor;
}(events_1.EventEmitter));
// Singleton instance
exports.convexMonitor = new ConvexMonitor();
