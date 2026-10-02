import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlay, FiBook, FiYoutube, FiInfo } from 'react-icons/fi'
import HeroScanCard from '../components/HeroScanCard'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
}

const FEATURES = [
  { title: 'ISL Alphabets', desc: 'A–Z fingerspelling recognized in real time.' },
  { title: 'Numbers', desc: 'Detects 0–9 hand signs instantly.' },
  { title: 'Common Words', desc: 'Everyday phrases like Hello, Thank You, Help.' },
]

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient-soft" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial="hidden" animate="visible" custom={0} variants={fadeUp}
              className="uppercase tracking-widest text-xs font-semibold text-coral mb-4"
            >
              AI Indian Sign Language Detection & Learning Platform
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="font-display text-5xl md:text-6xl font-bold leading-tight"
            >
              <span className="text-gradient">Sign Speaks</span>
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" custom={2} variants={fadeUp}
              className="mt-5 text-lg opacity-80 max-w-xl"
            >
              Bridging communication through artificial intelligence and Indian Sign Language.
            </motion.p>
            <motion.div
              initial="hidden" animate="visible" custom={3} variants={fadeUp}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/live-detection" className="flex items-center gap-2 px-5 py-3 btn-primary">
                <FiPlay /> Start Detection
              </Link>
              <Link to="/learn" className="flex items-center gap-2 px-5 py-3 btn-secondary">
                <FiBook /> Learn ISL
              </Link>
              <Link to="/tutorials" className="flex items-center gap-2 px-5 py-3 btn-secondary">
                <FiYoutube /> Watch Tutorials
              </Link>
              <Link to="/about" className="flex items-center gap-2 px-5 py-3 btn-secondary">
                <FiInfo /> About Project
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative [perspective:1200px]"
          >
            <HeroScanCard />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">What Sign Speaks Detects</h2>
        <div className="grid md:grid-cols-3 gap-6 [perspective:1200px]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 card-lift"
            >
              <h3 className="font-display font-semibold text-xl mb-2">{f.title}</h3>
              <p className="opacity-70 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="glass rounded-3xl p-10 card-lift">
          <h2 className="font-display text-2xl font-bold mb-3">Powered by TensorFlow, OpenCV & MediaPipe</h2>
          <p className="opacity-70 max-w-2xl mx-auto">
            Sign Speaks runs hand landmark tracking directly in your browser and pairs it with a
            CNN-based classification engine to recognize ISL alphabets, numbers, and common words —
            all without sending your camera feed to any third-party API.
          </p>
        </div>
      </section>
    </div>
  )
}
