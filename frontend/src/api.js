import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: baseURL,
});

// attach token when available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (payload) => API.post('/auth/signup', payload);
export const login = (payload) => API.post('/auth/login', payload);
export const deleteUser = () => API.delete('/auth/delete');

// User APIs
export const getProfile = () => API.get('/user/profile');
export const updateProfile = (payload) => API.put('/user/profile', payload);

export const createComplaint = (payload) => API.post('/user/regComplain', payload);
export const getAllComplaints = () => API.get('/user/allComplaints');
export const getComplaint = (ticketId) => API.get(`/user/complaint/${ticketId}`);
export const getCompletedComplaints = () => API.get('/user/completedComplaints');

// Review APIs
export const addReview = (ticketId, payload) => API.post(`/review/review/${ticketId}`, payload);

// Admin APIs
export const createAgent = (payload) => API.post('/admin/createAgent', payload);
export const getAllUsers = () => API.get('/admin/allUsers');
export const getAllAgents = () => API.get('/admin/allAgents');
export const getAllComplaints_admin = () => API.get('/admin/allComplaints');
export const getUnassignedComplaints = () => API.get('/admin/unassignedComplaints');
export const getAgentsByCategory = (ticketId) => API.get(`/admin/allAgentByCategory/${ticketId}`);
export const assignComplaint = (ticketId, payload) => API.post(`/admin/assignComplaint/${ticketId}`, payload);

// Agent APIs
export const getAgentComplaints = () => API.get('/agent/allComplaints');
export const getSingleComplaint = (ticketId) => API.get(`/agent/complaint/${ticketId}`);
export const updateComplaintInProgress = (ticketId) => API.put(`/agent/complaint/${ticketId}/in-progress`);
export const updateComplaintResolved = (ticketId, payload) => API.put(`/agent/complaint/${ticketId}/resolve`, payload);

export default API;
