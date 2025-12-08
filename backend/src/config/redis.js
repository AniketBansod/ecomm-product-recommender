import { createClient } from "redis";

let redisClient = null;

export default function initRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("REDIS_URL not set — skipping redis init");
    return;
  }
  redisClient = createClient({ url });
  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  redisClient.connect()
    .then(() => console.log("Redis connected"))
    .catch(e => console.error("Redis connect error", e));
}

export function getRedis() {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
}
