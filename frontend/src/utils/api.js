const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
import { getGuestId } from "./guest";

function getSessionId() {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const u = JSON.parse(raw);
      const uid = u?.user_id || u?.id || u?._id;
      if (uid) return String(uid);
    }
  } catch {}
  try {
    return String(getGuestId());
  } catch {
    return undefined;
  }
}

export async function apiGet(path){
  const sid = getSessionId();
  const resp = await fetch(`${BASE}${path}`, {
    headers: sid ? { "x-session-id": sid } : undefined,
  });
  if(!resp.ok) throw new Error("API error");
  return resp.json();
}

export async function apiPost(path, body){
  const sid = getSessionId();
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {"Content-Type":"application/json", ...(sid ? {"x-session-id": sid} : {})},
    body: JSON.stringify(body)
  });
  if(!resp.ok) throw new Error("API error");
  return resp.json();
}

export async function apiDelete(path){
  const sid = getSessionId();
  const resp = await fetch(`${BASE}${path}`, { method: "DELETE", headers: sid ? {"x-session-id": sid} : undefined });
  if(!resp.ok) throw new Error("API error");
  try { return await resp.json(); } catch { return {}; }
}
