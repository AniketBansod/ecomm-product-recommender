import os
import json
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDINGS_PATH = os.getenv("EMBEDDINGS_PATH", "./embeddings.npy")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", "./faiss_index.bin")
PRODUCT_IDS_PATH = os.getenv("PRODUCT_IDS_PATH", "./product_ids.json")
PRODUCTS_CSV = os.getenv("PRODUCTS_CSV", "../data/products_curated_v3_with_brands.csv")
TOP_K = int(os.getenv("TOP_K", "10"))

def load_products(csv_path=PRODUCTS_CSV):
    df = pd.read_csv(csv_path)
    # ensure product_id column exists and is string
    df['product_id'] = df['product_id'].astype(str)
    return df

def compute_embeddings(texts, model_name=MODEL_NAME):
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    return embeddings

def save_embeddings(embeddings, product_ids, embeddings_path=EMBEDDINGS_PATH, ids_path=PRODUCT_IDS_PATH):
    np.save(embeddings_path, embeddings)
    with open(ids_path, "w") as f:
        json.dump(product_ids, f)

def load_embeddings(embeddings_path=EMBEDDINGS_PATH, ids_path=PRODUCT_IDS_PATH):
    emb = np.load(embeddings_path)
    with open(ids_path, "r") as f:
        ids = json.load(f)
    return emb, ids
