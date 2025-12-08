import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../utils/api";
import { getGuestId } from "../utils/guest";
import { logEvent } from "../utils/logEvent";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const user_id = user?.user_id || getGuestId();

  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const items = Array.isArray(cart) ? cart : [];
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  function updateField(field, value) {
    setAddress({ ...address, [field]: value });
  }

  async function placeOrder() {
    // basic validation
    if (!Array.isArray(cart) || cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (
      !address.full_name ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill in all required address fields.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Store order in backend
      const res = await apiPost("/order/place", {
        user_id,
        address,
        payment_mode: "COD",
        // Provide guest_id so backend can migrate cart if needed
        guest_id: getGuestId(),
      });

      // 2️⃣ Log PURCHASE event for each product
      for (let item of cart) {
        await logEvent("purchase", item.product_id, user);
      }

      // 3️⃣ Clear cart on success
      try {
        clearCart();
      } catch {}

      // 4️⃣ Redirect to orders page
      navigate("/orders");
    } catch (err) {
      console.log("Checkout error:", err);
      alert("Order failed, try again.");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <Link
          to="/cart"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Back to Cart
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Address form */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery Address
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              All fields marked * are required
            </p>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name *
                </span>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Rahul Sharma"
                  onChange={(e) => updateField("full_name", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Phone *
                </span>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="10-digit mobile number"
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </span>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="House no., street"
                  onChange={(e) => updateField("line1", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Address Line 2
                </span>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Area, landmark"
                  onChange={(e) => updateField("line2", e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">
                    City *
                  </span>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="City"
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">
                    State *
                  </span>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="State"
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">
                  Pincode *
                </span>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="6-digit pincode"
                  onChange={(e) => updateField("pincode", e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-4 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
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
                    ₹ {total.toFixed(2)}
                  </dd>
                </div>
              </dl>
              <button
                onClick={placeOrder}
                disabled={loading}
                className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  loading
                    ? "bg-indigo-400 text-white cursor-wait"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
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
