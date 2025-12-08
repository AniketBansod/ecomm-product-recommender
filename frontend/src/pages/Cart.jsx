import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { apiGet } from "../utils/api";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

  const items = Array.isArray(cart) ? cart : [];
  const [details, setDetails] = useState({});

  // Subtotal computed from available item price or hydrated details
  const subtotal = items.reduce((sum, item) => {
    const pid = item.product_id;
    const dPrice = details[pid]?.price ?? 0;
    const unit = Number(item.price ?? dPrice ?? 0);
    const qty = Number(item.quantity) || 0;
    return sum + unit * qty;
  }, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const grandTotal = subtotal + shipping;

  useEffect(() => {
    let cancelled = false;
    async function hydrateMissing() {
      const toFetch = items
        .filter((i) => !details[i.product_id])
        .map((i) => i.product_id);
      for (const pid of toFetch) {
        try {
          const res = await apiGet(`/products/${pid}`);
          if (!cancelled) {
            setDetails((d) => ({ ...d, [pid]: res || {} }));
          }
        } catch (_) {
          if (!cancelled) {
            setDetails((d) => ({ ...d, [pid]: {} }));
          }
        }
      }
    }
    hydrateMissing();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.product_id).join(",")]);

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid place-items-center">
          <div className="max-w-md text-center">
            <img
              src="/empty-cart.png"
              alt="Empty cart"
              className="mx-auto mb-4 h-28 w-28 object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== "/placeholder.jpg") {
                  e.currentTarget.src = "/placeholder.jpg";
                }
              }}
            />
            <h2 className="text-xl font-semibold text-gray-800">
              Your cart is empty
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse categories and add items you love.
            </p>
            <Link
              to="/catalog"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      <p className="mt-1 text-sm text-gray-600">{items.length} item(s)</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const d = details[item.product_id] || {};
            const unitPrice = Number(item.price ?? d.price ?? 0);
            const qty = Number(item.quantity) || 0;
            const lineTotal = unitPrice * qty;
            const title =
              item.title || d.title || `Product #${item.product_id}`;
            const image = item.image_url || d.image_url || "/placeholder.jpg";
            const brand = item.brand || d.brand;
            const shortDesc =
              (d.description || "").split(/\.|\n|•|;/).filter(Boolean)[0] || "";
            return (
              <div
                key={item.product_id}
                className="flex items-start gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-contain p-2"
                    onError={(e) => {
                      if (e.currentTarget.src !== "/placeholder.jpg") {
                        e.currentTarget.src = "/placeholder.jpg";
                      }
                    }}
                  />
                </div>
                <div className="flex grow items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {title}
                    </h3>
                    {brand && (
                      <p className="mt-1 text-xs text-gray-500">
                        Brand: {brand}
                      </p>
                    )}
                    {shortDesc && (
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                        {shortDesc}
                      </p>
                    )}
                    <div className="mt-3 inline-flex items-center rounded-lg ring-1 ring-gray-200">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                        onClick={() =>
                          updateQuantity?.(
                            item.product_id,
                            Math.max(1, (item.quantity || 1) - 1)
                          )
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity || 1}
                        onChange={(e) => {
                          const next = Math.max(1, Number(e.target.value) || 1);
                          updateQuantity?.(item.product_id, next);
                        }}
                        className="w-14 border-0 px-2 py-1.5 text-center outline-none"
                      />
                      <button
                        type="button"
                        className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                        onClick={() =>
                          updateQuantity?.(
                            item.product_id,
                            (item.quantity || 1) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹ {unitPrice.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Subtotal: ₹ {lineTotal.toFixed(2)}
                    </p>
                    <button
                      type="button"
                      className="mt-3 text-sm text-rose-600 hover:text-rose-700"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-2">
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 hover:border-rose-400"
              title="Remove all items from your cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2h.293l.853 10.24A2 2 0 007.14 18h5.72a2 2 0 001.994-1.76L15.707 6H16a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0010 2H9zm-1.707 6a1 1 0 112 0v7a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v7a1 1 0 11-2 0V8z"
                  clipRule="evenodd"
                />
              </svg>
              Clear cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Items</dt>
                  <dd className="text-gray-900">{items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="text-gray-900">₹ {subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="text-gray-900">₹ {shipping}</dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-gray-900">Total</dt>
                  <dd className="text-gray-900 font-bold">
                    ₹ {grandTotal.toFixed(2)}
                  </dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Proceed to Checkout
              </Link>
              <p className="mt-2 text-xs text-gray-500">
                • Free shipping over ₹499 • 7‑day returns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
