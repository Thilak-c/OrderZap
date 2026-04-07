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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var database_1 = require("../../config/database");
var convexClient_1 = require("../../services/convexClient");
var responseUtils_1 = require("../../utils/responseUtils");
var router = (0, express_1.Router)({ mergeParams: true });
// Helper to sync shortcode to Convex
var syncShortcode = function (shortcode) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:upsertShortcodeMirror', {
                        pgId: shortcode.id,
                        restaurantId: shortcode.restaurant_id,
                        code: shortcode.code,
                        type: shortcode.type,
                        referenceId: shortcode.reference_id,
                        isActive: shortcode.is_active
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.warn('⚠️  Convex Sync Warning (Shortcode):', err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// GET /api/:restaurantId/menu/shortcodes
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, page, limit, offset, restaurantId, type, conditions, params, where, countResult, total, rows, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = (0, responseUtils_1.parsePagination)(req.query), page = _a.page, limit = _a.limit, offset = _a.offset;
                restaurantId = req.params.restaurantId;
                type = req.query.type;
                conditions = ['restaurant_id = $1'];
                params = [restaurantId];
                if (type) {
                    params.push(type);
                    conditions.push("type = $".concat(params.length));
                }
                where = 'WHERE ' + conditions.join(' AND ');
                return [4 /*yield*/, (0, database_1.query)("SELECT COUNT(*) as count FROM shortcodes ".concat(where), params)];
            case 1:
                countResult = _b.sent();
                total = parseInt(countResult[0].count);
                return [4 /*yield*/, (0, database_1.query)("SELECT * FROM shortcodes ".concat(where, " ORDER BY code ASC LIMIT $").concat(params.length + 1, " OFFSET $").concat(params.length + 2), __spreadArray(__spreadArray([], params, true), [limit, offset], false))];
            case 2:
                rows = _b.sent();
                (0, responseUtils_1.sendPaginated)(res, rows, (0, responseUtils_1.buildPaginationMeta)(total, page, limit));
                return [3 /*break*/, 4];
            case 3:
                err_2 = _b.sent();
                console.error('GET shortcodes error:', err_2);
                (0, responseUtils_1.sendError)(res, 500, "Failed to fetch shortcodes: ".concat(err_2.message));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/:restaurantId/menu/shortcodes/:id
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, rows, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                restaurantId = req.params.restaurantId;
                return [4 /*yield*/, (0, database_1.query)('SELECT * FROM shortcodes WHERE id = $1 AND restaurant_id = $2', [req.params.id, restaurantId])];
            case 1:
                rows = _a.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Shortcode not found')];
                (0, responseUtils_1.sendSuccess)(res, rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error('GET shortcode/:id error:', err_3);
                (0, responseUtils_1.sendError)(res, 500, "Failed to fetch shortcode: ".concat(err_3.message));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/:restaurantId/menu/shortcodes
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, _a, code, type, reference_id, _b, is_active, existing, rows, shortcode, err_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                restaurantId = req.params.restaurantId;
                _a = req.body, code = _a.code, type = _a.type, reference_id = _a.reference_id, _b = _a.is_active, is_active = _b === void 0 ? true : _b;
                if (!code || !type || !reference_id) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'code, type, and reference_id are required')];
                }
                if (!['table', 'zone', 'item'].includes(type)) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'type must be one of: table, zone, item')];
                }
                return [4 /*yield*/, (0, database_1.query)('SELECT id FROM shortcodes WHERE restaurant_id = $1 AND code = $2', [restaurantId, code])];
            case 1:
                existing = _c.sent();
                if (existing.length > 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'Shortcode already exists for this restaurant')];
                }
                return [4 /*yield*/, (0, database_1.query)("INSERT INTO shortcodes (restaurant_id, code, type, reference_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *", [restaurantId, code, type, reference_id, is_active])];
            case 2:
                rows = _c.sent();
                shortcode = rows[0];
                return [4 /*yield*/, syncShortcode(shortcode)];
            case 3:
                _c.sent();
                (0, responseUtils_1.sendSuccess)(res, shortcode, 201);
                return [3 /*break*/, 5];
            case 4:
                err_4 = _c.sent();
                console.error('POST shortcode error:', err_4);
                (0, responseUtils_1.sendError)(res, 500, "Failed to create shortcode: ".concat(err_4.message));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// PUT /api/:restaurantId/menu/shortcodes/:id
router.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, _a, code, is_active, reference_id, updates, params, rows, shortcode, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                restaurantId = req.params.restaurantId;
                _a = req.body, code = _a.code, is_active = _a.is_active, reference_id = _a.reference_id;
                updates = [];
                params = [];
                if (code !== undefined) {
                    params.push(code);
                    updates.push("code = $".concat(params.length));
                }
                if (is_active !== undefined) {
                    params.push(is_active);
                    updates.push("is_active = $".concat(params.length));
                }
                if (reference_id !== undefined) {
                    params.push(reference_id);
                    updates.push("reference_id = $".concat(params.length));
                }
                if (updates.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'No fields to update')];
                params.push(req.params.id);
                params.push(restaurantId);
                return [4 /*yield*/, (0, database_1.query)("UPDATE shortcodes SET ".concat(updates.join(', '), " WHERE id = $").concat(params.length - 1, " AND restaurant_id = $").concat(params.length, " RETURNING *"), params)];
            case 1:
                rows = _b.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Shortcode not found')];
                shortcode = rows[0];
                return [4 /*yield*/, syncShortcode(shortcode)];
            case 2:
                _b.sent();
                (0, responseUtils_1.sendSuccess)(res, shortcode);
                return [3 /*break*/, 4];
            case 3:
                err_5 = _b.sent();
                console.error('PUT shortcode/:id error:', err_5);
                (0, responseUtils_1.sendError)(res, 500, "Failed to update shortcode: ".concat(err_5.message));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/:restaurantId/menu/shortcodes/:id
router.delete('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, rows, syncErr_1, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                restaurantId = req.params.restaurantId;
                return [4 /*yield*/, (0, database_1.query)('DELETE FROM shortcodes WHERE id = $1 AND restaurant_id = $2 RETURNING *', [req.params.id, restaurantId])];
            case 1:
                rows = _a.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Shortcode not found')];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:deleteMirrorRecord', { table: 'shortcodes', pgId: req.params.id })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                syncErr_1 = _a.sent();
                console.warn('⚠️  Convex Sync Warning (Shortcode Delete):', syncErr_1);
                return [3 /*break*/, 5];
            case 5:
                (0, responseUtils_1.sendSuccess)(res, { deleted: true, id: req.params.id });
                return [3 /*break*/, 7];
            case 6:
                err_6 = _a.sent();
                console.error('DELETE shortcode/:id error:', err_6);
                (0, responseUtils_1.sendError)(res, 500, "Failed to delete shortcode: ".concat(err_6.message));
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
