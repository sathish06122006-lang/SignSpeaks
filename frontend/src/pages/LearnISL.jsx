import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeadphones, FiX, FiImage } from 'react-icons/fi'
import { speak } from '../utils/speech'
import api from '../utils/api'

import { MODULES, publicImageSrc } from '../data/signCatalog'

const normalizeKey = (label) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function playTone(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = correct ? 880 : 220
    osc.type = correct ? 'sine' : 'sawtooth'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    // Web Audio unsupported - skip the tone
  }
}

export default function LearnISL() {
  const [active, setActive] = useState('alphabets')
  const [practiceMode, setPracticeMode] = useState(false)
  const [target, setTarget] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [streak, setStreak] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [signImages, setSignImages] = useState({})
  const [viewing, setViewing] = useState(null)
  const [publicImageOk, setPublicImageOk] = useState(true) // resets per-sign in openSign
  const nextRoundTimeout = useRef(null)

  useEffect(() => {
    api.get('/api/sign-images').then(({ data }) => setSignImages(data)).catch(() => setSignImages({}))
  }, [])

  const module = MODULES.find((m) => m.key === active)

  const speakItem = (item) => speak(module.speakPhrase(item), { rate: 0.9 })

  const openSign = (item) => {
    setViewing(item)
    setPublicImageOk(true) // try /ITEM.jpg from the public folder first, each time
    speakItem(item)
  }

  const pickNewTarget = useCallback((mod) => {
    const item = mod.items[Math.floor(Math.random() * mod.items.length)]
    setTarget(item)
    setFeedback(null)
    setTimeout(() => speak(mod.speakPhrase(item), { rate: 0.9 }), 300)
  }, [])

  const startPractice = () => {
    setPracticeMode(true)
    setStreak(0)
    setRounds(0)
    pickNewTarget(module)
  }

  const stopPractice = () => {
    setPracticeMode(false)
    clearTimeout(nextRoundTimeout.current)
    setTarget(null)
    setFeedback(null)
  }

  const handleGuess = (item) => {
    if (!practiceMode || feedback) return
    const correct = item === target
    setFeedback(correct ? 'correct' : 'wrong')
    playTone(correct)
    setRounds((r) => r + 1)
    setStreak((s) => (correct ? s + 1 : 0))
    speak(correct ? 'Correct!' : `Not quite — that was ${module.speakPhrase(target)}`, { rate: 1 })
    nextRoundTimeout.current = setTimeout(() => pickNewTarget(module), 1600)
  }

  const switchModule = (key) => {
    stopPractice()
    setActive(key)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Learn ISL</h1>
      <p className="opacity-70 mb-6">From beginner fingerspelling to advanced daily-use phrases.</p>

      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => switchModule(m.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                active === m.key ? 'btn-primary' : 'btn-secondary opacity-80'
              }`}
            >
              {m.title}
              <span className="ml-2 text-xs opacity-70">{m.level}</span>
            </button>
          ))}
        </div>

        {!practiceMode ? (
          <button
            onClick={startPractice}
            className="flex items-center gap-2 px-4 py-2 text-sm btn-primary"
          >
            <FiHeadphones /> Practice by Ear
          </button>
        ) : (
          <button
            onClick={stopPractice}
            className="flex items-center gap-2 px-4 py-2 text-sm btn-secondary text-coral"
          >
            <FiX /> Exit Practice
          </button>
        )}
      </div>

      {practiceMode && (
        <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display font-semibold">
              🔊 Listen, then click the matching sign
              {feedback && (
                <span className={`ml-3 text-sm ${feedback === 'correct' ? 'text-brandGreen' : 'text-coral'}`}>
                  {feedback === 'correct' ? 'Correct!' : `That was ${target}`}
                </span>
              )}
            </p>
            <p className="text-xs opacity-60 mt-1">Streak: {streak} · Rounds: {rounds}</p>
          </div>
          <button
            onClick={() => target && speak(module.speakPhrase(target), { rate: 0.9 })}
            className="px-4 py-2 text-xs btn-secondary"
          >
            🔁 Replay Sound
          </button>
        </div>
      )}

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 [perspective:1200px]"
      >
        {module.items.map((item) => {
          const isTarget = practiceMode && target === item
          const showResult = practiceMode && feedback && isTarget
          return (
            <button
              key={item}
              onClick={() => (practiceMode ? handleGuess(item) : openSign(item))}
              className={`glass rounded-2xl p-5 flex flex-col items-center gap-2 card-lift ${
                showResult ? (feedback === 'correct' ? 'ring-2 ring-brandGreen' : 'ring-2 ring-coral') : ''
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center font-display font-bold text-white text-lg relative">
                {item.length > 3 ? item[0] : item}
              </div>
              <span className="text-xs text-center opacity-80">
                {practiceMode ? '?' : item}
              </span>
            </button>
          )
        })}
      </motion.div>

      <div className="glass rounded-2xl p-6 mt-10 card-lift">
        <h3 className="font-display font-semibold mb-2">Daily Practice Streak</h3>
        <p className="opacity-70 text-sm">
          Visit My Progress to track your practice time, accuracy, and weekly progress across
          all lesson modules.
        </p>
      </div>

      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setViewing(null)} className="absolute top-3 right-3 p-2 btn-secondary">
                <FiX />
              </button>
              <h3 className="font-display text-2xl font-bold mb-1">{viewing}</h3>
              <p className="text-xs opacity-60 mb-4">{module.speakPhrase(viewing)}</p>

              {publicImageOk === true && (
                <img
                  src={publicImageSrc(viewing)}
                  alt={`ISL sign for ${viewing}`}
                  className="w-full max-h-72 object-contain rounded-xl mb-4 bg-ink/40"
                  onError={() => setPublicImageOk(false)}
                />
              )}

               {publicImageOk === false && signImages[normalizeKey(viewing)] && (
                 <img
                   src={`${api.defaults.baseURL}${signImages[normalizeKey(viewing)]}`}
                   alt={`ISL sign for ${viewing}`}
                   className="w-full max-h-72 object-contain rounded-xl mb-4 bg-ink/40"
                   onError={() => setPublicImageOk('none')}
                 />
               )}

               {publicImageOk !== true && (!signImages[normalizeKey(viewing)] || publicImageOk === 'none') && (
                <div className="w-full aspect-square rounded-xl mb-4 bg-ink/40 flex flex-col items-center justify-center gap-2 opacity-60">
                  <FiImage size={32} />
                  <p className="text-xs px-4">
                    No reference image found. Add <code>{viewing}.jpg</code> to
                    <code className="mx-1">frontend/public/</code>.
                  </p>
                </div>
              )}

              <button
                onClick={() => speakItem(viewing)}
                className="px-4 py-2 text-sm btn-primary"
              >
                🔊 Hear it again
              </button>
              <Link
                to={`/practice?target=${encodeURIComponent(viewing)}`}
                className="mt-2 block px-4 py-2 text-sm btn-secondary"
              >
                Practise this sign →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
