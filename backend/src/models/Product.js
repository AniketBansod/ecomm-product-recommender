import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  title: String,
  description: String,
  full_category_path: String,
  top_category: String,
  normalized_top_category: String,
  brand: String,
  price: Number,
  image_url: String,
});

export default mongoose.model("Product", productSchema);
