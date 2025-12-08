import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Get cart for a user/guest
export const getCart = async (req, res) => {
  try {
    const userId = req.params.user_id;

    let cart = await Cart.findOne({ user_id: userId }).populate("items.product_id");

    if (!cart) {
      cart = await Cart.create({ user_id: userId, items: [] });
    }

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    let cart = await Cart.findOne({ user_id });

    if (!cart) {
      cart = await Cart.create({ user_id, items: [] });
    }

    const existing = cart.items.find((item) => item.product_id === product_id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product_id, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    let cart = await Cart.findOne({ user_id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product_id !== product_id);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Remove error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    let cart = await Cart.findOneAndUpdate(
      { user_id },
      { items: [] },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
