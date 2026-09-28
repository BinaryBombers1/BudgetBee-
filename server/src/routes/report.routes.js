import { Router } from "express";
import { z } from "zod";
import {
  categoryReport,
  sixMonthTrend,
  dailyWeeklySummary,
  filteredReport,
  forecastReport,
  shareReport,
} from "../controllers/report.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

const router = Router();
router.use(protect);

router.get("/category", categoryReport);
router.get("/trend", sixMonthTrend);
router.get("/daily-weekly", dailyWeeklySummary);
router.get("/filtered", filteredReport);
router.get("/forecast", forecastReport);

const shareSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month"),
  pdf: z.string().min(100).max(7_000_000),
});

router.post("/share", validate(shareSchema), shareReport);

export default router;
