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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
// Helper to sync menu item to Convex
var syncMenuItem = function (item) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:upsertItemMirror', {
                        pgId: item.id,
                        restaurantId: item.restaurant_id || '',
                        categoryId: item.category_id || '',
                        name: item.name,
                        price: Number(item.price),
                        description: item.description,
                        isAvailable: (_b = (_a = item.is_available) !== null && _a !== void 0 ? _a : item.available) !== null && _b !== void 0 ? _b : true,
                        isHidden: (_c = item.is_hidden) !== null && _c !== void 0 ? _c : false,
                        shortcode: item.shortcode
                    })];
            case 1:
                _d.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _d.sent();
                console.warn('⚠️  Convex Sync Warning (MenuItem):', err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// GET /api/:restaurantId/menu/items
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, page, limit, offset, restaurantId, _b, category_id, is_available, is_hidden, conditions, params, where, countResult, total, rows, err_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = (0, responseUtils_1.parsePagination)(req.query), page = _a.page, limit = _a.limit, offset = _a.offset;
                restaurantId = req.params.restaurantId;
                _b = req.query, category_id = _b.category_id, is_available = _b.is_available, is_hidden = _b.is_hidden;
                conditions = ['restaurant_id = $1'];
                params = [restaurantId];
                if (category_id) {
                    params.push(category_id);
                    conditions.push("category_id = $".concat(params.length));
                }
                if (is_available !== undefined) {
                    params.push(is_available === 'true');
                    conditions.push("is_available = $".concat(params.length));
                }
                if (is_hidden !== undefined) {
                    params.push(is_hidden === 'true');
                    conditions.push("is_hidden = $".concat(params.length));
                }
                where = 'WHERE ' + conditions.join(' AND ');
                return [4 /*yield*/, (0, database_1.query)("SELECT COUNT(*) as count FROM menu_items ".concat(where), params)];
            case 1:
                countResult = _c.sent();
                total = parseInt(countResult[0].count);
                return [4 /*yield*/, (0, database_1.query)("SELECT * FROM menu_items ".concat(where, " ORDER BY name LIMIT $").concat(params.length + 1, " OFFSET $").concat(params.length + 2), __spreadArray(__spreadArray([], params, true), [limit, offset], false))];
            case 2:
                rows = _c.sent();
                (0, responseUtils_1.sendPaginated)(res, rows, (0, responseUtils_1.buildPaginationMeta)(total, page, limit));
                return [3 /*break*/, 4];
            case 3:
                err_2 = _c.sent();
                console.error('GET items error:', err_2);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to fetch menu items');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// GET /api/:restaurantId/menu/items/:id
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, rows, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                restaurantId = req.params.restaurantId;
                return [4 /*yield*/, (0, database_1.query)('SELECT * FROM menu_items WHERE id = $1 AND restaurant_id = $2', [req.params.id, restaurantId])];
            case 1:
                rows = _a.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Menu item not found')];
                (0, responseUtils_1.sendSuccess)(res, rows[0]);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error('GET item/:id error:', err_3);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to fetch menu item');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/:restaurantId/menu/items
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, _a, name_1, price, category_id, description, _b, is_available, _c, is_hidden, shortcode, image_url, rest, fields, values, optionalFields, _i, optionalFields_1, f, placeholders, rows, item, err_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                restaurantId = req.params.restaurantId;
                _a = req.body, name_1 = _a.name, price = _a.price, category_id = _a.category_id, description = _a.description, _b = _a.is_available, is_available = _b === void 0 ? true : _b, _c = _a.is_hidden, is_hidden = _c === void 0 ? false : _c, shortcode = _a.shortcode, image_url = _a.image_url, rest = __rest(_a, ["name", "price", "category_id", "description", "is_available", "is_hidden", "shortcode", "image_url"]);
                if (!name_1 || price === undefined || !category_id || description === undefined) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'name, price, category_id, and description are required')];
                }
                fields = ['restaurant_id', 'name', 'price', 'category_id', 'description', 'is_available', 'is_hidden', 'category'];
                values = [restaurantId, name_1, price, category_id, description, is_available, is_hidden, rest.category || 'Default'];
                if (shortcode) {
                    fields.push('shortcode');
                    values.push(shortcode);
                }
                if (image_url) {
                    fields.push('image_url');
                    values.push(image_url);
                }
                optionalFields = ['image', 'image_file_url', 'allowed_zones', 'theme_colors'];
                for (_i = 0, optionalFields_1 = optionalFields; _i < optionalFields_1.length; _i++) {
                    f = optionalFields_1[_i];
                    if (rest[f] !== undefined) {
                        fields.push(f);
                        values.push(typeof rest[f] === 'object' ? JSON.stringify(rest[f]) : rest[f]);
                    }
                }
                placeholders = fields.map(function (_, i) { return "$".concat(i + 1); }).join(', ');
                return [4 /*yield*/, (0, database_1.query)("INSERT INTO menu_items (".concat(fields.join(', '), ") VALUES (").concat(placeholders, ") RETURNING *"), values)];
            case 1:
                rows = _d.sent();
                item = rows[0];
                return [4 /*yield*/, syncMenuItem(item)];
            case 2:
                _d.sent();
                (0, responseUtils_1.sendSuccess)(res, item, 201);
                return [3 /*break*/, 4];
            case 3:
                err_4 = _d.sent();
                console.error('POST item error:', err_4);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to create menu item');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// PUT /api/:restaurantId/menu/items/:id
router.put('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, updates, setClauses, values, idx, _i, _a, _b, key, val, rows, item, err_5;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                restaurantId = req.params.restaurantId;
                updates = req.body;
                // Sync legacy/new available fields if one is provided
                if (updates.available !== undefined && updates.is_available === undefined)
                    updates.is_available = updates.available;
                if (updates.is_available !== undefined && updates.available === undefined)
                    updates.available = updates.is_available;
                setClauses = [];
                values = [];
                idx = 1;
                for (_i = 0, _a = Object.entries(updates); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], val = _b[1];
                    if (key === 'id' || key === 'restaurant_id')
                        continue;
                    setClauses.push("".concat(key, " = $").concat(idx));
                    values.push(typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
                    idx++;
                }
                if (setClauses.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'No fields to update')];
                // Update updated_at
                setClauses.push("updated_at = $".concat(idx));
                values.push(Date.now());
                idx++;
                values.push(req.params.id);
                values.push(restaurantId);
                return [4 /*yield*/, (0, database_1.query)("UPDATE menu_items SET ".concat(setClauses.join(', '), " WHERE id = $").concat(idx, " AND restaurant_id = $").concat(idx + 1, " RETURNING *"), values)];
            case 1:
                rows = _c.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Menu item not found')];
                item = rows[0];
                return [4 /*yield*/, syncMenuItem(item)];
            case 2:
                _c.sent();
                (0, responseUtils_1.sendSuccess)(res, item);
                return [3 /*break*/, 4];
            case 3:
                err_5 = _c.sent();
                console.error('PUT item/:id error:', err_5);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to update menu item');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// DELETE /api/:restaurantId/menu/items/:id
router.delete('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var restaurantId, rows, syncErr_1, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                restaurantId = req.params.restaurantId;
                return [4 /*yield*/, (0, database_1.query)('DELETE FROM menu_items WHERE id = $1 AND restaurant_id = $2 RETURNING *', [req.params.id, restaurantId])];
            case 1:
                rows = _a.sent();
                if (rows.length === 0)
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 404, 'Menu item not found')];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:deleteMirrorRecord', { table: 'menu_items', pgId: req.params.id })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                syncErr_1 = _a.sent();
                console.warn('⚠️  Convex Sync Warning (MenuItem Delete):', syncErr_1);
                return [3 /*break*/, 5];
            case 5:
                (0, responseUtils_1.sendSuccess)(res, { deleted: true, id: req.params.id });
                return [3 /*break*/, 7];
            case 6:
                err_6 = _a.sent();
                console.error('DELETE item/:id error:', err_6);
                (0, responseUtils_1.sendError)(res, 500, 'Failed to delete menu item');
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
