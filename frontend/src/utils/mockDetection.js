// Mirrors backend/app/services/mock_cnn.py so the Live Detection page can
// keep running smoothly even if the backend request hasn't returned yet,
// or when used purely as a frontend-only demo. No external AI API is called.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const NUMBERS = Array.from({ length: 10 }, (_, i) => String(i))
const WORDS = ['Hello', 'Thank You', 'Please', 'Yes', 'No', 'Help', 'Sorry', 'Good', 'Name', 'Water']

const ALL_SIGNS = [
  ...ALPHABET.map((s) => ({ sign: s, category: 'alphabet' })),
  ...NUMBERS.map((s) => ({ sign: s, category: 'number' })),
  ...WORDS.map((s) => ({ sign: s, category: 'word' })),
]

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2)
}

export function classifyLandmarks(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { sign: null, confidence: 0, category: null }
  }

  const wrist = landmarks[0]
  const palmWidth = distance(landmarks[5], landmarks[17]) || 1e-6
  const tips = [4, 8, 12, 16, 20]
  const features = tips.map((t) => distance(wrist, landmarks[t]) / palmWidth)

  const bucket = Math.abs(Math.floor(features.reduce((a, f) => a + f * 100, 0))) % ALL_SIGNS.length
  const { sign, category } = ALL_SIGNS[bucket]

  const baseConf = 0.72 + (features.reduce((a, f) => a + f, 0) % 1) * 0.25
  const confidence = Math.max(0.55, Math.min(0.99, Math.round(baseConf * 100) / 100))

  return { sign, category, confidence }
}
