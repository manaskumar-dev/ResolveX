// ==========================================================================
// API client
//
// A drop-in vanilla-JS replacement for the original axios-based api.js.
// Every exported function returns a Promise that resolves to an object
// shaped like an axios response: { data, status }.
// On failure it throws an object shaped like an axios error:
// { response: { status, data } } so existing error-handling patterns like
// `err?.response?.data?.message` keep working unchanged.
// ==========================================================================

import { API_BASE_URL } from './config.js';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // Network-level failure (server down, CORS, offline, etc.)
    throw { response: null, message: networkErr.message };
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login, same as the
      // original axios response interceptor.
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('createdAt');
      window.location.href = '/login';
    }
    throw { response: { status: response.status, data } };
  }

  return { data, status: response.status };
}

const API = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

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

// Message / Chat portal APIs
export const getUserMessages = (ticketId) => API.get(`/message/user/complaint/${ticketId}/messages`);
export const sendUserMessage = (ticketId, payload) => API.post(`/message/user/complaint/${ticketId}/message`, payload);
export const getAgentMessages = (ticketId) => API.get(`/message/agent/complaint/${ticketId}/messages`);
export const sendAgentMessage = (ticketId, payload) => API.post(`/message/agent/complaint/${ticketId}/message`, payload);

export default API;
