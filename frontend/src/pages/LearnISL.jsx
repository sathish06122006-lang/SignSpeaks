import { useState } from 'react'
import { motion } from 'framer-motion'
import { speak } from '../utils/speech'

const MODULES = [
  {
    key: 'alphabets',
    title: 'Alphabet Lessons',
    level: 'Beginner',
    items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  },
  {
    key: 'numbers',
    title: 'Number Lessons',
    level: 'Beginner',
    items: Array.from({ length: 10 }, (_, i) => String(i)),
  },
  {
    key: 'words',
    title: 'Common Words',
    level: 'Intermediate',
    items: ['Hello', 'Thank You', 'Please', 'Yes', 'No', 'Help', 'Sorry', 'Good', 'Name', 'Water'],
  },
  {
    key: 'phrases',
    title: 'Daily Practice Phrases',
    level: 'Advanced',
    items: ['How are you?', 'What is your name?', 'Nice to meet you', 'See you tomorrow'],
  },
]

export default function LearnISL() {
  const [active, setActive] = useState('alphabets')
  const module = MODULES.find((m) => m.key === active)

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Learn ISL</h1>
      <p className="opacity-70 mb-8">From beginner fingerspelling to advanced daily-use phrases.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              active === m.key ? 'bg-brand-gradient text-white' : 'glass opacity-80'
            }`}
          >
            {m.title}
            <span className="ml-2 text-xs opacity-70">{m.level}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4"
      >
        {module.items.map((item) => (
          <button
            key={item}
            onClick={() => speak(item)}
            className="glass rounded-2xl p-5 flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-brand-gradient flex items-center justify-center font-display font-bold text-white text-lg">
              {item.length > 3 ? item[0] : item}
            </div>
            <span className="text-xs text-center opacity-80">{item}</span>
          </button>
        ))}
      </motion.div>

      <div className="glass rounded-2xl p-6 mt-10">
        <h3 className="font-display font-semibold mb-2">Daily Practice Streak</h3>
        <p className="opacity-70 text-sm">
          Visit the Dashboard to track your practice time, accuracy, and weekly progress across
          all lesson modules.
        </p>
      </div>
    </div>
  )
}
