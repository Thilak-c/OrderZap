"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = require("express");
var cors_1 = require("cors");
var express_rate_limit_1 = require("express-rate-limit");
var http_1 = require("http");
var fs_1 = require("fs");
var path_1 = require("path");
var apiKeyAuth_js_1 = require("./middleware/apiKeyAuth.js");
var realtimeRelay_js_1 = require("./services/realtimeRelay.js");
var convexMonitor_js_1 = require("./services/convexMonitor.js");
var health_js_1 = require("./routes/health.js");
var index_js_1 = require("./routes/index.js");
var errorHandler_js_1 = require("./middleware/errorHandler.js");
/**
 * server.ts — OrderZap Express API Gateway
 * ─────────────────────────────────────────
 * Single entry point for the frontend. Provides:
 * - REST API for orders and menu (API key protected)
 * - WebSocket (Socket.io) for real-time updates
 * - Health monitoring with auto-recovery for Convex
 * - PostgreSQL fallback when Convex is unavailable
 * - Detailed file-based telemetry for OZ Monitor
 */
var app = (0, express_1.default)();
var PORT = parseInt(process.env.PORT || "4000", 10);
var LOG_DIR = "/app/logs";
var LOG_FILE = path_1.default.join(LOG_DIR, "access.log");
// Ensure log directory exists
if (!fs_1.default.existsSync(LOG_DIR)) {
    fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
}
// ── Middleware ─────────────────────────────────────
app.use((0, cors_1.default)({ origin: "*" })); // React Native doesn't have a fixed origin
app.use(express_1.default.json());
// Trust proxy if we are behind a reverse proxy (e.g., Docker, Nginx)
app.set("trust proxy", 1);
var apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "TOO_MANY_REQUESTS", message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiter to all requests
// app.use(apiLimiter);
// Detailed Request Telemetry Logging for OZ Monitor
app.use(function (req, res, next) {
    var start = process.hrtime();
    var reqIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown IP';
    var reqUa = req.get('User-Agent') || 'unknown client';
    var reqPort = req.socket.localPort || PORT; // Track the server access port
    res.on("finish", function () {
        var diff = process.hrtime(start);
        var latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        var payload = JSON.stringify({
            ts: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            latency: latencyMs,
            ip: reqIp,
            port: reqPort,
            reason: reqUa
        });
        // Log to console (docker logs)
        console.log("[TRACE] ".concat(payload));
        // Log to persistent file
        try {
            fs_1.default.appendFileSync(LOG_FILE, payload + "\n");
        }
        catch (err) {
            console.error("Failed to write to access.log", err);
        }
    });
    next();
});
// API key authentication (exempts /api/health)
app.use("/api", apiKeyAuth_js_1.apiKeyAuth);
// ── Routes ────────────────────────────────────────
app.use("/api/health", health_js_1.default);
app.use("/api", index_js_1.default);
// Root route — HTML API explorer
app.get("/", function (_req, res) {
    var docsPath = path_1.default.join(process.cwd(), "express", "API_DOCS.md");
    if (!fs_1.default.existsSync(docsPath)) {
        docsPath = path_1.default.join(process.cwd(), "API_DOCS.md");
    }
    var mdContent = "API Documentation not found.";
    try {
        mdContent = fs_1.default.readFileSync(docsPath, "utf-8");
    }
    catch (e) {
        console.error("Could not read API_DOCS.md at ".concat(docsPath), e);
    }
    res.setHeader("Content-Type", "text/html");
    var safeMd = mdContent.replace(/<\/script>/gi, '<\\/script>');
    res.send("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>OrderZap API Explorer</title>\n  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-dark.min.css\" />\n  <script src=\"https://cdn.jsdelivr.net/npm/marked/marked.min.js\"></script>\n  <style>\n    body {\n      box-sizing: border-box;\n      min-width: 200px;\n      max-width: 980px;\n      margin: 0 auto;\n      padding: 45px;\n      background-color: #0d1117;\n      font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Helvetica,Arial,sans-serif;\n    }\n    .markdown-body {\n      box-sizing: border-box;\n      min-width: 200px;\n      max-width: 980px;\n      margin: 0 auto;\n    }\n    @media (max-width: 767px) {\n      body { padding: 15px; }\n    }\n    .header {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n      margin-bottom: 2rem;\n      padding-bottom: 1rem;\n      border-bottom: 1px solid #30363d;\n    }\n    .logo {\n      font-size: 24px;\n      font-weight: 800;\n      background: linear-gradient(135deg, #f97316, #fb923c);\n      -webkit-background-clip: text;\n      -webkit-text-fill-color: transparent;\n      font-family: system-ui, sans-serif;\n    }\n    .badge {\n      background: #1f2937;\n      color: #9ca3af;\n      padding: 2px 8px;\n      border-radius: 12px;\n      font-size: 12px;\n      font-family: sans-serif;\n      border: 1px solid #374151;\n    }\n    .live-status {\n      margin-left: auto;\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      font-size: 13px;\n      color: #4ade80;\n      font-family: sans-serif;\n    }\n    .dot {\n      width: 8px; height: 8px; background: #4ade80; border-radius: 50%;\n      animation: pulse 2s infinite;\n    }\n    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }\n  </style>\n</head>\n<body>\n  <div class=\"header\">\n    <div class=\"logo\">API</div>\n    <div class=\"badge\">v2.0.0</div>\n    <div class=\"live-status\"><div class=\"dot\"></div> Live :4000</div>\n  </div>\n  <script type=\"text/markdown\" id=\"md-content\">\n" + safeMd + "\n  </script>\n  <article class=\"markdown-body\" id=\"content-area\"></article>\n\n  <script>\n    const markdownText = document.getElementById('md-content').textContent;\n    document.getElementById('content-area').innerHTML = marked.parse(markdownText);\n  </script>\n</body>\n</html>");
});
// 404 handler
app.use(function (_req, res) {
    res.status(404).json({ error: "NOT_FOUND", message: "Endpoint not found" });
});
// Global error handler (must be last)
app.use(errorHandler_js_1.errorHandler);
// ── HTTP + WebSocket Server ───────────────────────
var httpServer = (0, http_1.createServer)(app);
(0, realtimeRelay_js_1.initSocketServer)(httpServer);
// ── Convex Health Monitor ─────────────────────────
convexMonitor_js_1.convexMonitor.on("convex:healthy", function () {
    (0, realtimeRelay_js_1.emitConvexStatus)("healthy");
});
convexMonitor_js_1.convexMonitor.on("convex:unhealthy", function (_a) {
    var failureCount = _a.failureCount;
    (0, realtimeRelay_js_1.emitConvexStatus)("unhealthy (failures: ".concat(failureCount, ")"));
});
convexMonitor_js_1.convexMonitor.on("convex:recovering", function () {
    console.log("🔄 Auto-recovery in progress — Express continues serving via PostgreSQL");
    (0, realtimeRelay_js_1.emitConvexStatus)("recovering");
});
convexMonitor_js_1.convexMonitor.on("convex:recovered", function () {
    console.log("🎉 Convex is back online — switching to real-time mode");
    (0, realtimeRelay_js_1.emitConvexStatus)("healthy");
});
convexMonitor_js_1.convexMonitor.on("convex:fatal", function (_a) {
    var message = _a.message;
    console.error("\uD83D\uDEA8 Convex recovery failed: ".concat(message));
    (0, realtimeRelay_js_1.emitConvexStatus)("fatal: ".concat(message));
});
// ── Start ─────────────────────────────────────────
httpServer.listen(PORT, function () {
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  🚀 OrderZap API Gateway");
    console.log("  \uD83D\uDCE1 HTTP + WebSocket: http://localhost:".concat(PORT));
    console.log("  \uD83D\uDD11 API Key: ".concat(process.env.API_KEY ? "configured" : "⚠️  NOT SET"));
    console.log("  \uD83D\uDC18 PostgreSQL: ".concat(process.env.PG_URL ? "configured" : "⚠️  NOT SET"));
    console.log("   Convex: ".concat(process.env.CONVEX_URL || "http://127.0.0.1:3210"));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    // Start the Convex health monitor
    convexMonitor_js_1.convexMonitor.start();
});
// ── Graceful Shutdown ─────────────────────────────
process.on("SIGINT", function () {
    console.log("\n🛑 Shutting down OrderZap API...");
    convexMonitor_js_1.convexMonitor.stop();
    httpServer.close(function () {
        console.log("👋 Server closed");
        process.exit(0);
    });
});
process.on("SIGTERM", function () {
    console.log("\n🛑 SIGTERM received");
    convexMonitor_js_1.convexMonitor.stop();
    httpServer.close(function () { return process.exit(0); });
});
