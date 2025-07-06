// src/api.js
import axios from 'axios'
import { API_BASE } from '../config'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE}/api`,   // ← will point to `${API_BASE}/api/...`
  withCredentials: true,         // include cookies (for your session)
  headers: { 'Content-Type': 'application/json' },
})

// (Optional) interceptors here if you need them…

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login:    (credentials) => api.post('/auth/login', credentials),
  logout:   () => api.post('/auth/logout'),
  getCurrentTeacher: () => api.get('/auth/me'),
  checkAuth: () => api.get('/auth/check'),
}

// Students endpoints
export const studentsAPI = {
  getAll:       () => api.get('/students'),
  add:          (data) => api.post('/students', data),
  update:       (id, data) => api.put(`/students/${id}`, data),
  /* …and the rest as you already have… */
}

// Goals endpoints
export const goalsAPI = {
  getCurrent:   () => api.get('/goals/current'),
  /* … */
}

export default api
