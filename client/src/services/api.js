import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const atendimentosAPI = {
  // Buscar todos os atendimentos
  getAll: () => api.get('/atendimentos'),
  
  // Buscar atendimento por telefone
  getByPhone: (telefone) => api.get(`/atendimentos/${telefone}`),
  
  // Filtrar por status
  getByStatus: (status) => api.get(`/atendimentos/status/${status}`),
}

export const metricasAPI = {
  // Buscar métricas gerais
  get: () => api.get('/metricas'),
  
  // Buscar métricas detalhadas
  getDetalhadas: () => api.get('/metricas/detalhadas'),
}

export const alertasAPI = {
  // Buscar todos os alertas
  getAll: () => api.get('/alertas'),
  
  // Buscar alertas urgentes
  getUrgentes: () => api.get('/alertas/urgentes'),
  
  // Buscar tipos de falhas
  getTipos: () => api.get('/alertas/tipos'),
}

export default api 