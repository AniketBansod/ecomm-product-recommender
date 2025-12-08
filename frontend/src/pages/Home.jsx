import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const categories = [
    { key: "Clothing", icon: "👕", color: "from-pink-500 to-rose-500" },
    { key: "Footwear", icon: "👟", color: "from-indigo-500 to-blue-500" },
    {
      key: "Mobiles & Accessories",
      icon: "📱",
      color: "from-emerald-500 to-teal-500",
    },
    { key: "Computers", icon: "💻", color: "from-violet-500 to-fuchsia-500" },
    { key: "Beauty", icon: "💄", color: "from-orange-500 to-amber-500" },
    { key: "Watches", icon: "⌚", color: "from-sky-500 to-cyan-500" },
    { key: "Bags", icon: "👜", color: "from-lime-500 to-green-500" },
    { key: "Kitchen", icon: "🍳", color: "from-red-500 to-pink-500" },
  ];

  const featured = [
    {
      id: "p1",
      title: "Wireless Headphones",
      price: "$129",
      img: "/yearone-JpIH5qRzDN4-unsplash.jpg",
    },
    {
      id: "p2",
      title: "Smartwatch Series 7",
      price: "$199",
      img: "/v-a-tao-OxvlDO8RwKg-unsplash.jpg",
    },
    {
      id: "p3",
      title: "Men's Running Shoes",
      price: "$89",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "p4",
      title: "Laptop Pro 14",
      price: "$1299",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "p5",
      title: "Designer Handbag",
      price: "$249",
      img: "/joey-zhou-ypCiYjwzRKg-unsplash.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 opacity-30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose-300 to-orange-300 opacity-30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-600 shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Smart, personal, and private
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                ShopSense — Smarter Shopping. Powered by AI.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-gray-600">
                Discover products tailored to your style, behavior, and
                preferences.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Continue as Guest
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M13.293 5.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L16.586 12l-3.293-3.293a1 1 0 010-1.414z" />
                    <path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-gray-800 shadow-sm transition hover:shadow-md"
                >
                  Login / Signup
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto w-full max-w-md">
                <div className="rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-gray-100">
                  <div className="grid grid-cols-3 gap-3">
                    {featured.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
                      >
                        <img
                          src={p.img}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-4 py-3 text-sm shadow-xl ring-1 ring-gray-100">
                  AI-curated picks, refreshed daily
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Top Categories
          </h2>
          <button
            onClick={() => navigate("/catalog")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() =>
                navigate(`/catalog?category=${encodeURIComponent(c.key)}`)
              }
              className="group relative overflow-hidden rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`}
              />
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-xl">
                  <span>{c.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{c.key}</p>
                  <p className="text-sm text-gray-500">Shop premium picks</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Trending Now</h2>
          <button
            onClick={() => navigate("/catalog")}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Browse more
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div className="flex gap-6">
            {featured.map((p) => (
              <div
                key={p.id}
                className="min-w-[220px] max-w-[240px] rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">Featured Pick</p>
                  <p className="mt-1 font-medium text-gray-900">{p.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-indigo-600">
                      {p.price}
                    </span>
                    <button
                      onClick={() => navigate(`/catalog?highlight=${p.id}`)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Callout */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
          <div className="grid items-center gap-4 sm:grid-cols-5">
            <div className="sm:col-span-4">
              <h3 className="text-xl font-semibold">Try our AI Assistant</h3>
              <p className="mt-1 text-sm opacity-90">
                Get personalized suggestions instantly based on your browsing
                and preferences.
              </p>
            </div>
            <div className="sm:col-span-1">
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="w-full rounded-xl bg-white px-4 py-2 text-indigo-700 shadow-sm transition hover:bg-gray-50"
              >
                Open Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-gray-500 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {new Date().getFullYear()} ShopSense · All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/catalog" className="hover:text-gray-700">
                Catalog
              </Link>
              <Link to="/orders" className="hover:text-gray-700">
                Orders
              </Link>
              <Link to="/login" className="hover:text-gray-700">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Modal mount point: uses existing AIModal component if present */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="font-medium">ShopSense AI Assistant</p>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            {/* Fallback content if AIModal is not integrated */}
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Ask for product suggestions, styles, or budgets. Integrate with
                your existing `AIModal` for full functionality.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
