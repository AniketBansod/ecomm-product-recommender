import os
import json
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
import faiss
from utils import load_products, load_embeddings, compute_embeddings
from typing import List, Optional
import openai
import uvicorn
import requests
import hashlib

# Redis caching
from redis_client import get_json, set_json

load_dotenv()

# ----------------------------------------------------
# CONFIG
# ----------------------------------------------------
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "./embeddings.npy")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index.bin")
PRODUCT_IDS_PATH = os.getenv("PRODUCT_IDS_PATH", "./product_ids.json")
PRODUCTS_CSV = os.getenv("PRODUCTS_CSV", "../data/products_curated_v3_with_brands.csv")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

TOP_K_DEFAULT = int(os.getenv("TOP_K", "10"))

# Redis TTLs
EXPLAIN_TTL = int(os.getenv("EXPLAIN_TTL", "86400"))     # 24 hours
RECOMMEND_TTL = int(os.getenv("RECOMMEND_TTL", "300"))   # 5 minutes

# Node backend URL
NODE_BACKEND = os.getenv("NODE_BACKEND_URL", "http://localhost:5000")

# ----------------------------------------------------
# INIT
# ----------------------------------------------------
app = FastAPI(title="ShopSense Recommender")

products_df = load_products(PRODUCTS_CSV)
product_lookup = {str(r["product_id"]): r.to_dict() for _, r in products_df.iterrows()}

# Load FAISS + embeddings
if (
    os.path.exists(EMBEDDINGS_PATH)
    and os.path.exists(FAISS_INDEX_PATH)
    and os.path.exists(PRODUCT_IDS_PATH)
):
    embeddings = np.load(EMBEDDINGS_PATH)
    index = faiss.read_index(FAISS_INDEX_PATH)
    PRODUCT_IDS = json.load(open(PRODUCT_IDS_PATH, "r"))
else:
    embeddings = None
    index = None
    PRODUCT_IDS = []


# ----------------------------------------------------
# HELPERS
# ----------------------------------------------------
def vector_search(query_embedding: np.ndarray, top_k: int = 10):
    if index is None:
        raise HTTPException(status_code=500, detail="FAISS index not loaded")

    q = query_embedding.astype("float32")
    faiss.normalize_L2(q)
    D, I = index.search(q, top_k)
    return D, I


def compute_user_vector_from_events(events: List[dict]):
    weights = {"view": 1.0, "click": 3.0, "add_to_cart": 5.0, "purchase": 10.0}

    vecs = []
    total_w = 0

    for ev in events:
        pid = str(ev.get("product_id"))

        try:
            idx = PRODUCT_IDS.index(pid)
        except ValueError:
            continue

        w = weights.get(ev.get("event_type", "view"), 1.0)
        vecs.append(embeddings[idx] * w)
        total_w += w

    if not vecs:
        return None

    user_vec = sum(vecs) / max(total_w, 1.0)

    norm = np.linalg.norm(user_vec)
    if norm > 0:
        user_vec /= norm

    return user_vec.reshape(1, -1)


def events_hash(events):
    try:
        s = json.dumps(events, sort_keys=True)
        return hashlib.sha1(s.encode()).hexdigest()[:12]
    except:
        return "nohash"


# ----------------------------------------------------
# LLM EXPLANATION
# ----------------------------------------------------
def template_explain(user_id: str, product: dict, events: List[dict]):
    cat_counts = {}

    for ev in events:
        pid = ev.get("product_id")
        p = product_lookup.get(str(pid))

        if not p:
            continue

        cat = p.get("normalized_top_category", "")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    if cat_counts:
        top_cat = max(cat_counts, key=cat_counts.get)
        base = f"You recently explored several {top_cat} items. This product fits those interests."
    else:
        base = "This product aligns with your browsing behavior."

    brand = product.get("brand") or ""
    price = product.get("price")

    suffix = (
        f" It is a {brand} product priced at ₹{price}."
        if brand
        else f" Price: ₹{price}."
    )

    return base + suffix


def call_openai_explain(user_id: str, product: dict, events: List[dict]):
    if not OPENAI_API_KEY:
        return {"text": template_explain(user_id, product, events), "source": "template"}

    openai.api_key = OPENAI_API_KEY

    context = [f"{ev['event_type']}:{ev['product_id']}" for ev in events[-6:]]

    prompt = f"""
User recent actions: {context}

Product:
- Title: {product.get('title')}
- Brand: {product.get('brand')}
- Category: {product.get('normalized_top_category')}
- Price: {product.get('price')}

Write a concise, helpful explanation (2 sentences) of why this product is recommended.
"""

    try:
        resp = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.25,
        )

        return {
            "text": resp["choices"][0]["message"]["content"].strip(),
            "source": "openai",
        }

    except Exception as e:
        return {
            "text": template_explain(user_id, product, events),
            "source": "template",
            "error": str(e),
        }


# ----------------------------------------------------
# ENDPOINTS
# ----------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "faiss_loaded": index is not None,
        "total_products": len(PRODUCT_IDS),
    }


@app.post("/admin/build")
def admin_build():
    from build_embeddings import build
    build()
    return {"status": "rebuilt"}


# ---------------- PRODUCT LOOKUP ----------------
@app.get("/product/{product_id}")
def get_product(product_id: str):
    if product_id not in product_lookup:
        raise HTTPException(status_code=404, detail="Not found")
    return product_lookup[product_id]


# ---------------- SESSION SUMMARY ----------------
@app.get("/session_summary/{session_id}")
def session_summary(session_id: str):
    """
    Fetch user events from Node backend and return a normalized event list.
    """
    try:
        resp = requests.get(f"{NODE_BACKEND}/api/events/{session_id}", timeout=3)

        if resp.status_code == 200:
            data = resp.json()
            logs = data.get("recent_events", [])

            cleaned = []
            for ev in logs:
                cleaned.append({
                    "event_type": ev.get("event_type"),
                    "product_id": ev.get("product_id"),
                    "timestamp": ev.get("createdAt")
                })

            return {"session_id": session_id, "recent_events": cleaned}

    except Exception as e:
        print("Event fetch error:", e)

    return {"session_id": session_id, "recent_events": []}


# ---------------- RECOMMEND ----------------
@app.get("/recommend")
def recommend(
    user_id: str = Query(...),
    k: int = TOP_K_DEFAULT,
    filter_category: Optional[str] = None
):
    # fetch real user events
    summary = requests.get(f"{NODE_BACKEND}/api/events/{user_id}").json()
    events = summary.get("recent_events", [])

    # cache key
    evhash = events_hash(events)
    fcat = filter_category or "all"
    cache_key = f"recommend:{user_id}:{evhash}:{fcat}:k{k}"

    cached = get_json(cache_key)
    if cached:
        return {"cached": True, "results": cached}

    # compute user vector
    if events:
        user_vec = compute_user_vector_from_events(events)
    else:
        user_vec = np.mean(embeddings, axis=0).reshape(1, -1)
        faiss.normalize_L2(user_vec)

    # FAISS search
    D, I = vector_search(user_vec, top_k=max(k * 3, 50))

    results = []
    for sim_row, idx_row in zip(D.tolist(), I.tolist()):
        for sim, idx in zip(sim_row, idx_row):
            pid = PRODUCT_IDS[idx]
            prod = product_lookup.get(pid)

            if filter_category and prod["normalized_top_category"] != filter_category:
                continue

            results.append({
                "product_id": pid,
                "score": float(sim),
                "product": prod
            })

            if len(results) >= k:
                break
        if len(results) >= k:
            break

    set_json(cache_key, results, ex=RECOMMEND_TTL)

    return {"cached": False, "results": results}


# ---------------- EXPLAIN ----------------
@app.get("/explain")
def explain(
    user_id: str = Query(...),
    product_id: str = Query(...)
):
    if product_id not in product_lookup:
        raise HTTPException(404, "Product not found")

    product = product_lookup[product_id]

    # get session events
    summary = requests.get(f"{NODE_BACKEND}/api/events/{user_id}").json()
    events = summary.get("recent_events", [])

    evhash = events_hash(events)
    cache_key = f"explain:{user_id}:{product_id}:{evhash}"

    cached = get_json(cache_key)
    if cached:
        return {"cached": True, "explanation": cached}

    resp = call_openai_explain(user_id, product, events)

    set_json(cache_key, resp, ex=EXPLAIN_TTL)

    return {"cached": False, "explanation": resp}


# ---------------- SERVER START ----------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
