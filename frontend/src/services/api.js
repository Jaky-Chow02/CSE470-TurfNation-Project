import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// Turf APIs
export const getAllTurfs = (params) => api.get('/turfs', { params });
export const getTurf = (id) => api.get(`/turfs/${id}`);
export const getTurfAvailability = (id, date) => api.get(`/turfs/${id}/availability`, { params: { date } });

// Booking APIs
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const cancelBooking = (id, reason) => api.put(`/bookings/${id}/cancel`, { reason });

// Weather API
export const getWeather = (city) => api.get('/weather/current', { params: { city } });
// Add these tournament functions
export const getAllTournaments = (params) => api.get('/tournaments', { params });
export const getTournament = (id) => api.get(`/tournaments/${id}`);
export const createTournament = (data) => api.post('/tournaments', data);
export const joinTournament = (id, data) => api.post(`/tournaments/${id}/join`, data);
// Turf Owner APIs
export const getMyTurfs = () => api.get('/turfs?owner=me');
export const getTurfBookings = (turfId, params) => api.get(`/bookings/turf/${turfId}`, { params });
export const addAnnouncement = (turfId, message) => api.post(`/turfs/${turfId}/announcement`, { message });

export const getMyRewards = () => api.get('/rewards/me');

export default api;