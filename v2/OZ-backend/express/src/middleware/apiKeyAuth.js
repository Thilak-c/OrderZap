"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = apiKeyAuth;
/**
 * apiKeyAuth.ts — API Key Authentication Middleware
 * ──────────────────────────────────────────────────
 * Validates the `x-api-key` header on every request.
 * The frontend must include this header with the correct key.
 *
 * ⚡ The /api/health endpoint is exempt (for monitoring tools).
 */
var API_KEY = process.env.API_KEY;
function apiKeyAuth(req, res, next) {
    // Allow health checks without authentication. Since middleware is mounted at /api, req.path is /health
    if (req.path === "/health" || req.path === "/health/") {
        next();
        return;
    }
    // Support both header and query parameter (for easier browser/Postman testing)
    var clientKey = (req.headers["x-api-key"] || req.query["x-api-key"]);
    if (!API_KEY) {
        console.error("❌ API_KEY is not set in environment variables!");
        res.status(500).json({
            error: "SERVER_CONFIG_ERROR",
            message: "API key not configured on server",
        });
        return;
    }
    if (!clientKey) {
        res.status(401).json({
            error: "UNAUTHORIZED",
            message: "Missing x-api-key header",
            message_by_thilak: "Nice try nigga",
        });
        return;
    }
    if (clientKey !== API_KEY) {
        res.status(401).json({
            error: "UNAUTHORIZED",
            message: "Invalid API key",
            message_by_thilak: "Nice try nigga",
        });
        return;
    }
    next();
}
