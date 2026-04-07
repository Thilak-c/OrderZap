"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
/**
 * errorHandler.ts — Global Error Handling Middleware
 * ──────────────────────────────────────────────────
 * Catches unhandled errors from route handlers.
 * Must be registered LAST in the Express middleware stack.
 */
function errorHandler(err, _req, res, _next) {
    console.error('\n[API Error]', err);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
}
