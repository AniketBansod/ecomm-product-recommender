import { apiPost } from "./api";
import { getGuestId } from "./guest";

export async function logEvent(event_type, product_id, user, metadata = {}) {
  try {
    const user_id = user?.user_id || getGuestId();
    await apiPost("/events", { user_id, event_type, product_id, metadata });
  } catch (e) {
    // Non-blocking: log to console but don't throw
    console.warn("logEvent failed", e);
  }
}
