// src/lib/api.ts

import axios from 'axios';

// Configuración base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('dazly-auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('dazly-auth-storage');
      localStorage.removeItem('dazly-user-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de la API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  
  register: (userData: { email: string; password: string }) =>
    api.post('/api/auth/register', userData),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/api/auth/change-password', data),
};

export const aiAPI = {
  generateImage: (prompt: string, projectId: string, imageUrl?: string) =>
    api.post('/api/ai/generate', { prompt, projectId, imageUrl }),
  
  editImage: (imageUrl: string, prompt: string, projectId: string) =>
    api.post('/api/ai/generate', { imageUrl, prompt, projectId }),
};

export const stripeAPI = {
  createCheckoutSession: (planId: string) =>
    api.post('/api/stripe/create-session', { planId }),
  
  getCustomerPortal: () =>
    api.post('/api/stripe/customer-portal'),
};

export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: any) => api.put('/api/user/profile', data),
  getBillingHistory: () => api.get('/api/user/billing'),
};

export default api;