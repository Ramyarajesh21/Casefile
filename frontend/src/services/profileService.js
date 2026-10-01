import api from './api'

export const fetchProfile = async () => {
  const response = await api.get('/profile')
  return response.data
}

export const fetchStatistics = async () => {
  const response = await api.get('/profile/statistics')
  return response.data
}
