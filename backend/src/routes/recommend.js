import express from "express";
import { getRecommendations } from "../controllers/recommendController.js";
import sessionGuard from "../middlewares/sessionGuard.js";

const router = express.Router();

// Session required (guest via session_id or logged-in via JWT)
router.get("/", sessionGuard(false), getRecommendations);

export default router;
