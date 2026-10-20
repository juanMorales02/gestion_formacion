import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Instancia única: la URL del backend vive solo en .env (VITE_API_URL).
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const { token } = useAuthStore()
  if (token) config.headers['x-token'] = token
  return config
})

// 401 = token ausente, vencido o alterado: se cierra la sesión y se vuelve al login.
api.interceptors.response.use(
  (r) => r,
  (e) => {
    const auth = useAuthStore()
    if (e.response?.status === 401 && auth.token) {
      auth.logout()
      location.hash = '#/login'
    }
    return Promise.reject(e)
  }
)

export default api
