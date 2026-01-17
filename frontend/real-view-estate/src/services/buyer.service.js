// src/services/buyer.service.js
import api from "../lib/api";

const buyerService = {
  getDashboard: () => api.get("/buyer/dashboard"),
  browse: () => api.get("/buyer/browse-properties"),

  saveProperty: (propertyId) => api.post("/buyer/save", { propertyId }),
  unsaveProperty: (propertyId) => api.delete(`/buyer/save/${propertyId}`),

  getSaved: () => api.get("/buyer/saved"),
  buyProperty: (propertyId) => api.post("/buyer/buy", { propertyId }),
  getPurchases: () => api.get("/buyer/purchases"),

  getProfile: () => api.get("/buyer/profile"),
  updateProfile: (payload) => api.patch("/buyer/profile", payload),

  changePassword: (payload) => api.post("/auth/change-password", payload),
};

export default buyerService;
