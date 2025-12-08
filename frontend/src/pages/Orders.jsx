import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGuestId } from "../utils/guest";
import { apiGet } from "../utils/api";
import { Link } from "react-router-dom";

export default function Orders() {
  const { user } = useAuth();
  const uid = user?.user_id || getGuestId();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiGet(`/order/${uid}`);
        setOrders(res || []);
      } catch (err) {
        console.error("Order fetch error:", err);
      }
      setLoading(false);
    }
    loadOrders();
  }, [uid]);

  if (loading)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid place-items-center">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
        <p className="mt-1 text-sm text-gray-600">
          Browse items and place your first order.
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Go to Catalog
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Orders</h1>
          <p className="mt-1 text-sm text-gray-600">{orders.length} order(s)</p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        {orders.map((order) => {
          const amount = Number(order.total_amount || 0).toFixed(2);
          return (
            <div
              key={order._id}
              className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Order</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    <span className="text-indigo-600">{order._id}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">₹ {amount}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900">Items</h3>
                <ul className="mt-2 divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div className="truncate">
                        <span className="font-medium text-gray-900">
                          {item.product_id}
                        </span>
                        <span className="ml-2 text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="text-gray-900">
                        ₹ {Number(item.price || 0).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
