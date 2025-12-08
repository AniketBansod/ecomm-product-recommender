import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product_id: String,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    items: [orderItemSchema],
    total_amount: Number,
    status: { type: String, default: "confirmed" },
    payment_mode: { type: String, default: "COD" },  // Cash-on-delivery (simplest)
    address: {
      full_name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
