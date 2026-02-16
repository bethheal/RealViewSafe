// frontend/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Must be set in .env.production
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  // Use localStorage for now; consider HttpOnly cookie for security
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Optional: Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

// Flag to switch between mock and real data
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
