import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

export const leadsApi = {
  getAll:         ()          => api.get('/api/leads'),
  getOne:         (id)        => api.get(`/api/leads/${id}`),
  create:         (data)      => api.post('/api/leads', data),
  sendMessage:    (id, msg)   => api.post(`/api/leads/${id}/message`, { message: msg }),
  toggleTakeover: (id)        => api.patch(`/api/leads/${id}/takeover`),
}

export default api
