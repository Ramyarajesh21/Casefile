import axios from 'axios'

export const AUTH_STORAGE_KEY = 'casefile.auth.username'
export const AUTH_INVALID_EVENT = 'casefile:auth-invalid'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestPath = (error.config?.url || '').split('?')[0]
    const isLoginRequest = requestPath.endsWith('/auth/login')
    const isAccountDeletionRequest = requestPath.endsWith('/auth/account')

    if (error.response?.status === 401 && !isLoginRequest && !isAccountDeletionRequest && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        // Storage may be unavailable; context state is still cleared below.
      }
      window.dispatchEvent(new Event(AUTH_INVALID_EVENT))
    }

    return Promise.reject(error)
  },
)

export default api
