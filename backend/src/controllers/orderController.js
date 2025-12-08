import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Place Order (checkout)
export const placeOrder = async (req, res) => {
  try {
    const { address, payment_mode, guest_id } = req.body;
    const user_id = req.sessionId || req.body.user_id;

    let cart = await Cart.findOne({ user_id });
    // If user has no cart items but provided a guest_id, migrate guest cart
    if ((!cart || cart.items.length === 0) && guest_id) {
      const guestCart = await Cart.findOne({ user_id: String(guest_id) });
      if (guestCart && guestCart.items.length > 0) {
        // Move items from guest cart to user cart
        if (!cart) {
          cart = await Cart.create({ user_id, items: [] });
        }
        // Append items; if duplicates, sum quantities
        const qtyMap = new Map();
        for (const it of cart.items) {
          qtyMap.set(it.product_id, (qtyMap.get(it.product_id) || 0) + it.quantity);
        }
        for (const it of guestCart.items) {
          qtyMap.set(it.product_id, (qtyMap.get(it.product_id) || 0) + it.quantity);
        }
        cart.items = Array.from(qtyMap.entries()).map(([pid, q]) => ({ product_id: pid, quantity: q }));
        await cart.save();
        // Clear guest cart after migration
        guestCart.items = [];
        await guestCart.save();
      }
    }
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Fetch product prices
    const productDocs = await Product.find({
      product_id: { $in: cart.items.map(i => i.product_id) }
    });

    const orderItems = cart.items.map(item => {
      const prod = productDocs.find(p => p.product_id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: prod ? prod.price : 0
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      user_id,
      items: orderItems,
      total_amount: totalAmount,
      payment_mode,
      address
    });

    // Clear cart (user cart) after successful order
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order placed successfully!",
      order
    });

  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Order History
export const getOrders = async (req, res) => {
  try {
    const user_id = req.sessionId || req.params.user_id;
    const orders = await Order.find({ user_id }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
