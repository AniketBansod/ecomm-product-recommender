import { apiPost } from "./api";
import { getGuestId } from "./guest";
import { useAuth } from "../context/AuthContext";

export async function logEvent(event_type, product_id, user) {
  const user_id = user?.user_id || getGuestId();

  try {
    await apiPost("/events/log", {
      user_id,
      event_type,
      product_id,
    });
  } catch (err) {
    console.log("Event log failed:", err);
  }
}
