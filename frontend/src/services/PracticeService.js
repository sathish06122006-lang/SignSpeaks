import api from '../utils/api'

/**
 * PracticeService — persistence for AI Practice results. All records are
 * REAL recognition outcomes (target sign, detected sign, confidence,
 * result, attempts) sent to the backend for safe, per-user storage and
 * later aggregation into the Progress Dashboard.
 */

export async function savePracticeSession({ targetSign, detectedSign, confidence, result, attempts }) {
  const { data } = await api.post('/api/practice/sessions', {
    target_sign: targetSign,
    detected_sign: detectedSign || null,
    confidence: confidence || 0,
    result,
    attempts,
  })
  return data
}

export async function getPracticeSessions(limit = 50) {
  const { data } = await api.get('/api/practice/sessions', { params: { limit } })
  return data
}