// src/lib/api.ts
import axios from 'axios';

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
        if (error.response?.status === 401) {
            localStorage.removeItem('gamit_token');
            localStorage.removeItem('gamit_user');
            window.location.href = '/login'; // Force user back to login
        }
        return Promise.reject(error);
    }
);