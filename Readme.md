# Ecomm Product Recommender (AI Powered)

A hybrid e-commerce recommendation engine with:

- Vector embeddings (MiniLM)
- Behavior-based scoring
- LLM explanations (GPT-4o Mini )
- Node.js backend + FastAPI recommender microservice
- React + Tailwind frontend

# AI-Powered E-Commerce Product Recommendation System (ShopSense)

Deliver personalized product discovery with a hybrid AI recommender and concise LLM explanations. ShopSense pairs real-time behavioral signals with vector search over product embeddings, applies strict user filters, and explains “why” for each suggestion. Built with React, Node.js/Express, and a FastAPI microservice powered by FAISS and sentence-transformers.

---

## 1. Project Overview

Modern shoppers expect relevant, timely recommendations aligned with their browsing. ShopSense delivers:

- Hybrid recommendations: recent activity (views, clicks, add-to-cart, purchases) + user-input filters (category and price range)
- AI explanations: GPT-4o Mini produces short, human-friendly reasons for each suggestion

What it does:

- Logs events in real time (view/click/add_to_cart/purchase)
- Builds a weighted session vector and queries FAISS over product embeddings
- Applies strict category/price filters to candidates
- Returns recommendations with per-item explanations
- Caches recommendations and explanations in Redis for speed and cost control

User experience benefits:

- Faster product discovery through relevant suggestions
- Transparent recommendations increase trust and engagement
- Clean, responsive UI with cart, checkout, and orders

Features:

- Hybrid recommendation engine (activity-based + filters)
- AI explanation engine powered by GPT-4o Mini
- Personalized product recommendations
- Product catalog browsing
- JWT authentication + guest mode
- Cart, Checkout, Orders
- Event logging (views, clicks, add_to_cart, purchase)
- Redis caching (recommendations + explanations)
- FastAPI microservice (embeddings + vector search)
- Node.js backend for business logic
- React + Tailwind frontend

---

## 2. Live Demo

- **Loom Demo Video:** https://www.loom.com/share/2ddf83c8d439477fb0ab6aa42dce550e
- **Google Drive Demo Video:** https://drive.google.com/file/d/1UunM5QqlHNOjVS2pWY7N-jokGzyUClRa/view?usp=sharing
- **Live Website:** https://ecomm-product-recommender-exq7.vercel.app/

---

## 3. Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- Context API

### Backend (Business Logic)

- Node.js + Express
- MongoDB Atlas
- Redis Cloud

### Recommender Engine (Microservice)

- FastAPI
- FAISS Vector Search
- MiniLM sentence-transformer
- GPT-4o Mini for explanations

---

## 4. System Architecture Diagram

```
[React Frontend]
		↓  REST (Vite app → Node)
[Node.js Backend]
		↔  MongoDB (products, users, carts, orders, events)
		↔  Redis (caching: recommendations + explanations)
		↔  FastAPI Recommender (/recommend, /explain, /health)

[FastAPI Recommender]
		↔  FAISS Index + Embeddings (product_ids.json, embeddings.npy, faiss_index.bin)
		↔  Products CSV (metadata normalization)
		↔  OpenAI GPT-4o Mini (optional explanations)
```

---

## 5. Features

- User Sign Up / Login / JWT Auth
- Guest mode tracking
- Product catalog
- Product detail page
- Add to cart
- Checkout + order placement
- Order history
- AI Recommendations
- AI Explanations
- AI Chat widget (optional)
- Event logging (click, view, cart, purchase)
- Redis caching

---

## 6. Installation Instructions

### Clone repo

```bash
git clone https://github.com/AniketBansod/ecomm-product-recommender.git
cd ecomm-product-recommender
```

### Prerequisites

- Node.js 18+
- Python 3.10–3.12 (for FAISS compatibility)
- MongoDB Atlas account
- Redis Cloud (or local Redis)
- OpenAI API key (optional for explanations)

### Environment Setup

Create the following `.env` files (examples included in each service directory):

- `backend/.env`

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<random-secret>
CORS_ORIGIN=<your-frontend-origin>
RECOMMENDER_API_URL=<https://your-recommender-url>
REDIS_URL=<your-redis-connection-url>
```

- `frontend/.env`

```
VITE_API_BASE=<https://your-backend-url>/api
```

- `recommender/.env`

```
NODE_BACKEND_URL=<https://your-backend-url>
FRONTEND_ORIGIN=<https://your-frontend-origin>
OPENAI_API_KEY=<optional-openai-key>
OPENAI_MODEL=gpt-4o-mini
EMBEDDINGS_PATH=./embeddings.npy
FAISS_INDEX_PATH=./faiss_index.bin
PRODUCT_IDS_PATH=./product_ids.json
PRODUCTS_CSV=../data/products_curated_v3_with_brands.csv
```

---

## 7. Running Locally (Windows PowerShell)

Open three terminals and run each service.

### 1) Backend (Node.js)

```powershell
Push-Location "./backend"; npm install; npm run dev; Pop-Location
```

Default dev port: `http://localhost:5000` (routes under `/api`).

### 2) Recommender (FastAPI)

```powershell
Push-Location "./recommender";
python -m venv .venv;
.\.venv\Scripts\Activate.ps1;
pip install -r requirements.txt;
python main.py;
Pop-Location
```

Default dev port: `http://localhost:8000`.

Notes:

- On first run, if `faiss_index.bin` is missing but `embeddings.npy` and `product_ids.json` exist, the service auto-builds the FAISS index.
- To rebuild embeddings manually: `curl -X POST http://localhost:8000/admin/build`

### 3) Frontend (Vite)

```powershell
Push-Location "./frontend"; npm install; npm run dev; Pop-Location
```

Default dev port: `http://localhost:5173`.

---

## 8. Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render (Web Service)
- Recommender: Render (Web Service)
- MongoDB Atlas, Redis Cloud

Important Render settings:

- Backend `Environment Variables`:
  - `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `RECOMMENDER_API_URL`, `REDIS_URL`
- Recommender `Environment Variables`:
  - `NODE_BACKEND_URL`, `FRONTEND_ORIGIN`, `OPENAI_API_KEY` (optional), `OPENAI_MODEL`
- Recommender `Start Command`: `python main.py` (service listens on `$PORT` automatically)

Health checks:

- Recommender: `GET /health` → returns `faiss_loaded` and `total_products`

---

## 9. API Overview

### Backend (selected routes)

- `GET /api/products` — list with pagination and category
- `GET /api/products/:id` — product detail
- `POST /api/auth/signup` / `POST /api/auth/login` — JWT auth
- `GET /api/cart/:session_id` — session or user cart
- `POST /api/cart/add` — add item
- `POST /api/events` — log event
- `GET /api/recommend?session_id=...&k=6&filter_category=...&min_price=...&max_price=...`
  - Proxies to recommender `GET /recommend?user_id=...`

### Recommender

- `GET /health`
- `POST /admin/build` — rebuild embeddings + FAISS
- `GET /recommend?user_id=...&k=...&filter_category=...&min_price=...&max_price=...`
- `GET /explain?user_id=...&product_id=...`

---

## 10. Troubleshooting

- Recommendations show “browse more” or empty:
  - Ensure `RECOMMENDER_API_URL` is set on the backend and points to the recommender URL.
  - Check recommender health: `GET /health` → `faiss_loaded` should be `true`.
  - If `faiss_index.bin` is missing, the service now auto-builds it at startup; else call `/admin/build`.
- ECONNREFUSED to `127.0.0.1:8000` in backend logs:
  - Set `RECOMMENDER_API_URL` to your deployed recommender (`https://<service>.onrender.com`).
- CORS errors:
  - Backend `CORS_ORIGIN` and Recommender `FRONTEND_ORIGIN` must match your frontend domain.
- Build issues (FAISS / transformers):
  - Use Python 3.10–3.12, pin `faiss-cpu` and `huggingface_hub` versions per `requirements.txt`.

---

## 11. License

MIT License. See `LICENSE`.

---

## 12. Acknowledgements

- Sentence-Transformers (MiniLM)
- FAISS by Facebook AI Research
- FastAPI & Uvicorn
- React, Vite, Tailwind
- Render & Vercel for hosting
