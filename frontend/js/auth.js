// ==========================================================================
// Auth store
//
// A vanilla-JS replacement for the original React AuthContext. Holds the
// same pieces of state (token + user fields) backed by the same
// localStorage keys, and exposes the same operations (login, signup,
// logout). Components that need to react to auth changes (e.g. the navbar)
// can call `onAuthChange(callback)`.
// ==========================================================================

import { login as apiLogin, signup as apiSignup } from './api.js';

const listeners = new Set();

function readUser() {
  return {
    name: localStorage.getItem('name') || null,
    email: localStorage.getItem('email') || null,
    role: localStorage.getItem('role') || null,
    id: localStorage.getItem('id') || null,
    createdAt: localStorage.getItem('createdAt') || null,
  };
}

const state = {
  token: localStorage.getItem('token'),
  user: readUser(),
};

function persist() {
  if (state.token) localStorage.setItem('token', state.token);
  else localStorage.removeItem('token');

  const u = state.user || {};
  if (u.name) localStorage.setItem('name', u.name); else localStorage.removeItem('name');
  if (u.email) localStorage.setItem('email', u.email); else localStorage.removeItem('email');
  if (u.role) localStorage.setItem('role', u.role); else localStorage.removeItem('role');
  if (u.id) localStorage.setItem('id', u.id); else localStorage.removeItem('id');
  if (u.createdAt) localStorage.setItem('createdAt', u.createdAt); else localStorage.removeItem('createdAt');
}

function notify() {
  listeners.forEach((cb) => cb(getAuth()));
}

export function onAuthChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getAuth() {
  return { token: state.token, user: state.user, role: state.user?.role };
}

export function getToken() {
  return state.token;
}

export function getUser() {
  return state.user;
}

export async function login(email, password) {
  const res = await apiLogin({ email, password });
  if (res?.data?.token) {
    state.token = res.data.token;
    state.user = {
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
      id: res.data.id,
      createdAt: res.data.createdAt,
    };
    persist();
    notify();
  }
  return res;
}

export async function signup(name, email, password) {
  return apiSignup({ name, email, password, role: 'user' });
}

export function logout() {
  state.token = null;
  state.user = { name: null, email: null, role: null, id: null, createdAt: null };
  persist();
  notify();
}

export function setUser(user) {
  state.user = user;
  persist();
  notify();
}
