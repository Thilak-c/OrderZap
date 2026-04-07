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
var database_1 = require("../../config/database");
var convexClient_1 = require("../../services/convexClient");
var responseUtils_1 = require("../../utils/responseUtils");
var router = (0, express_1.Router)();
/**
 * Restaurant Registration API
 * ───────────────────────────
 * POST /api/restaurant/
 * Used to onboard new SaaS tenants.
 */
router.post('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, short_id, name_1, email, description, _b, active, _c, status_1, existing, fields, values, placeholders, rows, restaurant, syncErr_1, err_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                _a = req.body, short_id = _a.short_id, name_1 = _a.name, email = _a.email, description = _a.description, _b = _a.active, active = _b === void 0 ? true : _b, _c = _a.status, status_1 = _c === void 0 ? 'active' : _c;
                if (!short_id || !name_1) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'short_id and name are required')];
                }
                return [4 /*yield*/, (0, database_1.query)('SELECT id FROM restaurants WHERE short_id = $1', [short_id])];
            case 1:
                existing = _d.sent();
                if (existing.length > 0) {
                    return [2 /*return*/, (0, responseUtils_1.sendError)(res, 400, 'Restaurant short_id already exists')];
                }
                fields = ['short_id', 'name', 'active', 'status', 'created_at'];
                values = [short_id, name_1, active, status_1, Date.now()];
                if (email) {
                    fields.push('email');
                    values.push(email);
                }
                if (description) {
                    fields.push('description');
                    values.push(description);
                }
                placeholders = fields.map(function (_, i) { return "$".concat(i + 1); }).join(', ');
                return [4 /*yield*/, (0, database_1.query)("INSERT INTO restaurants (".concat(fields.join(', '), ") VALUES (").concat(placeholders, ") RETURNING *"), values)];
            case 2:
                rows = _d.sent();
                restaurant = rows[0];
                _d.label = 3;
            case 3:
                _d.trys.push([3, 5, , 6]);
                return [4 /*yield*/, (0, convexClient_1.mutationConvex)('menu:upsertRestaurantMirror', {
                        pgId: restaurant.id,
                        shortId: restaurant.short_id,
                        name: restaurant.name,
                        active: restaurant.active
                    })];
            case 4:
                _d.sent();
                return [3 /*break*/, 6];
            case 5:
                syncErr_1 = _d.sent();
                console.warn('⚠️  Convex Sync Warning (Restaurant):', syncErr_1);
                return [3 /*break*/, 6];
            case 6:
                (0, responseUtils_1.sendSuccess)(res, restaurant, 201);
                return [3 /*break*/, 8];
            case 7:
                err_1 = _d.sent();
                console.error('POST /api/restaurant error:', err_1);
                (0, responseUtils_1.sendError)(res, 500, "Failed to create restaurant: ".concat(err_1.message));
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
