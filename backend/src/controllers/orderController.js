import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Place Order (checkout)
export const placeOrder = async (req, res) => {
  try {
    const { address, payment_mode } = req.body;
    const user_id = req.sessionId || req.body.user_id;

    const cart = await Cart.findOne({ user_id });
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

    // Clear cart
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
