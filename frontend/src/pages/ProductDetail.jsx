import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { getGuestId } from "../utils/guest";
import { useCart } from "../context/CartContext";
import { logEvent } from "../utils/logEvent"; // <-- NEW

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const [reco, setReco] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);

  // Heuristic description formatter to make long raw text more readable
  const parseDescription = (desc) => {
    if (!desc || typeof desc !== "string")
      return { highlights: [], specs: [], full: "" };
    const full = desc.trim();
    const specs = [];
    // Extract pairs like "Key: Value"
    const specRegex =
      /([A-Za-z][A-Za-z0-9\s\/&\-()]+):\s*([^:]+?)(?=(?:[A-Za-z][A-Za-z0-9\s\/&\-()]+:)|$)/g;
    let m;
    while ((m = specRegex.exec(full)) !== null) {
      const key = m[1].trim();
      const value = m[2].trim().replace(/[.,]$/, "");
      if (key && value) specs.push({ key, value });
    }
    // Create short bullet highlights by splitting on punctuation
    const normalized = full.replace(/\s+/g, " ");
    const candidates = normalized
      .split(/(?:\.|•|;|,)(?:\s+|$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3 && s.length < 220);
    const seen = new Set();
    const highlights = [];
    for (const c of candidates) {
      const key = c.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        highlights.push(c);
      }
      if (highlights.length >= 8) break;
    }
    return { highlights, specs, full };
  };

  // ------------------------------
  // Load Product + Log "view" event
  // ------------------------------
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet(`/products/${id}`);
        setProduct(res);

        // Log VIEW event
        logEvent("view", id, user);
      } catch (err) {
        console.log("Error loading product:", err);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id, user]);

  // ------------------------------
  // Load AI Similar Recommendations
  // ------------------------------
  async function getRecommendations() {
    setRecoLoading(true);
    try {
      const uid = user?.user_id || getGuestId();

      // Use unified recommend API
      const res = await apiGet(`/recommend?session_id=${uid}&k=6`);
      setReco(res.recommended_products || []);
    } catch (err) {
      console.log("Recommendation error:", err);
    }
    setRecoLoading(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-64 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <Link to="/catalog" className="hover:text-gray-700">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 line-clamp-1 align-middle">
          {product.title}
        </span>
      </div>

      {/* Product layout */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="aspect-square w-full bg-gray-50">
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-contain p-6"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="md:col-span-5">
          <div className="sticky top-4 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h1 className="text-xl font-semibold text-gray-900">
                {product.title}
              </h1>
              {product.brand && (
                <p className="mt-1 text-sm text-gray-500">
                  Brand:{" "}
                  <span className="font-medium text-gray-700">
                    {product.brand}
                  </span>
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-indigo-600">
                  ₹ {product.price}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                  In stock
                </span>
              </div>
              {/* Structured description rendering */}
              {(() => {
                const { highlights, specs, full } = parseDescription(
                  product.description
                );
                return (
                  <div className="mt-4">
                    {highlights.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Highlights
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                          {highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {specs.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Specifications
                        </h3>
                        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          {(showAllSpecs ? specs : specs.slice(0, 10)).map(
                            (s, i) => (
                              <div
                                key={i}
                                className="flex justify-between gap-3"
                              >
                                <dt className="shrink-0 text-gray-500">
                                  {s.key}
                                </dt>
                                <dd className="text-gray-900">{s.value}</dd>
                              </div>
                            )
                          )}
                        </dl>
                        {specs.length > 10 && (
                          <button
                            type="button"
                            onClick={() => setShowAllSpecs((v) => !v)}
                            className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            {showAllSpecs
                              ? "Show less"
                              : `Show all ${specs.length} specs`}
                          </button>
                        )}
                      </div>
                    )}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        Full description
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                        {full}
                      </p>
                    </details>
                  </div>
                );
              })()}

              {/* Quantity */}
              <div className="mt-5 flex items-center gap-3">
                <label htmlFor="qty" className="text-sm text-gray-700">
                  Qty
                </label>
                <div className="flex items-center rounded-lg ring-1 ring-gray-200">
                  <button
                    type="button"
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-14 border-0 px-2 py-2 text-center outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    if (adding) return;
                    setAdding(true);
                    try {
                      addToCart(product.product_id, qty);
                      logEvent("add_to_cart", product.product_id, user);
                      setAddSuccess(true);
                      setTimeout(() => setAddSuccess(false), 1500);
                    } finally {
                      setTimeout(() => setAdding(false), 400);
                    }
                  }}
                  aria-busy={adding ? "true" : "false"}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    adding
                      ? "bg-indigo-400 text-white cursor-wait"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {adding ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          opacity="0.2"
                        />
                        <path
                          d="M22 12a10 10 0 0 0-10-10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  onClick={() => {
                    addToCart(product.product_id, qty);
                    logEvent("buy_now", product.product_id, user);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md"
                >
                  Buy Now
                </button>
              </div>

              {addSuccess && (
                <div className="pointer-events-none mt-3 flex items-center justify-center">
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 shadow ring-1 ring-emerald-100">
                    Item added to cart
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p>• Free shipping over ₹499 • 7‑day returns</p>
                <p>• Secure checkout • Cash on Delivery available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations header and trigger */}
      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Recommended for you
        </h2>
        <button
          onClick={getRecommendations}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition hover:shadow-md"
        >
          {recoLoading ? "Loading..." : "AI Suggest Similar"}
        </button>
      </div>

      <div className="mt-4">
        {reco.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
            Click “AI Suggest Similar” to load recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {reco.map((item) => (
              <Link
                key={item.product_id}
                to={`/product/${item.product_id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
                onClick={() => logEvent("click", item.product_id, user)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== "/placeholder.jpg") {
                        e.currentTarget.src = "/placeholder.jpg";
                      }
                    }}
                    className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-indigo-600">
                      ₹ {item.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.brand || ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
