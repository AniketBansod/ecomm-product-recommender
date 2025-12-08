import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../utils/api";
import { useAuth } from "./AuthContext";
import { getGuestId } from "../utils/guest";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = user?.user_id || getGuestId();

  // Load cart on startup
  useEffect(() => {
    async function loadCart() {
      try {
        const data = await apiGet(`/cart/${uid}`);
        setCart(data.items || []);
      } catch (err) {
        console.log("Cart fetch error:", err);
      }
      setLoading(false);
    }
    loadCart();
  }, [uid]);

  // Add item to cart
  async function addToCart(product_id, quantity = 1) {
    const res = await apiPost("/cart/add", {
      user_id: uid,
      product_id,
      quantity,
    });
    setCart(res.items);
  }

  // Remove item
  async function removeFromCart(product_id) {
    const res = await apiPost("/cart/remove", {
      user_id: uid,
      product_id,
    });
    setCart(res.items);
  }

  // Clear cart
  async function clearCart() {
    await apiDelete(`/cart/clear/${uid}`);
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
