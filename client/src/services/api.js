import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('loadlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  verifyAadhaar: (data) => api.post('/auth/verify-aadhaar', data)
};

export const tripsAPI = {
  getTrips: () => api.get('/trips'),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  selectRoute: (id, routeId) => api.post(`/trips/${id}/select-route`, { routeId }),
  acceptShipment: (id, shipmentId) => api.post(`/trips/${id}/accept-shipment`, { shipmentId }),
  rejectShipment: (id, shipmentId) => api.post(`/trips/${id}/reject-shipment`, { shipmentId }),
  updateTripStatus: (id, status) => api.post(`/trips/${id}/status`, { status })
};

export const shipmentsAPI = {
  getShipments: (params) => api.get('/shipments', { params }),
  getShipmentById: (id) => api.get(`/shipments/${id}`),
  createShipment: (data) => api.post('/shipments', data),
  getFareEstimate: (params) => api.get('/shipments/fare-estimate', { params }),
  bookTrip: (id, tripId) => api.post(`/shipments/${id}/book-trip`, { tripId }),
  verifyPickup: (id, enteredOtp, photoData) => api.post(`/shipments/${id}/verify-pickup`, { enteredOtp, photoData }),
  verifyDelivery: (id, enteredOtp, photoData) => api.post(`/shipments/${id}/verify-delivery`, { enteredOtp, photoData })
};

export const ratingsAPI = {
  submitRating: (data) => api.post('/ratings', data),
  getDriverRatings: (driverId) => api.get(`/ratings/${driverId}`)
};

export const demoAPI = {
  seedScenario: () => api.post('/demo/seed'),
  resetDatabase: () => api.post('/demo/reset'),
  getStats: () => api.get('/demo/stats')
};

export default api;
