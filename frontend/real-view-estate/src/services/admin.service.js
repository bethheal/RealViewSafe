import api from "../lib/api"; // adjust path

console.log("ADMIN api baseURL =", api?.defaults?.baseURL);


const adminService = {

  
  async getDashboard() {
    return (await api.get("/admin/dashboard")).data;
  },

  async getAgents() {
    return (await api.get("/admin/agents")).data;
  },

  async suspendAgent(id, payload) {
    return (await api.patch(`/admin/agents/${id}/suspend`, payload)).data;
  },

  async getBuyers() {
    return (await api.get("/admin/buyers")).data;
  },

  async getPendingProperties() {
    return (await api.get("/admin/properties?status=PENDING")).data;
  },

  async getAllProperties() {
    return (await api.get("/admin/properties")).data;
  },

  async reviewProperty(id, payload) {
    return (await api.patch(`/admin/properties/${id}/review`, payload)).data;
  },

  addProperty(formData) {
    return api.post("/admin/properties", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateProperty(id, formData) {
    return api.patch(`/admin/properties/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async getSubscriptions() {
    return (await api.get("/admin/subscriptions")).data;
  },

  async assignSubscription(payload) {
    return (await api.post("/admin/subscriptions", payload)).data;
  },

    async changePassword(payload) {
    // payload: { currentPassword, newPassword }  (or { newPassword } if forced)
    return (await api.post("/admin/change-password", payload)).data;
  },

  
};

export default adminService;
