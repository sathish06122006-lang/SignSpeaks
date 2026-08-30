import { RECOGNITION_THRESHOLDS, STATUS, STATUS_META } from '../config/recognition'

/**
 * ConfidenceService — maps a raw confidence score produced by the
 * recognition backend into a human-readable status object.
 *
 * SOURCING RULE (explicit):
 *  - If the model returns a real confidence value it is used DIRECTLY and
 *    never transformed or "improved".
 *  - If the model does not return confidence (only a top-1 label), the
 *    service returns STATUS.UNAVAILABLE instead of inventing a number, so
 *    the UI shows a clear "Confidence unavailable" state.
 *  - When the model is later upgraded to emit probabilities, ONLY this
 *    service needs attention — UI components read `classifyConfidence`.
 */
export function classifyConfidence(confidence) {
  if (confidence === null || confidence === undefined || Number.isNaN(confidence)) {
    return { level: STATUS.UNAVAILABLE, value: null, ...STATUS_META[STATUS.UNAVAILABLE] }
  }

  const value = Math.round(confidence * 100)

  if (confidence >= RECOGNITION_THRESHOLDS.highConfidence) {
    return { level: STATUS.HIGH, value, ...STATUS_META[STATUS.HIGH] }
  }
  if (confidence >= RECOGNITION_THRESHOLDS.mediumConfidence) {
    return { level: STATUS.MEDIUM, value, ...STATUS_META[STATUS.MEDIUM] }
  }
  return { level: STATUS.LOW, value, ...STATUS_META[STATUS.LOW] }
}

/** True when the recognition is reliable enough to be treated as a real sign. */
export function isRecognized(status) {
  return status?.level === STATUS.HIGH || status?.level === STATUS.MEDIUM
}

/** The sign label to *display* — unknown/low-confidence results read as UNKNOWN. */
export function displaySign(result) {
  if (!result?.sign) return null
  return isRecognized(classifyConfidence(result.confidence)) ? result.sign : 'UNKNOWN'
}