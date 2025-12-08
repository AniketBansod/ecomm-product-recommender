import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { user_id, token }
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem("auth_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  function loginUser(data) {
    // Normalize shape to ensure user_id exists for downstream consumers
    const normalized = {
      ...data,
      user_id: data.user_id || data.id || data._id,
    };
    setUser(normalized);
    localStorage.setItem("auth_user", JSON.stringify(normalized));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
  }

  return (
    <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
