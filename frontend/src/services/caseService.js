import api from './api'

export const fetchCases = async () => {
  const response = await api.get('/cases')
  return response.data
}

export const fetchCaseById = async (caseId) => {
  const response = await api.get(`/cases/${caseId}`)
  return response.data
}

export const fetchCaseClues = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/clues`)
  return response.data
}

export const fetchCaseEvidence = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/evidence`)
  return response.data
}

export const fetchCaseWitnesses = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/witnesses`)
  return response.data
}

export const fetchCaseSuspects = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/suspects`)
  return response.data
}

export const fetchCaseTimeline = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/timeline`)
  return response.data
}
