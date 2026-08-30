/**
 * Central, configurable thresholds + status metadata for the recognition
 * confidence pipeline. Change values here to tune behaviour app-wide
 * (Live Detection + AI Practice) without touching any UI component.
 *
 * Default thresholds (per SIH 2026 spec):
 *   90%–100%  -> High Confidence
 *   70%–89%   -> Medium Confidence
 *   below 70% -> Low Confidence / Unclear -> labelled "Unknown Sign"
 */

export const RECOGNITION_THRESHOLDS = {
  highConfidence: 0.9, // >= 0.90 -> High
  mediumConfidence: 0.7, // >= 0.70 -> Medium (below -> Low/Unknown)
}

// Signs at or above this confidence are considered "recognized" and may be
// appended to the context sequence. Anything below it is treated as unclear
// (Unknown sign) and never auto-formed into a confident sentence.
export const MIN_SIGN_CONFIDENCE = 0.7

export const STATUS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNAVAILABLE: 'unavailable',
  NO_HAND: 'no_hand',
  EMPTY: 'empty',
}

export const STATUS_META = {
  [STATUS.HIGH]: {
    label: 'High Confidence',
    icon: 'check',
    color: 'high',
    detail: '',
  },
  [STATUS.MEDIUM]: {
    label: 'Medium Confidence',
    icon: 'info',
    color: 'medium',
    detail: '',
  },
  [STATUS.LOW]: {
    label: 'Low Confidence',
    icon: 'warning',
    color: 'low',
    detail: 'Sign unclear. Please try again — hold the hand shape steady.',
  },
  [STATUS.UNAVAILABLE]: {
    label: 'Confidence unavailable',
    icon: 'help',
    color: 'none',
    detail: 'The current model returned a label without a confidence score, so no confidence can be shown.',
  },
  [STATUS.NO_HAND]: {
    label: 'No hand detected',
    icon: 'help',
    color: 'none',
    detail: 'Position one or both hands inside the frame to begin recognition.',
  },
  [STATUS.EMPTY]: {
    label: 'Awaiting camera…',
    icon: 'help',
    color: 'none',
    detail: 'Start the camera to begin live ISL recognition.',
  },
}