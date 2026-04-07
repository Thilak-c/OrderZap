"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRestaurant = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var responseUtils_1 = require("../utils/responseUtils");
var JWT_SECRET = process.env.JWT_SECRET || 'orderzap_secret_2024_secure_v2';
/**
 * authenticateRestaurant — JWT Middleware
 * ──────────────────────────────────────
 * Verifies the 'Authorization: Bearer <token>' header.
 * Attaches the decoded staff member info to req.user.
 */
var authenticateRestaurant = function (req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return (0, responseUtils_1.sendError)(res, 401, 'Authorization token required (Bearer <token>)');
    }
    var token = authHeader.split(' ')[1];
    try {
        var decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            restaurantId: decoded.restaurantId,
            role: decoded.role
        };
        next();
    }
    catch (err) {
        console.error('JWT Verification Error:', err);
        return (0, responseUtils_1.sendError)(res, 401, 'Invalid or expired token');
    }
};
exports.authenticateRestaurant = authenticateRestaurant;
