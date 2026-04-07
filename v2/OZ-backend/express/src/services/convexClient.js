"use strict";
/**
 * convexClient.ts — Convex HTTP API Client
 * ─────────────────────────────────────────
 * Communicates with the self-hosted Convex backend via its HTTP API.
 * Used by Express routes to read from Convex (real-time mirror) and
 * trigger actions/mutations.
 *
 * If Convex is unreachable, methods return null so the caller can
 * fall back to PostgreSQL.
 */
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
exports.queryConvex = queryConvex;
exports.mutationConvex = mutationConvex;
exports.actionConvex = actionConvex;
exports.isConvexHealthy = isConvexHealthy;
var CONVEX_URL = process.env.CONVEX_URL || "http://127.0.0.1:3210";
var CONVEX_ADMIN_KEY = process.env.CONVEX_ADMIN_KEY || "";
/**
 * Sanitizes arguments for Convex HTTP API.
 * Converts 'null' values to 'undefined' since Convex v.optional(...)
 * doesn't accept null.
 */
function sanitizeArgs(args) {
    var sanitized = {};
    for (var _i = 0, _a = Object.entries(args); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value === null) {
            sanitized[key] = undefined;
        }
        else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            sanitized[key] = sanitizeArgs(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
/**
 * Call a Convex query function via HTTP.
 * Returns null if Convex is unreachable.
 */
function queryConvex(functionPath_1) {
    return __awaiter(this, arguments, void 0, function (functionPath, args) {
        var url, response, data, err_1, message;
        var _a;
        if (args === void 0) { args = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    url = "".concat(CONVEX_URL, "/api/query");
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Convex ".concat(CONVEX_ADMIN_KEY),
                            },
                            body: JSON.stringify({
                                path: functionPath,
                                args: sanitizeArgs(args),
                                format: "json",
                            }),
                            signal: AbortSignal.timeout(5000),
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        console.warn("\u26A0\uFE0F  Convex query ".concat(functionPath, " returned ").concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = (_b.sent());
                    if (data.status === "error") {
                        console.warn("\u26A0\uFE0F  Convex query error: ".concat(data.errorMessage));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, (_a = data.value) !== null && _a !== void 0 ? _a : null];
                case 3:
                    err_1 = _b.sent();
                    message = err_1 instanceof Error ? err_1.message : String(err_1);
                    console.warn("\u26A0\uFE0F  Convex unreachable (query ".concat(functionPath, "): ").concat(message));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Call a Convex mutation function via HTTP.
 * Returns null if Convex is unreachable.
 */
function mutationConvex(functionPath_1) {
    return __awaiter(this, arguments, void 0, function (functionPath, args) {
        var sanitized, url, response, data, err_2, message;
        var _a;
        if (args === void 0) { args = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sanitized = sanitizeArgs(args);
                    console.log("[CONVEX] Calling mutation: ".concat(functionPath), JSON.stringify(sanitized, null, 2));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    url = "".concat(CONVEX_URL, "/api/mutation");
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Convex ".concat(CONVEX_ADMIN_KEY),
                            },
                            body: JSON.stringify({
                                path: functionPath,
                                args: sanitized,
                                format: "json",
                            }),
                            signal: AbortSignal.timeout(5000),
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        console.warn("\u26A0\uFE0F  Convex mutation ".concat(functionPath, " returned ").concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = (_b.sent());
                    if (data.status === "error") {
                        console.warn("\u26A0\uFE0F  Convex mutation error: ".concat(data.errorMessage));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, (_a = data.value) !== null && _a !== void 0 ? _a : null];
                case 4:
                    err_2 = _b.sent();
                    message = err_2 instanceof Error ? err_2.message : String(err_2);
                    console.warn("\u26A0\uFE0F  Convex unreachable (mutation ".concat(functionPath, "): ").concat(message));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Call a Convex action function via HTTP.
 * Returns null if Convex is unreachable.
 */
function actionConvex(functionPath_1) {
    return __awaiter(this, arguments, void 0, function (functionPath, args) {
        var url, response, data, err_3, message;
        var _a;
        if (args === void 0) { args = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    url = "".concat(CONVEX_URL, "/api/action");
                    return [4 /*yield*/, fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: "Convex ".concat(CONVEX_ADMIN_KEY),
                            },
                            body: JSON.stringify({
                                path: functionPath,
                                args: sanitizeArgs(args),
                                format: "json",
                            }),
                            signal: AbortSignal.timeout(10000), // Actions may take longer
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        console.warn("\u26A0\uFE0F  Convex action ".concat(functionPath, " returned ").concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = (_b.sent());
                    if (data.status === "error") {
                        console.warn("\u26A0\uFE0F  Convex action error: ".concat(data.errorMessage));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, (_a = data.value) !== null && _a !== void 0 ? _a : null];
                case 3:
                    err_3 = _b.sent();
                    message = err_3 instanceof Error ? err_3.message : String(err_3);
                    console.warn("\u26A0\uFE0F  Convex unreachable (action ".concat(functionPath, "): ").concat(message));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if Convex is reachable by hitting /version.
 */
function isConvexHealthy() {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("".concat(CONVEX_URL, "/version"), {
                            signal: AbortSignal.timeout(3000),
                        })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, response.ok];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
