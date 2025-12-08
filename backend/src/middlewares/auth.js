import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// helper to get session id (either user id or guest id)
export function getSessionId(req) {
  // prefer authenticated user
  if (req.user && req.user.id) return `user:${req.user.id}`;
  // allow client to send guest id header or create one later
  const guest = req.headers["x-guest-id"];
  if (guest) return `guest:${guest}`;
  return null;
}
