import express from "express";
import EventLog from "../models/EventLog.js";

const router = express.Router();

// POST: /api/events/log
router.post("/log", async (req, res) => {
  try {
    const { user_id, event_type, product_id } = req.body;

    if (!user_id || !event_type || !product_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await EventLog.create({ user_id, event_type, product_id });
    res.json({ success: true });
  } catch (err) {
    console.log("Event log error:", err);
    res.status(500).json({ error: "Event logging failed" });
  }
});

// GET: /api/events/:user_id
router.get("/:user_id", async (req, res) => {
  try {
    const logs = await EventLog.find({ user_id: req.params.user_id })
      .sort({ createdAt: -1 })
      .limit(20); // last 20 events (good for LLM)

    res.json({
      user_id: req.params.user_id,
      recent_events: logs,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch events" });
  }
});

export default router;
