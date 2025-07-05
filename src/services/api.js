// src/api.js
import axios from 'axios'
import { API_BASE } from './config'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE}/api`,   // ← points to `${API_BASE}/api/...`
  withCredentials: true,         // send cookies if you’re using sessions
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (if you need to inject auth tokens later)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor to catch 401s and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login:    (credentials) => api.post('/auth/login', credentials),
  logout:   () => api.post('/auth/logout'),
  getCurrentTeacher: () => api.get('/auth/me'),
  checkAuth: () => api.get('/auth/check'),
}

// Student endpoints
export const studentsAPI = {
  getAll:        () => api.get('/students'),
  add:           (data) => api.post('/students', data),
  update:        (id, data) => api.put(`/students/${id}`, data),
  updateGroups:  (id, groups, primaryGroup) =>
                   api.put(`/students/${id}/groups`, { groups, primaryGroup }),
  delete:        (id) => api.delete(`/students/${id}`),
  checkin:       (id, group) => api.post(`/students/${id}/checkin`, { group }),
  awardBonus:    (id, amount, reason) =>
                   api.post(`/students/${id}/bonus`, { amount, reason }),
  purchase:      (id, item, cost) =>
                   api.post(`/students/${id}/purchase`, { item, cost }),
}

// Goals endpoints
export const goalsAPI = {
  getCurrent:    () => api.get('/goals/current'),
  updateCurrent: (goals) => api.put('/goals/current', { goals }),
  getWeek:       (date) => api.get(`/goals/week/${date}`),
  getWeeks:      () => api.get('/goals/weeks'),
}

export default api
