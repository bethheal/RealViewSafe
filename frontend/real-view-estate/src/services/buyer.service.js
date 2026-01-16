import api from "./api";

const buyerService = {
  /* ======================
     DASHBOARD
  ======================= */
  async getDashboard() {
    const res = await api.get("/buyer/dashboard");
    return res.data;
  },

  /* ======================
     PROFILE
  ======================= */
  async getProfile() {
    const res = await api.get("/buyer/profile");
    return res.data;
  },

  async updateProfile(payload) {
    const res = await api.patch("/buyer/profile", payload);
    return res.data;
  },

  /* ======================
     PROPERTIES
  ======================= */
  async browseProperties() {
    const res = await api.get("/buyer/browse-properties");
    return res.data;
  },

  async saveProperty(propertyId) {
    const res = await api.post("/buyer/save", { propertyId });
    return res.data;
  },

  async getSaved() {
    const res = await api.get("/buyer/saved");
    return res.data;
  },

  async buyProperty(propertyId) {
    const res = await api.post("/buyer/buy", { propertyId });
    return res.data;
  },

  async getPurchases() {
    const res = await api.get("/buyer/purchases");
    return res.data;
  },

  /* ======================
     WHATSAPP LEAD
  ======================= */
  async contactAgent(propertyId) {
    const res = await api.post("/buyer/contact-agent", { propertyId });
    return res.data; 
    // expects: { whatsappUrl }
  },
};

export default buyerService;
