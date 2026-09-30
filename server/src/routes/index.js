import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import transactionRoutes from "./transaction.routes.js";
import budgetRoutes from "./budget.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reportRoutes from "./report.routes.js";
import tipRoutes from "./tip.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import notificationRoutes from "./notification.routes.js";
import adminRoutes from "./admin.routes.js";
import aiRoutes from "./ai.routes.js";
import announcementRoutes from "./announcement.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import voiceRoutes from "./voice.routes.js";
import { sendSuccess } from "../utils/response.js";
import { isAdminPanelEnabled } from "../middlewares/auth.js";

const router = Router();

router.get("/health", (req, res) => sendSuccess(res, { status: "up", ts: Date.now() }, "OK"));
router.get("/config", (req, res) => sendSuccess(res, { adminPanel: isAdminPanelEnabled() }, "OK"));

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/budgets", budgetRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/tips", tipRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/ai", aiRoutes);
router.use("/announcements", announcementRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/voice", voiceRoutes);

export default router;
