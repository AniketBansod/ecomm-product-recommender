import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiGet } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { logEvent } from "../utils/logEvent";
import {
  CATEGORIES,
  CATEGORY_IMAGE_URLS,
  toCanonicalCategory,
} from "../utils/categories";
// Build local public image path matching user's filenames
function getCategoryImagePath(key) {
  if (key === "Footwear") return "/footwear.jpg";
  if (key === "Mobiles & Accessories") return "/mobile & accessories.jpg";
  if (key === "Computers") return "/computer.jpg";
  // default to util map or a name-based guess
  const fromUtil = CATEGORY_IMAGE_URLS[key];
  if (fromUtil) return fromUtil;
  return `/${key}.jpg`;
}

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 24; // show enough products per page like popular e-commerce sites
  const location = useLocation();

  const { user } = useAuth();

  // Category source for the UI (centralized)
  const categories = useMemo(() => CATEGORIES, []);

  // Parse selected category from URL
  const selectedCategory = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return search.get("category");
  }, [location.search]);

  // Reset pagination when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    (async () => {
      setError("");
      // When no category selected, show the category gallery first
      const rawCategory = selectedCategory;
      if (!rawCategory) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Map UI-facing category names to canonical DB names
        const category = toCanonicalCategory(rawCategory);
        const path = `/products?category=${encodeURIComponent(
          category
        )}&page=${page}&limit=${LIMIT}`;
        const data = await apiGet(path);
        const list = Array.isArray(data) ? data : data?.products || [];
        setProducts(list);
      } catch (err) {
        const backendMsg =
          (err && (err.message || err.error || err.msg)) ||
          (err &&
            err.response &&
            (err.response.data?.message || err.response.data?.error));
        setError(backendMsg || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCategory, page]);
  if (loading) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Categories gallery */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Browse Categories
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Pick a category to explore products.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                to={`/catalog?category=${encodeURIComponent(c.key)}`}
                className={`group relative overflow-hidden rounded-2xl shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedCategory === c.key
                    ? "ring-indigo-300"
                    : "ring-gray-200"
                }`}
                onClick={() => logEvent("select_category", c.key, user)}
              >
                <div className="relative h-32 w-full sm:h-36">
                  <img
                    src={getCategoryImagePath(c.key)}
                    alt={c.key}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a generic local placeholder if specific category image missing
                      if (e.currentTarget.src !== "/placeholder.jpg") {
                        e.currentTarget.src = "/placeholder.jpg";
                      }
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-base backdrop-blur">
                    {c.icon}
                  </span>
                  <div className="truncate">
                    <p className="truncate text-sm font-semibold text-white drop-shadow">
                      {c.key}
                    </p>
                    <p className="text-[11px] text-white/90">
                      Tap to view items
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Show results only when a category is selected */}
        {selectedCategory && (
          <>
            {/* Header + Clear filter */}
            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Results for{" "}
                <span className="text-indigo-600">{selectedCategory}</span>
              </h2>
              <Link
                to="/catalog"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear filter
              </Link>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {products.length === 0 && !error ? (
              <div className="mt-10 grid place-items-center">
                <div className="max-w-md text-center">
                  <p className="text-lg font-medium text-gray-800">
                    No products found
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Try a different category or clear filters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => {
                  const fallbackImg = selectedCategory
                    ? CATEGORY_IMAGE_URLS[selectedCategory] ||
                      "/placeholder.jpg"
                    : "/placeholder.jpg";
                  return (
                    <Link
                      key={p.product_id}
                      to={`/product/${p.product_id}`}
                      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => logEvent("click", p.product_id, user)}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={p.image_url}
                          alt={p.title}
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.src !== fallbackImg) {
                              e.currentTarget.src = fallbackImg;
                            }
                          }}
                          className="h-full w-full object-contain p-3 transition group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                          {p.title}
                        </h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-indigo-600">
                            ₹{p.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            {p.brand || ""}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
                Page {page}
              </span>
              <button
                disabled={products.length < LIMIT}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
