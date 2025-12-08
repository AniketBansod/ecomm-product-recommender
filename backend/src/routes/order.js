import express from "express";
import { placeOrder, getOrders } from "../controllers/orderController.js";
import sessionGuard from "../middlewares/sessionGuard.js";

const router = express.Router();

// Place order (checkout) — session required
router.post("/place", sessionGuard(false), placeOrder);

// Order history — session required
router.get("/:user_id", sessionGuard(false), getOrders);

export default router;
