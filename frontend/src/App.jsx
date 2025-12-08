import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import AIWidget from "./components/AIWidget";
import AIModal from "./components/AIModal";

// Pages
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Utils
import { apiGet } from "./utils/api";
import { useAuth } from "./context/AuthContext";
import { getGuestId } from "./utils/guest";
import { CATEGORIES } from "./utils/categories";

export default function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // -------- AI Recommendation Widget State --------
  const [aiOpen, setAiOpen] = useState(false);
  const [loadingReco, setLoadingReco] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // -------- Explanation Modal State --------
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [explainText, setExplainText] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [sessionPromptOpen, setSessionPromptOpen] = useState(false);

  // -------- Load AI Recommendations --------
  async function loadRecommendations(params = {}) {
    setLoadingReco(true);
    const uid = user?.user_id || getGuestId();

    try {
      const qs = new URLSearchParams({ session_id: uid, k: 6 });
      if (params.filter_category)
        qs.set("filter_category", params.filter_category);
      if (params.min_price !== undefined && params.min_price !== "")
        qs.set("min_price", params.min_price);
      if (params.max_price !== undefined && params.max_price !== "")
        qs.set("max_price", params.max_price);

      const res = await apiGet(`/recommend?${qs.toString()}`);
      setRecommendations(res.recommended_products || []);
    } catch (err) {
      console.log("AI Widget Error:", err);
    }

    setLoadingReco(false);
  }

  // -------- Open/Close AI Recommendations Modal --------
  function openAI() {
    // If logged in, proceed; else require explicit guest opt-in
    const loggedInId = user?.user_id;
    const guestOptIn = (() => {
      try {
        return localStorage.getItem("guest_opt_in") === "1";
      } catch {
        return false;
      }
    })();

    if (!loggedInId && !guestOptIn) {
      setSessionPromptOpen(true);
      return;
    }

    // Ensure guest id exists when opted-in
    const uid = loggedInId || getGuestId();
    if (!uid) return; // should not happen

    setAiOpen(true);
    // Try to read previously applied filters
    let params = {};
    try {
      const saved = localStorage.getItem("aiFilters");
      if (saved) {
        params = JSON.parse(saved) || {};
        // hydrate local state so UI shows saved filters
        setFilterCategory(params.filter_category || "");
        setMinPrice(params.min_price ?? "");
        setMaxPrice(params.max_price ?? "");
      }
    } catch {}
    loadRecommendations(params);
  }

  function closeAI() {
    setAiOpen(false);
  }

  // -------- Load Explanation for a Selected Product --------
  async function loadExplanation(product) {
    setExplainLoading(true);
    setExplainText("");
    const uid = user?.user_id || getGuestId();
    if (!uid) {
      setExplainLoading(false);
      alert("Please login or continue as guest to view explanations.");
      return;
    }

    try {
      const params = new URLSearchParams({
        session_id: uid,
        product_id: product?.product_id || "",
      });

      // include filters if present (from current state or saved localStorage)
      const filterParams = {
        filter_category: filterCategory || undefined,
        min_price: minPrice !== "" ? minPrice : undefined,
        max_price: maxPrice !== "" ? maxPrice : undefined,
      };
      if (filterParams.filter_category)
        params.set("filter_category", filterParams.filter_category);
      if (filterParams.min_price !== undefined)
        params.set("min_price", String(filterParams.min_price));
      if (filterParams.max_price !== undefined)
        params.set("max_price", String(filterParams.max_price));

      const res = await apiGet(`/explain?${params.toString()}`);
      setExplainText(
        res.explanation || "Couldn't generate an explanation right now."
      );
    } catch (err) {
      console.log("Explain Error:", err);
      setExplainText(
        "We couldn't fetch a detailed explanation right now. Please try again later."
      );
    }

    setExplainLoading(false);
  }

  function openExplain(product) {
    setSelectedProduct(product);
    setExplainOpen(true);
    loadExplanation(product);
  }

  function closeExplain() {
    setExplainOpen(false);
    setSelectedProduct(null);
    setExplainText("");
  }

  // ----------------------------------------------------
  //                     RENDER UI
  // ----------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 max-w-6xl mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Unknown paths → redirect home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ------- AI Floating Button ------- */}
      <AIWidget onOpen={openAI} />

      {/* ------- AI Recommendation Modal ------- */}
      <AIModal isOpen={aiOpen} onClose={closeAI}>
        <h2 className="text-2xl font-semibold mb-4">AI Recommendations</h2>

        {/* Content container with scroll on large screens */}
        <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Refine section */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Refine Recommendations
              </h3>
              <span className="text-[11px] text-gray-500">
                Personalize by category and price
              </span>
            </div>
            <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Category</span>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Any</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.key}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Min price</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="e.g. 100"
                />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Max price</span>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 1000"
                />
              </label>
              <div className="flex gap-2 md:justify-end">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onClick={() => {
                    const params = {
                      filter_category: filterCategory || undefined,
                      min_price: minPrice !== "" ? minPrice : undefined,
                      max_price: maxPrice !== "" ? maxPrice : undefined,
                    };
                    try {
                      localStorage.setItem("aiFilters", JSON.stringify(params));
                    } catch {}
                    loadRecommendations(params);
                  }}
                >
                  Apply
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  onClick={() => {
                    setFilterCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    try {
                      localStorage.removeItem("aiFilters");
                    } catch {}
                    loadRecommendations();
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loadingReco ? (
            <p className="text-gray-600 mt-3">Finding smart suggestions...</p>
          ) : recommendations.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
              <p className="text-sm text-gray-700">No recommendations yet.</p>
              <p className="mt-1 text-xs text-gray-500">
                Browse and interact with products to see tailored picks here.
              </p>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
              {recommendations.map((item) => {
                const price = Number(item.price || 0);
                const matchesCategory =
                  filterCategory &&
                  item.normalized_top_category === filterCategory;
                const matchesPrice =
                  (minPrice !== "" && price >= Number(minPrice)) ||
                  (maxPrice !== "" && price <= Number(maxPrice));
                const showBadge =
                  !!filterCategory || minPrice !== "" || maxPrice !== "";
                return (
                  <a
                    key={item.product_id}
                    href={`/product/${item.product_id}`}
                    className="group overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm hover:shadow-md transition flex flex-col"
                    onClick={(e) => {
                      // allow navigation; optionally log click
                      try {
                        // lazy import to avoid top-level import churn
                        const { logEvent } = require("./utils/logEvent");
                        logEvent("click", item.product_id, user);
                      } catch (_) {}
                    }}
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={item.image_url}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">
                          {item.title}
                        </p>
                        {showBadge && (matchesCategory || matchesPrice) && (
                          <span className="text-[10px] rounded-full bg-green-100 text-green-700 px-2 py-0.5 whitespace-nowrap">
                            Matched filter
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-indigo-600 font-semibold">
                          ₹ {price.toLocaleString()}
                        </p>
                        {item.brand && (
                          <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                            {item.brand}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(ev) => {
                          // Prevent navigation for explanation click
                          ev.preventDefault();
                          openExplain(item);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 self-start"
                      >
                        Why this recommendation?
                      </button>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </AIModal>

      {/* ------- Session Prompt Modal ------- */}
      <AIModal
        isOpen={sessionPromptOpen}
        onClose={() => setSessionPromptOpen(false)}
      >
        <h2 className="text-xl font-semibold mb-3">Continue to AI Assistant</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to continue. Guest mode keeps recommendations
          bound to this browser session only.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            onClick={() => {
              try {
                localStorage.setItem("guest_opt_in", "1");
              } catch {}
              // create/ensure guest id then open AI
              getGuestId();
              setSessionPromptOpen(false);
              openAI();
            }}
          >
            Continue as Guest
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            onClick={() => {
              setSessionPromptOpen(false);
              navigate("/login");
            }}
          >
            Login
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            onClick={() => {
              setSessionPromptOpen(false);
              navigate("/signup");
            }}
          >
            Signup
          </button>
        </div>
      </AIModal>

      {/* ------- AI Explanation Modal ------- */}
      <AIModal isOpen={explainOpen} onClose={closeExplain}>
        <h2 className="text-xl font-semibold mb-2">Why this recommendation?</h2>

        {selectedProduct && (
          <div className="mb-4">
            <p className="font-semibold">{selectedProduct.title}</p>
            <p className="text-indigo-600 font-bold">
              ₹ {selectedProduct.price}
            </p>
          </div>
        )}

        {explainLoading ? (
          <p className="text-gray-600">Analyzing your activity...</p>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{explainText}</p>
        )}
      </AIModal>
    </div>
  );
}
