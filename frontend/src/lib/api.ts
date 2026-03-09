import axios from 'axios';

// Use environment variable or default to localhost for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Public axios instance (no auth token injected, no interceptors)
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth API — uses publicApi so stale tokens don't interfere with register/login
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'breeder' | 'trainer';
  }) => publicApi.post('/auth/register/', data),

  login: (username: string, password: string) =>
    publicApi.post('/auth/login/', { username, password }),

  getProfile: () => api.get('/auth/profile/'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
};

// Dogs API
export const dogsAPI = {
  list: () => api.get('/dogs/'),
  // Public listing — no auth required, uses dedicated public endpoint
  listPublicByRole: (role: 'breeder' | 'trainer') =>
    publicApi.get(`/public/dogs/?owner_role=${role}`),
  listPublic: () => publicApi.get('/public/dogs/'),
  create: (data: FormData) => api.post('/dogs/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  get: (id: number) => api.get(`/dogs/${id}/`),
  getPublic: (id: number) => publicApi.get(`/public/dogs/${id}/`),
  update: (id: number, data: FormData) => api.put(`/dogs/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: number) => api.delete(`/dogs/${id}/`),
};

// Health Records API
export const healthAPI = {
  list: () => api.get('/health-records/'),
  create: (data: any) => api.post('/health-records/', data),
  get: (id: number) => api.get(`/health-records/${id}/`),
  update: (id: number, data: any) => api.put(`/health-records/${id}/`, data),
  delete: (id: number) => api.delete(`/health-records/${id}/`),
};

// Breeding API
export const breedingAPI = {
  listRecords: () => api.get('/breeding-records/'),
  createRecord: (data: any) => api.post('/breeding-records/', data),
  listLitters: () => api.get('/litters/'),
  createLitter: (data: any) => api.post('/litters/', data),
  listPuppies: () => api.get('/puppies/'),
  createPuppy: (data: any) => api.post('/puppies/', data),
};

// Training API
export const trainingAPI = {
  listRecords: () => api.get('/training-records/'),
  createRecord: (data: any) => api.post('/training-records/', data),
  listDeployments: () => api.get('/deployments/'),
  createDeployment: (data: any) => api.post('/deployments/', data),
  listBehavior: () => api.get('/behavior-assessments/'),
  createBehavior: (data: any) => api.post('/behavior-assessments/', data),
};

// Financial API
export const financialAPI = {
  list: () => api.get('/financial-records/'),
  create: (data: any) => api.post('/financial-records/', data),
  dashboard: (months = 6) => api.get(`/financial-records/dashboard/?months=${months}`),
};

// Equipment API
export const equipmentAPI = {
  list: () => api.get('/equipment/'),
  create: (data: any) => api.post('/equipment/', data),
  update: (id: number, data: any) => api.put(`/equipment/${id}/`, data),
  delete: (id: number) => api.delete(`/equipment/${id}/`),
};

// Admin API (superadmin only)
export const adminAPI = {
  getStats: () => api.get('/admin/stats/'),
  listUsers: () => api.get('/admin/users/'),
  createUser: (data: any) => api.post('/admin/users/create/', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}/delete/`),
  listBreedingRecords: () => api.get('/admin/breeding-records/'),
  listTrainingRecords: () => api.get('/admin/training-records/'),
  listEquipment: () => api.get('/admin/equipment/'),
};

// Documents API
export const documentsAPI = {
  list: () => api.get('/documents/'),
  create: (data: FormData) => api.post('/documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Reminders API
export const remindersAPI = {
  list: () => api.get('/reminders/'),
  create: (data: any) => api.post('/reminders/', data),
  update: (id: number, data: any) => api.patch(`/reminders/${id}/`, data),
  delete: (id: number) => api.delete(`/reminders/${id}/`),
};

// Notifications API
export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id: number) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
};

export default api;
