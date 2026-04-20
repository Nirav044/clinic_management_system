/**
 * Centralized Axios API client for SmartClinic.
 * - Reads base URL from VITE_API_URL environment variable
 * - Automatically attaches the JWT token from localStorage to every request
 * - Handles 401 responses by clearing the session and redirecting to login
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT token ─────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('scms_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: handle auth errors ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired / invalid — clear session and reload
            localStorage.removeItem('scms_token');
            localStorage.removeItem('scms_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
