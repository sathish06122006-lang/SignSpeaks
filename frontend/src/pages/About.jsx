const TEAM = [
  { name: 'Gowthaami SM', role: 'Team Member' },
  { name: 'Jeevasri J', role: 'Team Member' },
  { name: 'Sathish Kumar S', role: 'Team Member' },
]

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      <div>
        <h1 className="font-display text-3xl font-bold mb-4">About Sign Speaks</h1>
        <p className="opacity-80 leading-relaxed">
          Sign Speaks is an AI-powered platform built to make communication accessible for the
          Deaf and hard-of-hearing community across India. It combines real-time computer vision
          with an interactive learning experience, so anyone can both understand and learn Indian
          Sign Language (ISL).
        </p>
      </div>

      <div className="glass rounded-2xl p-6 card-lift">
        <h2 className="font-display text-xl font-semibold mb-3">Problem Statement</h2>
        <p className="opacity-80 leading-relaxed">
          Millions of ISL users face daily communication barriers with people who don't know sign
          language, and structured ISL learning resources remain scarce compared to spoken-language
          tools. Sign Speaks addresses both gaps in a single platform: live detection for real-time
          communication, and a gamified curriculum for learning ISL from scratch.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 card-lift">
        <h2 className="font-display text-xl font-semibold mb-3">Project Objective</h2>
        <ul className="list-disc list-inside opacity-80 space-y-1">
          <li>Detect ISL alphabets, numbers, and common words in real time using webcam input</li>
          <li>Convert detected signs into readable sentences, speech, and translated text</li>
          <li>Provide a structured, gamified path for learning ISL from beginner to advanced</li>
          <li>Track learning progress with a visual analytics view in My Progress</li>
        </ul>
      </div>

      <div className="glass rounded-2xl p-6 card-lift">
        <h2 className="font-display text-xl font-semibold mb-4">Technologies Used</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm opacity-80">
          <div>
            <p className="font-semibold text-violet mb-1">Frontend</p>
            <p>React.js, Tailwind CSS, Framer Motion</p>
          </div>
          <div>
            <p className="font-semibold text-violet mb-1">Backend</p>
            <p>FastAPI</p>
          </div>
          <div>
            <p className="font-semibold text-violet mb-1">AI / Computer Vision</p>
            <p>TensorFlow, CNN, MediaPipe, OpenCV</p>
          </div>
          <div>
            <p className="font-semibold text-violet mb-1">Database</p>
            <p>MongoDB</p>
          </div>
          <div>
            <p className="font-semibold text-violet mb-1">Authentication</p>
            <p>JWT</p>
          </div>
          <div>
            <p className="font-semibold text-violet mb-1">Charts & Speech</p>
            <p>Chart.js, Web Speech API</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Team Limitless</h2>
        <div className="grid sm:grid-cols-3 gap-4 [perspective:1200px]">
          {TEAM.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-5 text-center card-lift">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-gradient mb-3" />
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs opacity-60">{t.role}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-4 opacity-70 text-sm"></p>
      </div>
    </div>
  )
}
