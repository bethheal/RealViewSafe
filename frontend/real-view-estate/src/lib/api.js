import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

const base = rawBase
  .replace(/\/+$/, "")        // remove trailing slashes
  .replace(/\/api$/, "");     // if env ends with /api, remove it

const api = axios.create({
  baseURL: `${base}/api`,
});

console.log("API BASE URL =", api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
