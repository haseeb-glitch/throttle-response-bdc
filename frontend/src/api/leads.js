import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

// Request interceptor — har request mein token add karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trbdc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — 401 aaye to login pe redirect karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trbdc_token')
      localStorage.removeItem('trbdc_auth')
      localStorage.removeItem('trbdc_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const leadsApi = {
  getAll:            ()          => api.get('/api/leads'),
  getOne:            (id)        => api.get(`/api/leads/${id}`),
  create:            (data)      => api.post('/api/leads', data),
  sendMessage:       (id, msg)   => api.post(`/api/leads/${id}/message`, { message: msg }),
  sendManualMessage: (id, msg)   => api.post(`/api/leads/${id}/manual-message`, { message: msg }),
  toggleTakeover:    (id)        => api.patch(`/api/leads/${id}/takeover`),
}

export const authApi = {
  login:          (username, password) => api.post('/api/auth/login', { username, password }),
  me:             ()                   => api.get('/api/auth/me'),
  changePassword: (oldPassword, newPassword) => api.post('/api/auth/change-password', { oldPassword, newPassword }),
}

export default api