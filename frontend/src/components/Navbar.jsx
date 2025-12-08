import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Brain } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getGuestId } from "../utils/guest";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-indigo-600">
          ShopSense
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/catalog"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            Catalog
          </Link>
          <Link
            to="/orders"
            className="text-sm text-gray-700 hover:text-indigo-600"
          >
            Orders
          </Link>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative rounded-full p-1.5 text-gray-700 hover:bg-gray-100"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              title="Logout"
            >
              <User className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 rounded hover:bg-gray-100"
              title="Login"
            >
              <User />
            </Link>
          )}
          <button
            onClick={() => {
              if (!user) getGuestId();
            }}
            className="ml-2 bg-indigo-600 text-white p-2 rounded-full shadow"
          >
            <Brain />
          </button>
        </div>
      </div>
    </nav>
  );
}
