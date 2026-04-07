"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginated = sendPaginated;
exports.sendError = sendError;
exports.parsePagination = parsePagination;
exports.buildPaginationMeta = buildPaginationMeta;
/**
 * responseUtils.ts — Standardized API Response Helpers
 * ────────────────────────────────────────────────────
 * Consistent response format across all V2 endpoints.
 */
/**
 * Send a success response.
 */
function sendSuccess(res, data, status) {
    if (status === void 0) { status = 200; }
    res.status(status).json({ success: true, data: data });
}
/**
 * Send a paginated success response.
 */
function sendPaginated(res, data, pagination) {
    res.status(200).json({ success: true, data: data, pagination: pagination });
}
/**
 * Send an error response.
 */
function sendError(res, status, message) {
    res.status(status).json({ success: false, error: message });
}
/**
 * Parse pagination query parameters with defaults.
 */
function parsePagination(query) {
    var page = Math.max(1, parseInt(query.page) || 1);
    var limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    var offset = (page - 1) * limit;
    return { page: page, limit: limit, offset: offset };
}
/**
 * Build a PaginationMeta object.
 */
function buildPaginationMeta(total, page, limit) {
    return {
        page: page,
        limit: limit,
        total: total,
        hasMore: page * limit < total,
    };
}
