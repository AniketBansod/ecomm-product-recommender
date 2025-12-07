import os
import json
from redis import Redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

redis_client = Redis.from_url(
    REDIS_URL,
    decode_responses=True
)

def set_json(key: str, value, ex: int = None):
    redis_client.set(key, json.dumps(value, ensure_ascii=False), ex=ex)

def get_json(key: str):
    raw = redis_client.get(key)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except:
        return None
