import express from "express";
import EventLog from "../models/EventLog.js";
import sessionGuard from "../middlewares/sessionGuard.js";
// Optional: legacy Event model used elsewhere; keep for future reads if needed
import Event from "../models/Event.js";

const router = express.Router();

// POST: /api/events/log
// Session required (guest or logged-in)
router.post("/log", sessionGuard(false), async (req, res) => {
  try {
    const { user_id, event_type, product_id } = req.body;
    const sid = req.sessionId || user_id;

    if (!sid || !event_type || !product_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Write to EventLog (primary store used by recommender)
    await EventLog.create({ user_id: sid, event_type, product_id });
    // Also write to Event (legacy store) to keep other controllers functional
    try {
      await Event.create({ user_id: sid, event_type, product_id });
    } catch (_) {}
    res.json({ success: true });
  } catch (err) {
    console.log("Event log error:", err);
    res.status(500).json({ error: "Event logging failed" });
  }
});

// POST: /api/events
// Alias to support existing frontend calls posting to "/events"
router.post("/", sessionGuard(false), async (req, res) => {
  try {
    const { user_id, event_type, product_id } = req.body;
    const sid = req.sessionId || user_id;

    if (!sid || !event_type || !product_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await EventLog.create({ user_id: sid, event_type, product_id });
    try {
      await Event.create({ user_id: sid, event_type, product_id });
    } catch (_) {}
    res.json({ success: true });
  } catch (err) {
    console.log("Event log error:", err);
    res.status(500).json({ error: "Event logging failed" });
  }
});

// GET: /api/events/:user_id
router.get("/:user_id", sessionGuard(false), async (req, res) => {
  try {
    const sid = req.sessionId || req.params.user_id;
    let logs = await EventLog.find({ user_id: sid })
      .sort({ createdAt: -1 })
      .limit(20); // last 20 events (good for LLM)

    // Fallback to legacy Event model if EventLog has no data (backfill compatibility)
    if (!logs || logs.length === 0) {
      try {
        logs = await Event.find({ user_id: sid })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
      } catch (_) {}
    }

    res.json({
      user_id: sid,
      recent_events: logs,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch events" });
  }
});

export default router;
