import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVolume2, FiCopy, FiShare2, FiAlertTriangle, FiX, FiLoader, FiCheckCircle } from 'react-icons/fi'
import LanguageSelector from '../components/LanguageSelector'
import { translateText, getLanguage } from '../services/TranslationService'
import { speak } from '../utils/speech'

/**
 * Emergency Communication (DEMO MODE only).
 *
 * SAFETY RULE: This page NEVER contacts police/ambulance/family, sends SMS,
 * or shares location. Every action is simulated and clearly labelled as such.
 * A production deployment would require real, authorized integrations with
 * proper consent flows and backend support before any of these actions could
 * actually place a call or send a message.
 */

const EMERGENCY_PREFIX_MESSAGES = [
  { id: 'help', emoji: '🚨', text: 'I need help' },
  { id: 'medical', emoji: '🏥', text: 'I need medical help' },
  { id: 'ambulance', emoji: '🚑', text: 'Call an ambulance' },
  { id: 'police', emoji: '🚔', text: 'Call the police' },
  { id: 'family', emoji: '📞', text: 'Please call my family' },
  { id: 'lost', emoji: '📍', text: 'I am lost' },
  { id: 'danger', emoji: '⚠️', text: 'I am in danger' },
  { id: 'assist', emoji: '🤝', text: 'I need assistance' },
]

export default function Emergency() {
  const [selected, setSelected] = useState(null)
  const [targetLang, setTargetLang] = useState('en')
  const [translated, setTranslated] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmDemo, setConfirmDemo] = useState(false)

  const selectedMessage = EMERGENCY_PREFIX_MESSAGES.find((m) => m.id === selected)
  const lang = getLanguage(targetLang)
  const displayText = translated || selectedMessage?.text || ''

  const handleSelect = (msg) => {
    setSelected(msg.id)
    setTranslated('')
    setError('')
    setTargetLang('en')
  }

  const handleTranslate = async (code) => {
    setTargetLang(code)
    setError('')
    if (!selectedMessage || code === 'en') {
      setTranslated('')
      return
    }
    setLoading(true)
    try {
      const { translated: t } = await translateText(selectedMessage.text, code)
      setTranslated(t)
    } catch {
      setError('Translation failed — please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = () => {
    if (!displayText) return
    speak(displayText, { lang: lang.speechLang })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Emergency message', text: displayText })
      } catch {
        /* user cancelled share */
      }
    } else {
      // No native share support — offer clipboard as the fallback.
      await handleCopy()
    }
  }
return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h1 className="font-display text-3xl font-bold">Emergency Communication</h1>
        <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-coral/40 bg-coral/10 text-coral font-semibold">
          <FiAlertTriangle /> Demo Mode — simulated only
        </span>
      </div>
      <p className="opacity-70 mb-6 max-w-2xl">
        Tap a message to display it large, hear it spoken, translate it, copy it, or share it.
        This prototype does <strong>not</strong> contact emergency services or share your location.
      </p>

      {/* Quick-action grid — extra-large, mobile-first, keyboard navigable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMERGENCY_PREFIX_MESSAGES.map((m) => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(m)}
            aria-pressed={selected === m.id}
            className={`min-h-[96px] rounded-2xl p-4 text-left text-lg sm:text-xl font-display font-bold transition border ${
              selected === m.id
                ? 'bg-brand-gradient text-white border-transparent'
                : 'glass hover:opacity-90 border-white/10'
            }`}
          >
            <span className="block text-3xl mb-2">{m.emoji}</span>
            {m.text}
          </motion.button>
        ))}
      </div>

      {/* Selected message display + actions */}
      <div className="mt-8">
        {!selectedMessage ? (
          <div className="glass rounded-2xl p-10 text-center opacity-70">
            <FiAlertTriangle className="text-4xl mx-auto mb-3" />
            <p>Select an emergency message above to begin.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 space-y-5">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold">{selectedMessage.emoji} {selectedMessage.text}</h2>
              <LanguageSelector value={targetLang} onChange={handleTranslate} />
            </div>

            <div className="rounded-xl bg-black/20 p-5">
              <p className="text-3xl sm:text-4xl font-display font-bold leading-snug">
                {loading ? (
                  <span className="flex items-center gap-2 text-lg opacity-60"><FiLoader className="animate-spin" /> Translating…</span>
                ) : (
                  displayText
                )}
              </p>
              {targetLang !== 'en' && !loading && (
                <p className="mt-2 flex items-center gap-1.5 text-xs opacity-60">
                  <span className="px-2 py-0.5 rounded-full bg-white/10">Demo translation</span>
                  {lang.flag} {lang.label}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-coral border border-coral/30 bg-coral/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSpeak}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-gradient text-white font-semibold text-base"
              >
                <FiVolume2 /> Speak
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass font-semibold text-base"
              >
                <FiCopy /> {copied ? <><FiCheckCircle /> Copied!</> : 'Copy'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full glass font-semibold text-base"
              >
                <FiShare2 /> Share
              </button>
              <button
                onClick={() => setConfirmDemo(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-coral text-white font-semibold text-base"
              >
                <FiAlertTriangle /> Request help (demo)
              </button>
            </div>
          </div>
        )}
      </div>
{/* Demo safety confirmation */}
      <AnimatePresence>
        {confirmDemo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={() => setConfirmDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-md w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="emergency-demo-title"
            >
              <button onClick={() => setConfirmDemo(false)} className="absolute top-3 right-3 p-2 rounded-full glass" aria-label="Close">
                <FiX />
              </button>
              <FiAlertTriangle className="text-4xl mx-auto mb-3 text-coral" />
              <h3 id="emergency-demo-title" className="font-display text-xl font-bold mb-2">Demo Mode</h3>
              <p className="opacity-80 text-sm">
                In a full deployment, this would contact emergency services. This prototype does
                not call anyone, send SMS, or share your location — it only shows you how the
                flow would work.
              </p>
              <button
                onClick={() => setConfirmDemo(false)}
                className="mt-5 px-6 py-2 rounded-full bg-brand-gradient text-white font-semibold"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}