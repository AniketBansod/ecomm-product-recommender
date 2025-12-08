import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

export default function App() {
  const { user } = useAuth();

  // -------- AI Recommendation Widget State --------
  const [aiOpen, setAiOpen] = useState(false);
  const [loadingReco, setLoadingReco] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // -------- Explanation Modal State --------
  const [explainOpen, setExplainOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [explainText, setExplainText] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  // -------- Load AI Recommendations --------
  async function loadRecommendations() {
    setLoadingReco(true);
    const uid = user?.user_id || getGuestId();

    try {
      const res = await apiGet(`/recommend?session_id=${uid}&k=6`);
      setRecommendations(res.recommended_products || []);
    } catch (err) {
      console.log("AI Widget Error:", err);
    }

    setLoadingReco(false);
  }

  function openAI() {
    setAiOpen(true);
    loadRecommendations();
  }

  function closeAI() {
    setAiOpen(false);
  }

  // -------- Load Explanation (LLM) --------
  async function loadExplanation(product) {
    setExplainLoading(true);

    const uid = user?.user_id || getGuestId();

    try {
      const res = await apiGet(
        `/explain?session_id=${uid}&product_id=${product.product_id}`
      );

      setExplainText(res.explanation || "No explanation available.");
    } catch (err) {
      console.log("Explain API Error:", err);
      setExplainText("Unable to load explanation.");
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

        {loadingReco ? (
          <p className="text-gray-600">Finding smart suggestions...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {recommendations.map((item) => (
              <div
                key={item.product_id}
                className="border p-3 rounded-lg hover:shadow cursor-pointer flex flex-col"
              >
                <img
                  src={item.image_url}
                  className="h-32 w-full object-cover rounded"
                  alt={item.title}
                />
                <p className="mt-2 font-semibold text-sm">{item.title}</p>
                <p className="text-indigo-600 font-bold text-sm">₹ {item.price}</p>

                <button
                  onClick={() => openExplain(item)}
                  className="mt-2 text-xs text-indigo-600 underline hover:text-indigo-800"
                >
                  Why this recommendation?
                </button>
              </div>
            ))}
          </div>
        )}
      </AIModal>

      {/* ------- AI Explanation Modal ------- */}
      <AIModal isOpen={explainOpen} onClose={closeExplain}>
        <h2 className="text-xl font-semibold mb-2">Why this recommendation?</h2>

        {selectedProduct && (
          <div className="mb-4">
            <p className="font-semibold">{selectedProduct.title}</p>
            <p className="text-indigo-600 font-bold">₹ {selectedProduct.price}</p>
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
