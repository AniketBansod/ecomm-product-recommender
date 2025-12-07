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

# Redis caching
from redis_client import get_json, set_json
import hashlib

load_dotenv()

# Paths & configs
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "./embeddings.npy")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index.bin")
PRODUCT_IDS_PATH = os.getenv("PRODUCT_IDS_PATH", "./product_ids.json")
PRODUCTS_CSV = os.getenv("PRODUCTS_CSV", "../data/products_curated_v3_with_brands.csv")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TOP_K_DEFAULT = int(os.getenv("TOP_K", "10"))

# Redis TTLs
EXPLAIN_TTL = int(os.getenv("EXPLAIN_TTL", "86400"))   # 24 hours
RECOMMEND_TTL = int(os.getenv("RECOMMEND_TTL", "300")) # 5 minutes

app = FastAPI(title="ShopSense Recommender")

# Load products into memory
products_df = load_products(PRODUCTS_CSV)
product_lookup = {str(r['product_id']): r.to_dict() for _, r in products_df.iterrows()}

# Load FAISS index + embeddings + product IDs
if os.path.exists(EMBEDDINGS_PATH) and os.path.exists(FAISS_INDEX_PATH) and os.path.exists(PRODUCT_IDS_PATH):
    embeddings = np.load(EMBEDDINGS_PATH)
    index = faiss.read_index(FAISS_INDEX_PATH)
    with open(PRODUCT_IDS_PATH, "r") as f:
        PRODUCT_IDS = json.load(f)
else:
    embeddings = None
    index = None
    PRODUCT_IDS = []


# -------------------------------------
# Helpers
# -------------------------------------

def vector_search(query_embedding: np.ndarray, top_k: int = 10):
    """FAISS vector search."""
    if index is None:
        raise HTTPException(status_code=500, detail="FAISS index not loaded")

    q = query_embedding.astype('float32')
    faiss.normalize_L2(q)
    D, I = index.search(q, top_k)
    return D, I


def compute_user_vector_from_events(events: List[dict], _model_unused=None):
    """Weighted aggregation of embeddings from user events."""
    weights = {'view':1.0, 'click':3.0, 'add_to_cart':5.0, 'purchase':10.0}
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

    user_vec = sum(vecs) / max(1.0, total_w)

    # normalize
    norm = np.linalg.norm(user_vec)
    if norm != 0:
        user_vec /= norm

    return user_vec.reshape(1, -1)


def events_hash(events):
    """Stable hash for event list to use in cache keys."""
    try:
        s = json.dumps(events, sort_keys=True)
        return hashlib.sha1(s.encode()).hexdigest()[:12]
    except:
        return "nohash"


# -------------------------------------
# LLM Explanation
# -------------------------------------

def template_explain(user_id: str, product: dict, events_summary: List[dict]):
    """Fallback explanation logic."""
    cat_counts = {}
    for ev in events_summary:
        pid = ev.get("product_id")
        p = product_lookup.get(str(pid))
        if not p:
            continue

        cat = p.get("normalized_top_category", "")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    if cat_counts:
        top_cat = max(cat_counts, key=cat_counts.get)
        base = f"You recently viewed {cat_counts[top_cat]} items from {top_cat}. This product matches that interest."
    else:
        base = "This product aligns with your browsing behavior."

    brand = product.get("brand") or ""
    price = product.get("price")
    suffix = f" It is a {brand} product priced at ₹{price}." if brand else f" Price: ₹{price}."
    return base + suffix


def call_openai_explain(user_id: str, product: dict, events_summary: List[dict]):
    """Wrapper for OpenAI or fallback template."""
    if not OPENAI_API_KEY:
        return {"text": template_explain(user_id, product, events_summary), "source": "template"}

    openai.api_key = OPENAI_API_KEY

    context = [f"{ev.get('event_type')}:{ev.get('product_id')}" for ev in events_summary[-6:]]
    prompt = f"""
User recent events: {context}

Product:
Title: {product.get('title')}
Brand: {product.get('brand')}
Category: {product.get('normalized_top_category')}
Price: {product.get('price')}

Write a short explanation (1–2 sentences) of why this product is recommended.
"""

    try:
        resp = openai.ChatCompletion.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.2
        )
        text = resp["choices"][0]["message"]["content"].strip()
        return {"text": text, "source": "openai"}
    except Exception as e:
        return {"text": template_explain(user_id, product, events_summary), "source": "template", "error": str(e)}


# -------------------------------------
# Endpoints
# -------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "index_loaded": index is not None,
        "n_products": len(PRODUCT_IDS)
    }


@app.post("/admin/build")
def admin_build():
    from build_embeddings import build
    build()
    return {"status": "rebuilt"}


# ----------- Cached Recommend -----------

@app.get("/recommend")
def recommend(
    user_id: str = Query(...),
    k: int = TOP_K_DEFAULT,
    filter_category: Optional[str] = None,
    recent_events: Optional[str] = None
):
    # Parse recent events
    try:
        events = json.loads(recent_events) if recent_events else []
    except:
        events = []

    # Make cache key
    evhash = events_hash(events)
    fcat = filter_category or "all"
    cache_key = f"recommend:{user_id}:{evhash}:{fcat}:k{k}"

    # Check Redis cache
    cached = get_json(cache_key)
    if cached:
        return {"user_id": user_id, "results": cached, "cached": True}

    # Build user vector (cold-start = mean embedding)
    if events:
        user_vec = compute_user_vector_from_events(events, None)
    else:
        user_vec = np.mean(embeddings, axis=0).reshape(1, -1)
        faiss.normalize_L2(user_vec)

    # FAISS search (retrieve more to allow filtering)
    D, I = vector_search(user_vec, top_k=max(k * 3, 50))

    results = []
    for sim_row, idx_row in zip(D.tolist(), I.tolist()):
        for sim, idx in zip(sim_row, idx_row):
            pid = PRODUCT_IDS[idx]
            prod = product_lookup.get(pid)

            if filter_category:
                if prod.get("normalized_top_category") != filter_category:
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

    # Cache result
    set_json(cache_key, results, ex=RECOMMEND_TTL)

    return {"user_id": user_id, "results": results, "cached": False}


# ----------- Cached Explain -----------

@app.get("/explain")
def explain(
    user_id: str = Query(...),
    product_id: str = Query(...),
    recent_events: Optional[str] = None
):
    if product_id not in product_lookup:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_lookup[product_id]

    try:
        events = json.loads(recent_events) if recent_events else []
    except:
        events = []

    evhash = events_hash(events)
    cache_key = f"explain:{user_id}:{product_id}:{evhash}"

    # Check Redis cache
    cached = get_json(cache_key)
    if cached:
        return {"product_id": product_id, "explanation": cached, "cached": True}

    # Generate explanation
    resp = call_openai_explain(user_id, product, events)

    # Cache it
    set_json(cache_key, resp, ex=EXPLAIN_TTL)

    return {"product_id": product_id, "explanation": resp, "cached": False}


# -------------------------------------
# Start server
# -------------------------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
