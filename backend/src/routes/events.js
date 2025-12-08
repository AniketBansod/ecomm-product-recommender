import express from "express";
import { logEvent } from "../controllers/eventController.js";
const router = express.Router();
router.post("/", logEvent);
export default router;
