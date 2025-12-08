import express from "express";
import axios from "axios";
import OpenAI from "openai";
import { getRedis } from "../config/redis.js";
import sessionGuard from "../middlewares/sessionGuard.js";

const router = express.Router();

// Redis client (optional; route works without Redis)
let redis;
try {
  redis = getRedis();
} catch {
  redis = null;
}

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET: /api/explain?session_id=123&product_id=ABC
// Session required (guest or logged-in). If missing, block.
router.get("/", sessionGuard(false), async (req, res) => {
  try {
    const { session_id, product_id, filter_category, min_price, max_price } = req.query;
    const sid = session_id || req.sessionId;

    if (!sid || !product_id) {
      return res.status(400).json({ error: "Missing session_id or product_id" });
    }

    // ---- 1️⃣ Check Redis cache ----
    const cacheKey = `explain:${sid}:${product_id}`;
    const cached = redis ? await redis.get(cacheKey) : null;

    if (cached) {
      return res.json({ explanation: cached, cached: true });
    }

    // ---- 2️⃣ Fetch product attributes ----
    const product = await axios.get(
      `${process.env.RECOMMENDER_API_URL}/product/${product_id}`
    );

    const productData = product.data || {};

    // ---- 3️⃣ Fetch user event summary ----
    const events = await axios.get(
      `${process.env.RECOMMENDER_API_URL}/session_summary/${sid}`
    );

    const userSummary = events.data || {};

    // ---- 4️⃣ Construct Prompt ----
    const prompt = `
You are an AI recommendation explainer for an e-commerce app.

User behavior summary:
${JSON.stringify(userSummary, null, 2)}

Recommended product:
${JSON.stringify(productData, null, 2)}

   User selected filters:
   ${JSON.stringify({ filter_category, min_price, max_price }, null, 2)}

Explain in simple, clear language WHY this product is recommended.
Focus on:
- category similarity
- price range patterns
- brand preferences
- user browsing or clicking patterns
- product attributes alignment

Keep the explanation short and helpful (4–6 sentences).
`;

    // ---- 5️⃣ Try GPT; on failure use recommender fallback ----
    try {
      const llmResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      const explanation = llmResponse.choices[0].message.content.trim();

      if (redis) {
        await redis.setEx(cacheKey, 43200, explanation);
      }

      return res.json({ explanation, cached: false, source: "openai" });
    } catch (llmErr) {
      console.error("LLM Explanation Error:", llmErr);
      // Fallback: call recommender service explanation (template or cached)
      try {
        const recommenderURL = `${process.env.RECOMMENDER_API_URL}/explain`;
        const r = await axios.get(recommenderURL, {
          params: { user_id: sid, product_id, filter_category, min_price, max_price }
        });

        const fallback = r.data.explanation?.text || r.data.explanation || "We recommended this based on your recent browsing and similar product attributes.";

        if (redis) {
          await redis.setEx(cacheKey, 43200, fallback);
        }

        return res.json({ explanation: fallback, cached: false, source: "fallback" });
      } catch (fbErr) {
        console.error("Recommender fallback explain failed:", fbErr);
        const fallback = "This product matches your recent interests, brand preferences, and price range.";
        if (redis) {
          await redis.setEx(cacheKey, 3600, fallback);
        }
        return res.json({ explanation: fallback, cached: false, source: "basic" });
      }
    }
  } catch (err) {
    console.error("Explain route unexpected error:", err);
    // Do not fail requests entirely; return a basic explanation
    return res.json({ explanation: "This product is similar to what you've viewed and fits your typical price range.", cached: false, source: "basic" });
  }
});

export default router;
