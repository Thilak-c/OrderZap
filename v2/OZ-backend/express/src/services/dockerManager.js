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
exports.restartConvex = restartConvex;
exports.getContainerStatus = getContainerStatus;
exports.waitForHealthy = waitForHealthy;
var child_process_1 = require("child_process");
var util_1 = require("util");
var path_1 = require("path");
/**
 * dockerManager.ts — Docker Container Lifecycle Manager
 * ──────────────────────────────────────────────────────
 * Manages Convex Docker containers programmatically.
 * Used by the health monitor to auto-restart containers
 * when they become unhealthy.
 */
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var PROJECT_ROOT = path_1.default.resolve(__dirname || process.cwd(), "../../");
/**
 * Restart the Convex backend and dashboard containers.
 * Uses --force-recreate to ensure a clean start.
 */
function restartConvex() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stdout, stderr, err_1, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("🐳 Restarting Convex containers...");
                    return [4 /*yield*/, execAsync("docker compose up -d --force-recreate backend dashboard", {
                            cwd: PROJECT_ROOT,
                            timeout: 60000, // 60s timeout
                        })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, stderr = _a.stderr;
                    if (stderr && !stderr.includes("Started") && !stderr.includes("Created") && !stderr.includes("Running")) {
                        // docker compose often writes progress to stderr — only warn on real errors
                        console.warn("🐳 Docker stderr:", stderr.trim());
                    }
                    console.log("🐳 Docker compose output:", stdout.trim());
                    return [2 /*return*/, { success: true, message: "Containers restarted" }];
                case 2:
                    err_1 = _b.sent();
                    message = err_1 instanceof Error ? err_1.message : String(err_1);
                    console.error("❌ Failed to restart Convex containers:", message);
                    return [2 /*return*/, { success: false, message: message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the status of all Docker Compose containers.
 */
function getContainerStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, lines, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execAsync('docker compose ps --format "{{.Name}}|{{.State}}|{{.Status}}"', {
                            cwd: PROJECT_ROOT,
                            timeout: 10000,
                        })];
                case 1:
                    stdout = (_b.sent()).stdout;
                    lines = stdout.trim().split("\n").filter(Boolean);
                    return [2 /*return*/, lines.map(function (line) {
                            var _a = line.split("|"), name = _a[0], state = _a[1], status = _a[2];
                            var health = (status === null || status === void 0 ? void 0 : status.includes("(healthy)"))
                                ? "healthy"
                                : (status === null || status === void 0 ? void 0 : status.includes("(unhealthy)"))
                                    ? "unhealthy"
                                    : (status === null || status === void 0 ? void 0 : status.includes("(health: starting)"))
                                        ? "starting"
                                        : undefined;
                            return { name: name, state: state, status: status, health: health };
                        })];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Wait for the Convex backend to become healthy.
 * Polls the /version endpoint with a timeout.
 */
function waitForHealthy() {
    return __awaiter(this, arguments, void 0, function (maxWaitMs, intervalMs) {
        var start, convexUrl, response, _a;
        if (maxWaitMs === void 0) { maxWaitMs = 30000; }
        if (intervalMs === void 0) { intervalMs = 2000; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    start = Date.now();
                    convexUrl = process.env.CONVEX_URL || "http://127.0.0.1:3210";
                    _b.label = 1;
                case 1:
                    if (!(Date.now() - start < maxWaitMs)) return [3 /*break*/, 7];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(convexUrl, "/version"), {
                            signal: AbortSignal.timeout(2000),
                        })];
                case 3:
                    response = _b.sent();
                    if (response.ok) {
                        console.log("✅ Convex backend is healthy again");
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, intervalMs); })];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 1];
                case 7:
                    console.error("❌ Convex backend did not become healthy within timeout");
                    return [2 /*return*/, false];
            }
        });
    });
}
