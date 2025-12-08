import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await apiPost("/auth/signup", { name, email, password });

      loginUser({
        token: res.token,
        user_id: res.user_id,
        name: res.name
      });

      navigate("/catalog");
    } catch (err) {
      setError("Signup failed — email may already exist.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-indigo-600 text-white py-2 rounded">
          Create Account
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600">Login</Link>
      </p>
    </div>
  );
}
