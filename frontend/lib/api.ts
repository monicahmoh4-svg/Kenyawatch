import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kenyawatch.onrender.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API request timed out')
    } else if (!error.response) {
      console.error('API unreachable:', API_URL)
    } else {
      console.error('API Error:', error?.response?.data || error.message)
    }
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

export const syncApi = {
  trigger: (data: any) => api.post('/api/sync/ocds', data),
  status: () => api.get('/api/sync/status'),
}

export const alertsApi = {
  list: (params?: any) => api.get('/api/alerts', { params }),
  unreadCount: () => api.get('/api/alerts/unread-count'),
  stats: () => api.get('/api/alerts/stats'),
  acknowledge: (id: number) => api.post(`/api/alerts/${id}/acknowledge`),
  acknowledgeAll: () => api.post('/api/alerts/acknowledge-all'),
  triggerScan: () => api.post('/api/alerts/scan'),
  status: () => api.get('/api/alerts/status'),
}

export const eaccApi = {
  list: (params?: any) => api.get('/api/eacc', { params }),
  stats: () => api.get('/api/eacc/stats'),
}
