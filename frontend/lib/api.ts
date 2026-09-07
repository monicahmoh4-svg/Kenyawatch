import axios from 'axios'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const contractsApi = {
  getMeta: () => api.get('/api/contracts/meta'),
  list: (params: any) => api.get('/api/contracts', { params }),
  getById: (id: string) => api.get(`/api/contracts/${id}`),
  scan: (contract: any) => api.post('/api/contracts/scan', contract),
  search: (params: any) => api.get('/api/contracts/search', { params }),
}

export const statsApi = {
  getDashboard: () => api.get('/api/stats'),
}

export const ghostProjectsApi = {
  list: (params?: any) => api.get('/api/ghost-projects', { params }),
}

export const reportsApi = {
  submit: (report: any) => api.post('/api/reports', report),
}

export const chatApi = {
  send: (message: string) => api.post('/api/ai/chat', { message }),
}
