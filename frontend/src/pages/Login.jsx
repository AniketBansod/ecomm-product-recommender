import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await apiPost("/auth/login", { email, password });

      // Backend returns { token, user: { id, name, email } }
      loginUser({
        token: res.token,
        user_id: res.user?.id,
        id: res.user?.id,
        name: res.user?.name,
        email: res.user?.email,
      });

      navigate("/catalog");
    } catch (err) {
      // Prefer backend-provided message when available; fallback to common cases
      const backendMsg =
        (err && (err.message || err.error || err.msg)) ||
        (err &&
          err.response &&
          (err.response.data?.message || err.response.data?.error)) ||
        (err && err.data && (err.data.message || err.data.error));

      if (backendMsg) {
        setError(backendMsg);
      } else if (!navigator.onLine) {
        setError("You are offline. Please check your internet connection.");
      } else {
        setError("Login failed. Please verify your email and password.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Decorative panel */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white shadow-xl">
              <h1 className="text-3xl font-bold">Welcome back to ShopSense</h1>
              <p className="mt-2 text-sm opacity-90">
                Sign in to access saved carts and personalized picks.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  "/yearone-JpIH5qRzDN4-unsplash.jpg",
                  "/v-a-tao-OxvlDO8RwKg-unsplash.jpg",
                  "/joey-zhou-ypCiYjwzRKg-unsplash.jpg",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20"
                  >
                    <img
                      src={src}
                      alt="featured"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form card */}
          <div>
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Login</h2>
                <Link
                  to="/signup"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Create account
                </Link>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Continue to your personalized shopping experience.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      {showPassword ? (
                        // Eye-off icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.614-10-6 1.02-2.068 2.725-3.77 4.825-4.825M9.9 4.35A9.966 9.966 0 0112 4c4.477 0 8.268 2.614 10 6-.606 1.229-1.43 2.33-2.425 3.25M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12"
                          />
                        </svg>
                      ) : (
                        // Eye icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
                  Login
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M13.293 5.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L16.586 12l-3.293-3.293a1 1 0 010-1.414z" />
                    <path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </button>
              </form>

              <p className="mt-4 text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
