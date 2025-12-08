const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function apiGet(path){
  const resp = await fetch(`${BASE}${path}`);
  if(!resp.ok) throw new Error("API error");
  return resp.json();
}

export async function apiPost(path, body){
  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  });
  if(!resp.ok) throw new Error("API error");
  return resp.json();
}
