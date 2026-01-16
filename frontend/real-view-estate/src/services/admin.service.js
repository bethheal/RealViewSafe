import api from "./api";

const adminService = {
  /* ======================
     DASHBOARD
  ======================= */
  async getDashboard() {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },

  /* ======================
     USERS
  ======================= */
  async getAgents() {
    const res = await api.get("/admin/agents");
    return res.data;
  },

  async getBuyers() {
    const res = await api.get("/admin/buyers");
    return res.data;
  },

  /* ======================
     PROPERTIES
  ======================= */
  async getPendingProperties() {
    const res = await api.get("/admin/properties");
    return res.data;
  },

  async reviewProperty(id, payload) {
    const res = await api.patch(
      `/admin/properties/${id}/review`,
      payload
    );
    return res.data;
  },

  /* ======================
     SUBSCRIPTIONS
  ======================= */
  async getSubscriptions() {
    const res = await api.get("/admin/subscriptions");
    return res.data;
  },

  async assignSubscription(payload) {
    const res = await api.post("/admin/subscriptions", payload);
    return res.data;
  },

async suspendAgent(id, payload) {
  const res = await api.patch(`/admin/agents/${id}/suspend`, payload);
  return res.data;
},


};

export default adminService;
