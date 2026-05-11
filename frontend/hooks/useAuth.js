// Simple authentication hook using localStorage for JWT token + user info.
// Provides login, register, logout, and a way to guard protected pages.

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";

export default function useAuth({ redirectTo = "/login", protectedRoute = false } = {}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("pf_token") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("pf_user") : null;

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else if (protectedRoute) {
      router.replace(redirectTo);
    } else {
      setLoading(false);
    }
  }, [protectedRoute, redirectTo, router]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, name, _id } = res.data;
    localStorage.setItem("pf_token", token);
    localStorage.setItem("pf_user", JSON.stringify({ name, email, _id }));
    setUser({ name, email, _id });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token, _id } = res.data;
    localStorage.setItem("pf_token", token);
    localStorage.setItem("pf_user", JSON.stringify({ name, email, _id }));
    setUser({ name, email, _id });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("pf_token");
    localStorage.removeItem("pf_user");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, login, register, logout };
}


