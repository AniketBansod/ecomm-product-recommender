import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String }, // for JWT auth
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("User", UserSchema);
