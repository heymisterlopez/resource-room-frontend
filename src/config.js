// src/config.js

// In development this falls back to localhost,
// in production Vercel will inject REACT_APP_API_URL
export const API_BASE =
  process.env.REACT_APP_API_URL || 'http://localhost:5001';
