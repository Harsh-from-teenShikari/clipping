import axios from "axios";

const BASE = "/api/v1";

// Axios instance
const api = axios.create({ baseURL: BASE });

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ────────────────────────────────────────────────
export const authAPI = {
  register: (email, password) =>
    api.post("/auth/register", { email, password }),

  login: (email, password) => api.post("/auth/login", { email, password }),
};

// ─── CAMPAIGNS ───────────────────────────────────────────
export const campaignsAPI = {
  getMyOperatorCampaigns: (operatorId, status, type) => {
    const params = { operator_id: operatorId };
    if (status) params.status = status;
    if (type) params.type = type;
    return api.get("/campaigns/", { params });
  },
  getAll: (status, type) => {
    const params = {};
    if (status) params.status = status;
    if (type) params.type = type;
    return api.get("/campaigns/", { params });
  },

  getOne: (id) => api.get(`/campaigns/${id}`),

  create: (body) => api.post("/campaigns/", body),

  update: (id, body) => api.patch(`/campaigns/${id}`, body),

  activate: (id) => api.patch(`/campaigns/${id}/activate`),

  pause: (id) => api.patch(`/campaigns/${id}/pause`),

  join: (campaignId, creatorId) =>
    api.post(`/campaigns/${campaignId}/join`, { creator_id: creatorId }),

  getJoinedNotSubmitted: (creatorId) =>
    api.get(`/campaigns/joined/not-submitted/${creatorId}`),
};

// ─── SUBMISSIONS ─────────────────────────────────────────
export const submissionsAPI = {
  create: (campaignId, creatorId, contentUrl) =>
    api.post("/submissions/", {
      campaign_id: campaignId,
      creator_id: creatorId,
      content_url: contentUrl,
    }),

  getPassed: (campaignId) => api.get(`/submissions/passed/${campaignId}`),

  review: (verifiedId, status, rejectionReason) =>
    api.post(`/submissions/verify/${verifiedId}/review`, {
      status,
      rejection_reason: rejectionReason || null,
    }),
};

// ─── IDENTITY / DASHBOARD ────────────────────────────────
export const identityAPI = {
  getDashboard: (creatorId) => api.get(`/identity/dashboard/${creatorId}`),
  updateProfile: (creatorId, body) => api.put(`/identity/profile/${creatorId}`, body),
};

export default api;
