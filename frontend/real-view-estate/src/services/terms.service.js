import api from "../lib/api";

export const termsService = {
  accept: () => api.post("/terms/accept"),
};
