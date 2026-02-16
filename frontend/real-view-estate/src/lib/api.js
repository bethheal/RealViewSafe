import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || window.location.origin;

const base = rawBase
  .replace(/\/+$/, "")        // remove trailing slashes
  .replace(/\/api$/, "");     // if env ends with /api, remove it

const api = axios.create({
  baseURL: `${base}/api`,
});

console.log("API BASE URL =", api.defaults.baseURL);

if (!import.meta.env.VITE_API_URL && import.meta.env.MODE === "production") {
  console.warn(
    "VITE_API_URL not set — using window.location.origin as API base.\n" +
      "If your API is hosted on a different domain, set VITE_API_URL before building."
  );
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
