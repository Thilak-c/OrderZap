"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var create_1 = require("./create");
/**
 * Restaurant Router Registrar
 * ───────────────────────────
 * Parent router for restaurant registration and management.
 */
var restaurantRouter = (0, express_1.Router)();
// Endpoint: POST /api/restaurant/
restaurantRouter.use('/', create_1.default);
exports.default = restaurantRouter;
