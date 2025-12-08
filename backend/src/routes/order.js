import express from "express";
import { placeOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

// Place order (checkout)
router.post("/place", placeOrder);

// Order history
router.get("/:user_id", getOrders);

export default router;
