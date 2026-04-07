import axios from 'axios';

// Get the backend URL from environment or use standard dev port
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'ozk_a7f3d9e1b2c4056f8e9d1a3b5c7f0e2d4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4'
  },
});

api.interceptors.request.use((config) => {
  // Add JWT token if it exists in storage
  const token = localStorage.getItem('oz_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
