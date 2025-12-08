import Event from "../models/Event.js";
import { getRedis } from "../config/redis.js";

export const logEvent = async (req, res, next) => {
  try {
    const { user_id, event_type, product_id, metadata } = req.body;
    const ev = await Event.create({ user_id, event_type, product_id, metadata });
    // push to redis event buffer for quick access (store last 20)
    try {
      const client = getRedis();
      if (client) {
        const key = `user_events:${user_id}`;
        await client.lPush(key, JSON.stringify({ product_id, event_type, ts: ev.createdAt }));
        await client.lTrim(key, 0, 19);
        await client.expire(key, Number(process.env.GUEST_SESSION_TTL || 86400));
      }
    } catch(e) { console.warn("redis buffer push failed", e); }
    res.json({ ok: true, event: ev });
  } catch (err) { next(err); }
};
