import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";
import sessionGuard from "../middlewares/sessionGuard.js";

const router = express.Router();


// Session required for all cart operations. Accept either JWT or guest session.
router.get("/:user_id", sessionGuard(false), getCart);
router.post("/add", sessionGuard(false), addToCart);
router.post("/remove", sessionGuard(false), removeFromCart);
router.delete("/clear/:user_id", sessionGuard(false), clearCart);

// Convenience alias: allow DELETE /api/cart/:user_id to clear cart
router.delete("/:user_id", sessionGuard(false), clearCart);

export default router;
