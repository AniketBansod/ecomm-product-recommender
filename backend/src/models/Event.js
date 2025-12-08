import mongoose from "mongoose";
const EventSchema = new mongoose.Schema({
  user_id: { type: String }, // user id or guest id
  event_type: { type: String }, // view, click, add_to_cart, purchase
  product_id: { type: String },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Event", EventSchema);
