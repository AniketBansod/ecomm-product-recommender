import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/:user_id", getCart);
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.delete("/clear/:user_id", clearCart);

// Convenience alias: allow DELETE /api/cart/:user_id to clear cart
router.delete("/:user_id", clearCart);

export default router;
