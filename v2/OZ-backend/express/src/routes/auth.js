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
var express_1 = require("express");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var database_1 = require("../config/database");
var convexClient_1 = require("../services/convexClient");
var responseUtils_1 = require("../utils/responseUtils");
var auth_1 = require("../middleware/auth");
var router = (0, express_1.Router)();
var JWT_SECRET = process.env.JWT_SECRET || 'orderzap_secret_2024_secure_v2';
/**
 * POST /api/auth/register
 * ───────────────────────
 * Registers a new restaurant and its owner.
 */
router.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, _a, short_id, name_1, email, password, phone, _b, logo, _c, status_1, _d, active, existingRestaurant, existingStaff, hashedPassword, now, restResult, restaurant, staffResult, owner, syncErr_1, token, err_1, message;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, (0, database_1.getClient)()];
            case 1:
                client = _e.sent();
                _e.label = 2;
            case 2:
                _e.trys.push([2, 19, 21, 22]);
                _a = req.body, short_id = _a.short_id, name_1 = _a.name, email = _a.email, password = _a.password, phone = _a.phone, _b = _a.logo, logo = _b === void 0 ? '' : _b, _c = _a.status, status_1 = _c === void 0 ? 'trial' : _c, _d = _a.active, active = _d === void 0 ? true : _d;
                if (!short_id || !name_1 || !email || !password) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'short_id, name, email, and password are required')];
                }
                // 1. Transaction Start
                return [4 /*yield*/, client.query('BEGIN')];
            case 3:
                // 1. Transaction Start
                _e.sent();
                return [4 /*yield*/, client.query('SELECT id FROM restaurants WHERE short_id = $1', [short_id])];
            case 4:
                existingRestaurant = _e.sent();
                if (!(existingRestaurant.rows.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 5:
                _e.sent();
                return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, "Restaurant with short_id \"".concat(short_id, "\" already exists"))];
            case 6: return [4 /*yield*/, client.query('SELECT id FROM staff WHERE email = $1', [email])];
            case 7:
                existingStaff = _e.sent();
                if (!(existingStaff.rows.length > 0)) return [3 /*break*/, 9];
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 8:
                _e.sent();
                return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, "Email \"".concat(email, "\" is already registered"))];
            case 9: return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
            case 10:
                hashedPassword = _e.sent();
                now = Date.now();
                return [4 /*yield*/, client.query("INSERT INTO restaurants (short_id, name, email, phone, logo, status, active, created_at) \n       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [short_id, name_1, email, phone, logo, status_1, active, now])];
            case 11:
                restResult = _e.sent();
                restaurant = restResult.rows[0];
                return [4 /*yield*/, client.query("INSERT INTO staff (restaurant_id, name, role, email, password, active, joining_date) \n       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [restaurant.id, 'Owner', 'owner', email, hashedPassword, true, now])];
            case 12:
                staffResult = _e.sent();
                owner = staffResult.rows[0];
                // 6. Transaction Commit
                return [4 /*yield*/, client.query('COMMIT')];
            case 13:
                // 6. Transaction Commit
                _e.sent();
                _e.label = 14;
            case 14:
                _e.trys.push([14, 17, , 18]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:upsertRestaurantMirror', {
                        pgId: restaurant.id,
                        shortId: restaurant.short_id,
                        name: restaurant.name,
                        active: restaurant.active
                    })];
            case 15:
                _e.sent();
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:upsertStaffMirror', {
                        pgId: owner.id,
                        restaurantId: restaurant.short_id,
                        name: owner.name,
                        role: owner.role,
                        isActive: owner.active
                    })];
            case 16:
                _e.sent();
                return [3 /*break*/, 18];
            case 17:
                syncErr_1 = _e.sent();
                console.warn('⚠️ Register Convex Sync Warning:', syncErr_1);
                return [3 /*break*/, 18];
            case 18:
                token = jsonwebtoken_1.default.sign({ id: owner.id, restaurantId: restaurant.short_id, role: owner.role }, JWT_SECRET, { expiresIn: '7d' });
                (0, responseUtils_1.sendSuccess)(res, {
                    token: token,
                    restaurant: {
                        short_id: restaurant.short_id,
                        name: restaurant.name,
                        logo: restaurant.logo
                    }
                }, 201);
                return [3 /*break*/, 22];
            case 19:
                err_1 = _e.sent();
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 20:
                _e.sent();
                message = err_1 instanceof Error ? err_1.message : String(err_1);
                console.error('Registration Error:', message);
                (0, responseUtils_1.sendError)(res, 500, "Registration failed: ".concat(message));
                return [3 /*break*/, 22];
            case 21:
                client.release();
                return [7 /*endfinally*/];
            case 22: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/login
 * ────────────────────
 * Authenticates a restaurant staff member.
 */
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, staffRows, staff, isValid, restRows, restaurant, token, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'Email and password are required')];
                }
                return [4 /*yield*/, (0, database_1.query)('SELECT * FROM staff WHERE email = $1 AND active = true', [email])];
            case 1:
                staffRows = _b.sent();
                if (staffRows.length === 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 401, 'Invalid email or password')];
                }
                staff = staffRows[0];
                return [4 /*yield*/, bcryptjs_1.default.compare(password, staff.password || '')];
            case 2:
                isValid = _b.sent();
                if (!isValid) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 401, 'Invalid email or password')];
                }
                return [4 /*yield*/, (0, database_1.query)('SELECT short_id, name, logo FROM restaurants WHERE id = $1', [staff.restaurant_id])];
            case 3:
                restRows = _b.sent();
                if (restRows.length === 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Associated restaurant not found')];
                }
                restaurant = restRows[0];
                token = jsonwebtoken_1.default.sign({ id: staff.id, restaurantId: restaurant.short_id, role: staff.role }, JWT_SECRET, { expiresIn: '7d' });
                (0, responseUtils_1.sendSuccess)(res, {
                    token: token,
                    restaurant: {
                        short_id: restaurant.short_id,
                        name: restaurant.name,
                        logo: restaurant.logo
                    },
                    staff: {
                        id: staff.id,
                        name: staff.name,
                        role: staff.role
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _b.sent();
                console.error('Login Error:', err_2);
                (0, responseUtils_1.sendError)(res, 500, 'Authentication failed');
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/auth/me
 * ────────────────
 * Returns the current staff member's profile and restaurant data.
 */
router.get('/me', auth_1.authenticateRestaurant, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, restaurantId, staffRows, staff, restRows, restaurant, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.user, id = _a.id, restaurantId = _a.restaurantId;
                return [4 /*yield*/, (0, database_1.query)('SELECT id, name, role, email, phone FROM staff WHERE id = $1', [id])];
            case 1:
                staffRows = _b.sent();
                if (staffRows.length === 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Staff profile not found')];
                }
                staff = staffRows[0];
                return [4 /*yield*/, (0, database_1.query)('SELECT short_id, name, logo FROM restaurants WHERE short_id = $1', [restaurantId])];
            case 2:
                restRows = _b.sent();
                if (restRows.length === 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Restaurant data not found')];
                }
                restaurant = restRows[0];
                (0, responseUtils_1.sendSuccess)(res, {
                    staff: staff,
                    restaurant: restaurant
                });
                return [3 /*break*/, 4];
            case 3:
                err_3 = _b.sent();
                console.error('AuthMe Error:', err_3);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to fetch session profile');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
