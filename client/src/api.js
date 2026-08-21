import axios from "axios";

const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("vl_token");
}

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const authApi = {
  signup: (d) => api.post("/auth/signup", d),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getUsers: () => api.get("/auth/users"),
  getMe: () => api.get("/auth/me"),
};

export const tripsApi = {
  create: (d) => api.post("/trips", d),
  getMy: () => api.get("/trips/my"),
  getAll: (params) => api.get("/trips", { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  getRoutes: (id) => api.get(`/trips/${id}/routes`),
  getMatches: (id) => api.get(`/trips/${id}/matches`),
  accept: (tripId, shipmentId) => api.post(`/trips/${tripId}/accept/${shipmentId}`),
  getAssignments: (id) => api.get(`/trips/${id}/assignments`),
  updateStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
};

export const shipmentsApi = {
  quote: (d) => api.post("/shipments/quote", d),
  create: (d) => api.post("/shipments", d),
  getMy: () => api.get("/shipments/my"),
  getAll: (params) => api.get("/shipments", { params }),
  getOne: (id) => api.get(`/shipments/${id}`),
  getAvailableTrips: (id) => api.get(`/shipments/${id}/available-trips`),
  book: (id, tripId) => api.post(`/shipments/${id}/book/${tripId}`),
  pickupOtp: (id, otp) => api.post(`/shipments/${id}/pickup-otp`, { otp }),
  deliveryOtp: (id, otp) => api.post(`/shipments/${id}/delivery-otp`, { otp }),
  updateLocation: (id, lat, lng) => api.patch(`/shipments/${id}/location`, { lat, lng }),
  getLogs: (id) => api.get(`/shipments/${id}/logs`),
};

export const ratingsApi = {
  submit: (d) => api.post("/ratings", d),
  getForDriver: (id) => api.get(`/ratings/driver/${id}`),
  getForShipment: (id) => api.get(`/ratings/shipment/${id}`),
};

export const paymentsApi = {
  getForShipment: (id) => api.get(`/payments/shipment/${id}`),
  getMy: () => api.get("/payments/my"),
  getEarnings: () => api.get("/payments/earnings"),
};

export const adminApi = {
  seed: () => api.post("/admin/seed"),
  wipe: () => api.post("/admin/wipe"),
  getStats: () => api.get("/admin/stats"),
  getCities: () => api.get("/admin/cities"),
  addVehicle: (d) => api.post("/admin/vehicle", d),
};

export default api;
