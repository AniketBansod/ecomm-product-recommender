import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import initRedis from "./config/redis.js";
import explainRoutes from "./routes/explain.routes.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import authRoutes from "./routes/auth.js";
import recommendRoutes from "./routes/recommend.js";
import eventRoutes from "./routes/event.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// DB + Redis
connectDB();
initRedis(); // ensures redis client created

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/explain", explainRoutes);
app.get("/", (_, res) => res.json({ ok: true, service: "backend" }));

// central error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
