// src/services/api.ts
import axios from 'axios';

// Get the API token from environment variables
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || 'your-super-secret-token-here';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  },
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - check your API token');
    } else if (error.response?.status === 404) {
      // Handle not found errors
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error - please try again later');
    } else if (error.request) {
      // Handle network errors
      console.error('Network error - please check your connection');
    } else {
      // Handle other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;