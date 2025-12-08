import mongoose from "mongoose";

const EventLogSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },  // works for guest + logged-in
    event_type: { type: String, required: true }, // view, click, add_to_cart, purchase
    product_id: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("EventLog", EventLogSchema);
