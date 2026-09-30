import { Router } from "express";
import { createFeedback, listMyFeedback } from "../controllers/feedback.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { z } from "zod";

const router = Router();
router.use(protect);

const createSchema = z.object({
  category: z.enum(["bug", "idea", "praise", "other"]).default("other"),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().trim().min(5).max(2000),
});

router.post("/", validate(createSchema), createFeedback);
router.get("/mine", listMyFeedback);

export default router;
