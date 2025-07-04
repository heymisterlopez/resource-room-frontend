import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new teacher
  register: (userData) => api.post('/auth/register', userData),
  
  // Login teacher
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout teacher
  logout: () => api.post('/auth/logout'),
  
  // Get current teacher info
  getCurrentTeacher: () => api.get('/auth/me'),
  
  // Check if authenticated
  checkAuth: () => api.get('/auth/check'),
};

// Students API calls
export const studentsAPI = {
  // Get all students
  getAll: () => api.get('/students'),
  
  // Add new student
  add: (studentData) => api.post('/students', studentData),
  
  // Update student
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  
  // Update student groups
  updateGroups: (id, groups, primaryGroup) => api.put(`/students/${id}/groups`, { groups, primaryGroup }),
  
  // Delete student
  delete: (id) => api.delete(`/students/${id}`),
  
  // Student check-in
  checkin: (id, group) => api.post(`/students/${id}/checkin`, { group }),
  
  // Award bonus tokens
  awardBonus: (id, amount, reason) => api.post(`/students/${id}/bonus`, { amount, reason }),
  
  // Process purchase
  purchase: (id, item, cost) => api.post(`/students/${id}/purchase`, { item, cost }),
};

// Goals API calls
export const goalsAPI = {
  // Get current week's goals
  getCurrent: () => api.get('/goals/current'),
  
  // Update current goals
  updateCurrent: (goals) => api.put('/goals/current', { goals }),
  
  // Get goals for specific week
  getWeek: (date) => api.get(`/goals/week/${date}`),
  
  // Get all weeks with goals
  getWeeks: () => api.get('/goals/weeks'),
};

export default api;