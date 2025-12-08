import axios from "axios";
import EventLog from "../models/EventLog.js";
import Product from "../models/Product.js";

export const getRecommendations = async (req, res) => {
  try {
    const sessionId = req.query.session_id || req.sessionId;
    const k = Number(req.query.k) || 5;

    if (!sessionId) {
      return res.status(400).json({ error: "session_id is required" });
    }

    // 1️⃣ Fetch recent user events (EventLog is primary store consumed by FastAPI)
    const events = await EventLog.find({ user_id: sessionId })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentProductIds = events.map((e) => e.product_id);

    // If no recent events for this session, return empty recommendations
    if (!recentProductIds.length) {
      return res.json({
        session_id: sessionId,
        recommended_products: [],
        cached: false,
        message: "No activity yet. Browse items to get recommendations.",
      });
    }

    // 2️⃣ Send to FastAPI recommender
    const recommenderURL = `${process.env.RECOMMENDER_API_URL}/recommend`;

    // FastAPI fetches events from Node directly; just pass user_id and k
    const response = await axios.get(recommenderURL, {
      params: {
        user_id: sessionId,
        k,
      }
    });

    // FastAPI returns { cached, results: [{ product_id, score, product: {...} }] }
    const results = response.data.results || [];

    // Prefer using product data from recommender directly; ensure product_id present
    const products = results.map((r) => ({
      ...(r.product || {}),
      product_id: r.product_id || (r.product ? r.product.product_id : undefined),
      _score: r.score,
    }));

    return res.json({
      session_id: sessionId,
      recommended_products: products,
      cached: !!response.data.cached,
    });

  } catch (err) {
    console.error("Recommendation error:", err.message);
    res.status(500).json({ error: "Recommendation failed" });
  }
};
