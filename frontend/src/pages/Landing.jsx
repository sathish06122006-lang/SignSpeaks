import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlay, FiBook, FiYoutube, FiInfo } from 'react-icons/fi'

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
              className="uppercase tracking-widest text-xs font-semibold text-teal-light mb-4"
            >
              AI Indian Sign Language Detection & Learning Platform
            </motion.p>
            <motion.h1
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="font-display text-5xl md:text-6xl font-extrabold leading-tight"
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
              <Link to="/live-detection" className="flex items-center gap-2 px-5 py-3 rounded-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition">
                <FiPlay /> Start Detection
              </Link>
              <Link to="/learn" className="flex items-center gap-2 px-5 py-3 rounded-full glass font-semibold hover:opacity-80 transition">
                <FiBook /> Learn ISL
              </Link>
              <Link to="/tutorials" className="flex items-center gap-2 px-5 py-3 rounded-full glass font-semibold hover:opacity-80 transition">
                <FiYoutube /> Watch Tutorials
              </Link>
              <Link to="/about" className="flex items-center gap-2 px-5 py-3 rounded-full glass font-semibold hover:opacity-80 transition">
                <FiInfo /> About Project
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-8 shadow-glass">
              <svg viewBox="0 0 400 320" className="w-full h-auto">
                <defs>
                  <linearGradient id="handGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#5EEAD4" />
                    <stop offset="60%" stopColor="#A5B4FC" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>
                <path d="M150 260 L150 150 C150 130 175 130 175 150 L175 190" stroke="url(#handGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M175 190 L175 120 C175 100 200 100 200 120 L200 190" stroke="url(#handGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M200 190 L200 110 C200 90 225 90 225 110 L225 190" stroke="url(#handGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M225 190 L225 130 C225 112 248 112 248 130 L248 195" stroke="url(#handGrad)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M150 260 C120 260 110 220 130 200 L150 190 L248 195 C270 200 270 260 240 275 L180 280 C160 280 150 270 150 260 Z" fill="url(#handGrad)" opacity="0.25" stroke="url(#handGrad)" strokeWidth="6" />
                {[[150,150],[175,120],[200,110],[225,130],[248,195],[150,260]].map(([cx,cy],i)=>(
                  <circle key={i} cx={cx} cy={cy} r="6" fill="#FB7185" />
                ))}
                <circle cx="320" cy="80" r="34" fill="none" stroke="#5EEAD4" strokeWidth="2" strokeDasharray="4 6">
                  <animateTransform attributeName="transform" type="rotate" from="0 320 80" to="360 320 80" dur="8s" repeatCount="indefinite" />
                </circle>
                <text x="298" y="86" fontSize="20" fill="#A5B4FC" fontFamily="Sora">AI</text>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-10">What Sign Speaks Detects</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:-translate-y-1 transition-transform"
            >
              <h3 className="font-display font-semibold text-xl mb-2">{f.title}</h3>
              <p className="opacity-70 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="glass rounded-3xl p-10">
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
