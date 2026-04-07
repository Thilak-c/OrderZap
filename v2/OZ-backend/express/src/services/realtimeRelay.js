"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getIO = getIO;
exports.emitNewOrder = emitNewOrder;
exports.emitOrderUpdate = emitOrderUpdate;
exports.emitMenuUpdate = emitMenuUpdate;
exports.emitMenuSynced = emitMenuSynced;
exports.emitConvexStatus = emitConvexStatus;
var socket_io_1 = require("socket.io");
/**
 * realtimeRelay.ts — Socket.io Real-Time Relay
 * ─────────────────────────────────────────────
 * Manages WebSocket connections for pushing real-time updates
 * from the Express API to connected frontend clients.
 *
 * Events pushed to clients:
 *   - order:new        → A new order was placed
 *   - order:updated    → An order's status changed
 *   - menu:updated     → A menu item's stock changed
 *   - menu:synced      → Full menu sync completed
 *   - convex:status    → Convex health status changed
 */
var API_KEY = process.env.API_KEY;
var io = null;
/**
 * Initialize the Socket.io server on the given HTTP server.
 * Validates API key on connection handshake.
 */
function initSocketServer(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Allow all origins (React Native doesn't have a fixed origin)
            methods: ["GET", "POST"],
        },
        pingTimeout: 20000,
        pingInterval: 10000,
    });
    // Authenticate on connection via API key in handshake auth
    io.use(function (socket, next) {
        var _a;
        var clientKey = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.apiKey;
        if (!API_KEY) {
            return next(new Error("Server API key not configured"));
        }
        if (!clientKey || clientKey !== API_KEY) {
            return next(new Error("Authentication failed: invalid API key"));
        }
        next();
    });
    io.on("connection", function (socket) {
        console.log("\uD83D\uDCE1 Client connected: ".concat(socket.id));
        socket.on("disconnect", function (reason) {
            console.log("\uD83D\uDCE1 Client disconnected: ".concat(socket.id, " (").concat(reason, ")"));
        });
    });
    console.log("📡 Socket.io server initialized");
    return io;
}
/**
 * Get the Socket.io server instance.
 */
function getIO() {
    return io;
}
// ── Emit Helpers ──────────────────────────────────
/** Emit when a new order is placed */
function emitNewOrder(order) {
    io === null || io === void 0 ? void 0 : io.emit("order:new", order);
}
/** Emit when an order status is updated */
function emitOrderUpdate(data) {
    io === null || io === void 0 ? void 0 : io.emit("order:updated", data);
}
/** Emit when a menu item's stock changes */
function emitMenuUpdate(data) {
    io === null || io === void 0 ? void 0 : io.emit("menu:updated", data);
}
/** Emit when a full menu sync completes */
function emitMenuSynced(data) {
    io === null || io === void 0 ? void 0 : io.emit("menu:synced", data);
}
/** Emit Convex status changes */
function emitConvexStatus(status) {
    io === null || io === void 0 ? void 0 : io.emit("convex:status", { status: status, timestamp: new Date().toISOString() });
}
