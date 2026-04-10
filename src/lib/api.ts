// src/lib/api.ts
import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Point to your Fastify backend
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gamit_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatically handle expired tokens (401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

        if (status === 401) {
            localStorage.removeItem('gamit_token');
            localStorage.removeItem('gamit_user');

            // If we are on the login page, show the error instead of redirecting
            if (window.location.pathname === '/login') {
                toast.error(message === 'Unauthorized' ? 'Invalid credentials. Please try again.' : message);
            } else {
                window.location.href = '/login'; // Force user back to login on session expiry
            }
        } else if (!status || status >= 500) {
            // Handle Network Errors (no status) and Server Failures (500+) globally
            toast.error(message);
        }

        return Promise.reject(error);
    }
);