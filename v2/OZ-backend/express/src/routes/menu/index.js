"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var categories_1 = require("./categories");
var menuItems_1 = require("./menuItems");
var menus_1 = require("./menus");
var itemVariants_1 = require("./itemVariants");
var addOns_1 = require("./addOns");
var shortcodes_1 = require("./shortcodes");
var zones_1 = require("./zones");
/**
 * Menu Router registrar
 * ────────────────────
 * Mounts all menu-related routes with { mergeParams: true }
 * to ensure :restaurantId is available to sub-routers.
 */
var menuRouter = (0, express_1.Router)({ mergeParams: true });
menuRouter.use('/categories', categories_1.default);
menuRouter.use('/items', menuItems_1.default);
menuRouter.use('/menus', menus_1.default);
menuRouter.use('/variants', itemVariants_1.default);
menuRouter.use('/add-ons', addOns_1.default);
menuRouter.use('/shortcodes', shortcodes_1.default);
menuRouter.use('/zones', zones_1.default);
exports.default = menuRouter;
