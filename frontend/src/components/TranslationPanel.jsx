import { useEffect, useRef, useState } from 'react'
import { FiCopy, FiVolume2, FiRefreshCw, FiLoader } from 'react-icons/fi'
import LanguageSelector from './LanguageSelector'
import { translateText, getLanguage } from '../services/TranslationService'
import { speak } from '../utils/speech'

/**
 * Reusable multilingual translation panel (demo mode, clearly labelled).
 *
 * Props:
 *  - text:    the sentence to translate (from Context-Aware Recognition)
 *  - partial: true when some signs were unclear — translation is flagged
 *  - disabled: optional (e.g. no sentence available)
 */
export default function TranslationPanel({ text = '', partial = false, disabled = false }) {
  const [targetLang, setTargetLang] = useState('ta')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef(null)

  const canTranslate = Boolean(text) && !disabled

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!canTranslate || targetLang === 'en') {
      setTranslated('')
      setError('')
      setLoading(false)
      return
    }

    // Small debounce so a fast detection burst doesn't hammer the API.
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { translated: result } = await translateText(text, targetLang)
        setTranslated(result)
        setError('')
      } catch {
        setError('Translation failed — the translation service did not respond. Please try again.')
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [text, targetLang, canTranslate])

  const lang = getLanguage(targetLang)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translated || text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }
  const handleSpeak = () => speak(translated || text, { lang: lang.speechLang })
  const retry = () => {
    setError('')
    setLoading(true)
    translateText(text, targetLang)
      .then(({ translated: r }) => {
        setTranslated(r)
        setError('')
      })
      .catch(() => setError('Translation failed — please try again.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display font-semibold">Multilingual Translation</h3>
        <span
          className="text-xs px-2 py-1 rounded-full bg-white/10 opacity-80"
          title="No translation API key is configured — this uses the built-in demo dictionary."
        >
          Demo translation
        </span>
      </div>

      <LanguageSelector value={targetLang} onChange={setTargetLang} />

      {!canTranslate ? (
        <p className="text-sm opacity-50 py-3">
          {disabled
            ? 'Translation is unavailable for this result — the signs were not recognized clearly enough.'
            : 'No sentence to translate yet. Recognise signs in Live Detection to build one.'}
        </p>
      ) : targetLang === 'en' ? (
        <p className="text-sm opacity-60 py-3">Original English text — pick Tamil or Hindi to translate.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide opacity-50 mb-2">Original ({getLanguage('en').flag} English)</p>
            <p className="text-sm leading-relaxed">{text}</p>
          </div>

          <div className="rounded-xl bg-black/20 p-4 relative">
            <p className="text-xs uppercase tracking-wide opacity-50 mb-2">
              {lang.flag} {lang.label}
            </p>
            <div className="min-h-[40px]">
              {loading ? (
                <span className="flex items-center gap-2 text-sm opacity-60"><FiLoader className="animate-spin" /> Translating…</span>
              ) : error ? (
                <span className="text-sm text-coral">{error}</span>
              ) : (
                <p className="text-sm leading-relaxed">{translated || '—'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {partial && canTranslate && targetLang !== 'en' && (
        <p className="text-xs text-coral border border-coral/30 bg-coral/10 rounded-lg px-3 py-2">
          Some signs weren't recognized clearly, so this translation may be incomplete.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSpeak}
          disabled={!canTranslate || !(translated || text)}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-brand-gradient text-white text-xs font-semibold disabled:opacity-40"
        >
          <FiVolume2 /> Speak
        </button>
        <button
          onClick={handleCopy}
          disabled={!canTranslate || !(translated || text)}
          className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold disabled:opacity-40"
        >
          <FiCopy /> {copied ? 'Copied!' : 'Copy'}
        </button>
        {error && canTranslate && (
          <button onClick={retry} className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold">
            <FiRefreshCw /> Retry translation
          </button>
        )}
      </div>
    </div>
  )
}