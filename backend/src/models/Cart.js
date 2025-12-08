import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product_id: String,
  quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
