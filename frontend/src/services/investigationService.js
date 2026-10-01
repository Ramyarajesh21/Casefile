import api from './api'

export const startInvestigation = async (payload) => {
  const response = await api.post('/investigations/start', payload)
  return response.data
}

export const fetchInvestigation = async (investigationId) => {
  const response = await api.get(`/investigations/${investigationId}`)
  return response.data
}

export const discoverClue = async (investigationId, clueId) => {
  const response = await api.post(`/investigations/${investigationId}/clues/${clueId}/discover`)
  return response.data
}

export const collectEvidence = async (investigationId, evidenceId) => {
  const response = await api.post(`/investigations/${investigationId}/evidence/${evidenceId}/collect`)
  return response.data
}

export const interviewWitness = async (investigationId, witnessId, payload) => {
  const response = await api.post(`/investigations/${investigationId}/witnesses/${witnessId}/interview`, payload)
  return response.data
}

export const fetchDeductions = async (investigationId) => {
  const response = await api.get(`/investigations/${investigationId}/deductions`)
  return response.data
}

export const saveDeduction = async (investigationId, payload) => {
  const response = await api.post(`/investigations/${investigationId}/deductions`, payload)
  return response.data
}

export const submitAccusation = async (investigationId, payload) => {
  const response = await api.post(`/investigations/${investigationId}/accusation`, payload)
  return response.data
}

export const fetchResult = async (investigationId) => {
  const response = await api.get(`/investigations/${investigationId}/result`)
  return response.data
}
