import api from '../utils/api'

/**
 * TranslationService — clean abstraction over translation for recognised
 * ISL sentences (Live Detection, AI Practice, Emergency page).
 *
 * MODE: demo / prototype (clearly labelled in the UI as "Demo translation").
 * No translation API key is configured in this project, so this service
 * uses the backend's offline phrase/word dictionary endpoint.
 * Sourcing rule: static dictionary lookups are NEVER presented as live AI
 * translation — the UI shows a "Demo translation" badge.
 *
 * To upgrade: point `translateText` at a real API (Google Translate /
 * IndicTrans / Bhashini) reading the key from an environment variable.
 * Callers (UI components) do not change.
 */

export const MODE = 'demo'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', speechLang: 'en-US' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳', speechLang: 'ta-IN' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', speechLang: 'hi-IN' },
]

const BACKEND_LANGUAGE = { en: 'English', ta: 'Tamil', hi: 'Hindi' }

export function getLanguage(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
}

/**
 * Translate `text` into the language with `targetCode` ('en'|'ta'|'hi').
 * Returns { translated, mode }. Throws on backend failure so the UI can
 * show a meaningful error + retry.
 */
export async function translateText(text, targetCode) {
  if (!text || targetCode === 'en') return { translated: text || '', mode: MODE }

  const { data } = await api.post('/api/detection/translate', null, {
    params: { text, target_language: BACKEND_LANGUAGE[targetCode] || 'Tamil' },
  })
  return { translated: data?.translated ?? text, mode: MODE }
}