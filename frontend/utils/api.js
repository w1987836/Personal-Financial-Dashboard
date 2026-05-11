// Axios instance and helper functions for calling the backend API.
// The base URL comes from NEXT_PUBLIC_API_URL so it works locally and on Vercel.

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token from localStorage on each request if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;


