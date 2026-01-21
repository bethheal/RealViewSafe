import api from "../lib/api";

export const agentService = {
  dashboard: () => api.get("/agent/dashboard"),

  addProperty: (formData) =>
    api.post("/agent/properties", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateProperty: (id, formData) =>
    api.patch(`/agent/properties/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteProperty: (id) => api.delete(`/agent/properties/${id}`),

  markSold: (id) => api.patch(`/agent/properties/${id}/sold`),

  myProperties: () => api.get("/agent/properties"),
  getDrafts: () => api.get("/agent/properties/drafts"),

  getLeads: () => api.get("/agent/leads"),
  getSubscription: () => api.get("/agent/subscription"),

  getProfile: () => api.get("/agent/profile"),
  updateProfile: (data) => api.patch("/agent/profile", data),
};
