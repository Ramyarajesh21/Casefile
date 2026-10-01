import api from './api'

export const ACCOUNT_DELETED_NOTICE_KEY = 'casefile.account-deleted'
export const SIGNED_OUT_NOTICE_KEY = 'casefile.signed-out'

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload)
  return response.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload)
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post('/auth/logout')
  return response.data
}

export const deleteAccount = async () => {
  const response = await api.delete('/auth/account')
  return response.data
}

export const getCurrentUser = async (username) => {
  const response = await api.get('/auth/me', { params: { username } })
  return response.data
}
