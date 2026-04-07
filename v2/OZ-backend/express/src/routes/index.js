"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = require("./auth");
var index_1 = require("./menu/index");
var health_1 = require("./health");
var index_2 = require("./restaurant/index");
/**
 * Main API Route Registrar
 * ────────────────────────
 * Root router mounted at /api in server.ts.
 * All menu features are scoped to a :restaurantId via SaaS-style paths.
 */
var mainRouter = (0, express_1.Router)();
// Authentication Logic
mainRouter.use('/auth', auth_1.default);
// Standard health check (not restaurant-scoped)
mainRouter.use('/health', health_1.default);
// Restaurant management (onboarding)
mainRouter.use('/restaurant', index_2.default);
// Scope all menu features to a restaurant
mainRouter.use('/:restaurantId/menu', index_1.default);
// API root info
mainRouter.get('/', function (_req, res) {
    res.json({
        success: true,
        data: {
            name: "OrderZap SaaS API",
            version: "1.0.0",
            description: "Focus: Menu Management",
            usage: "GET /api/:restaurantId/menu/items"
        }
    });
});
exports.default = mainRouter;
