import express from "express";
import { logEvent } from "../controllers/eventController.js";
import sessionGuard from "../middlewares/sessionGuard.js";
const router = express.Router();
// Session required for logging events (guest or user)
router.post("/", sessionGuard(false), logEvent);
export default router;
