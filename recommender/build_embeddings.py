#!/usr/bin/env python3
import os
import json
import numpy as np
import faiss
from utils import load_products, compute_embeddings, save_embeddings
from dotenv import load_dotenv
load_dotenv()

EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "./embeddings.npy")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index.bin")
PRODUCT_IDS_PATH = os.getenv("PRODUCT_IDS_PATH", "./product_ids.json")

def build():
    print("Loading products...")
    df = load_products()
    texts = (df['title'].fillna('') + '. ' + df['description'].fillna('') + '. Brand: ' + df['brand'].fillna('')).tolist()
    product_ids = df['product_id'].astype(str).tolist()

    print(f"Computing embeddings for {len(texts)} products with MiniLM...")
    embeddings = compute_embeddings(texts)

    print("Saving embeddings and ids...")
    save_embeddings(embeddings, product_ids, EMBEDDINGS_PATH, PRODUCT_IDS_PATH)

    # Build FAISS index (IndexFlatIP for cosine if we normalize)
    print("Building FAISS index (IndexFlatIP)...")
    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d)
    # normalize embeddings to unit length for cosine similarity with inner product
    faiss.normalize_L2(embeddings)
    index.add(embeddings.astype('float32'))
    faiss.write_index(index, FAISS_INDEX_PATH)
    print("FAISS index saved to:", FAISS_INDEX_PATH)
    print("Done.")

if __name__ == "__main__":
    build()
