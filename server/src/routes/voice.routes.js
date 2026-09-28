import { Router } from "express";
import { z } from "zod";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { synthesizeSpeech, ttsEngineStatus } from "../services/tts.service.js";

const router = Router();
router.use(protect);

const ttsSchema = z.object({
  text: z.string().min(1).max(1000),
  locale: z.string().max(12).default("en-US"),
});

router.get("/status", (req, res) => sendSuccess(res, ttsEngineStatus()));

router.post(
  "/tts",
  validate(ttsSchema),
  asyncHandler(async (req, res) => {
    const t0 = Date.now();
    const iso = new Date(t0).toISOString();
    try {
      const { audio, voice, cached } = await synthesizeSpeech(req.body);
      console.log(`[tts] arrive=${iso} done=${new Date().toISOString()} len=${req.body.text.length} ${voice} ${cached ? "cache" : "fresh"} ${Date.now() - t0}ms`);
      return sendSuccess(res, {
        audio: audio.toString("base64"),
        mime: "audio/mpeg",
        voice,
        engine: "neural",
      });
    } catch (e) {
      console.log(`[tts] fail len=${req.body.text.length} ${Date.now() - t0}ms ${e.message}`);
      /* neural engine unreachable -> client falls back to browser TTS */
      return sendError(res, "Neural voice is unavailable right now", 502);
    }
  })
);

export default router;
