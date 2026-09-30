import { verifyAccessToken } from "../utils/token.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

const DEMO_EMAILS = new Set(["demo@campuscoin.app"]);

const isDemoEmail = (email) => DEMO_EMAILS.has(String(email || "").toLowerCase());

/** Kill-switch: set ADMIN_PANEL_ENABLED=false to retire the whole demo admin system. */
export const isAdminPanelEnabled = () =>
  !["false", "0", "off", "no"].includes(String(env.ADMIN_PANEL_ENABLED ?? "").toLowerCase());

export const adminPanelGuard = (req, res, next) => {
  if (!isAdminPanelEnabled()) {
    return sendError(res, "Admin panel is disabled", 403);
  }
  next();
};

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  let token = null;

  if (header?.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendError(res, "Authentication required", 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };

    // Shared demo account: never deletes anything — except its own transactions,
    // so visitors can clean up junk entries they added themselves.
    if (req.method === "DELETE" && isDemoEmail(decoded.email)) {
      const path = String(req.originalUrl || "").split("?")[0];
      const ownTxDelete = /^\/api\/v1\/transactions\/[a-f0-9]{24}$/i.test(path);
      if (!ownTxDelete) {
        return sendError(res, "Demo account is read-only for this action", 403);
      }
    }
    next();
  } catch {
    return sendError(res, "Token expired or invalid", 401);
  }
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, "Insufficient permissions", 403);
  }
  next();
};

export const adminOnly = requireRole("admin");

/**
 * Blocks sensitive/irreversible actions for the shared demo account so the
 * public demo can never be locked out or altered for other visitors.
 * (DELETE requests are blocked inside `protect`, except the demo's own transactions.)
 * Usage: router.patch("/password", protect, demoGuard, handler)
 */
export const demoGuard = (req, res, next) => {
  if (isDemoEmail(req.user?.email)) {
    return sendError(res, "Demo account is read-only for this action", 403);
  }
  next();
};
