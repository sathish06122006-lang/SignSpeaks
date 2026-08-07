import { useRef, useState, useEffect } from 'react'
import { FiCamera, FiCameraOff, FiRefreshCw, FiVolume2, FiCopy, FiTrash2, FiDownload, FiSave } from 'react-icons/fi'
import { useMediaPipeHands } from '../hooks/useMediaPipeHands'
import { speak } from '../utils/speech'
import api from '../utils/api'

export default function LiveDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [sentence, setSentence] = useState('')
  const [history, setHistory] = useState([])
  const [lastSign, setLastSign] = useState(null)
  const [serverFps, setServerFps] = useState(0)
  const lastAddedRef = useRef({ sign: null, time: 0 })
  const pollingRef = useRef(null)

  // Tracks up to 2 hands so both single-hand and two-handed signs work.
  const { handDetected, hands, fps: clientFps } = useMediaPipeHands({ videoRef, canvasRef, active, maxHands: 2 })
  const handsRef = useRef(hands)
  handsRef.current = hands

  // Poll the backend classifier (mock heuristic until a real model is
  // trained, then automatically your trained TensorFlow model) roughly
  // twice a second rather than on every video frame, since it's a network
  // round trip.
  useEffect(() => {
    if (!active) return
    pollingRef.current = setInterval(async () => {
      const currentHands = handsRef.current
      if (!currentHands || currentHands.length === 0) return
      try {
        const { data } = await api.post('/api/detection/predict', {
          hands: currentHands.map((h) => ({ handedness: h.handedness, landmarks: h.landmarks })),
        })
        setServerFps((f) => f) // fps is measured client-side; kept for future server timing
        if (!data.sign || data.confidence < 0.6) return

        const now = Date.now()
        if (data.sign !== lastAddedRef.current.sign || now - lastAddedRef.current.time > 1500) {
          lastAddedRef.current = { sign: data.sign, time: now }
          setLastSign(data)
          setSentence((s) => (s ? `${s} ${data.sign}` : data.sign))
          setHistory((h) => [{ ...data, timestamp: new Date().toISOString() }, ...h].slice(0, 50))
        }
      } catch {
        // transient network/auth error - skip this tick
      }
    }, 500)
    return () => clearInterval(pollingRef.current)
  }, [active])

  const startCamera = () => setActive(true)
  const stopCamera = () => {
    setActive(false)
    const tracks = videoRef.current?.srcObject?.getTracks?.() || []
    tracks.forEach((t) => t.stop())
  }
  const switchCamera = () => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))

  const handleCopy = () => navigator.clipboard.writeText(sentence)
  const handleClear = () => {
    setSentence('')
    setHistory([])
  }
  const handleSpeak = () => speak(sentence, { voiceGender: 'female' })

  const handleSave = async () => {
    try {
      await api.post('/api/detection/conversations', {
        title: `Conversation ${new Date().toLocaleString()}`,
        text: sentence,
        history: history.map((h) => ({ sign: h.sign, confidence: h.confidence })),
      })
      alert('Conversation saved to your account.')
    } catch {
      alert('Could not save — please log in again.')
    }
  }

  const handleDownloadPdf = () => {
    // Client-side simple text download; full PDF export with styling is
    // available per-conversation from the Dashboard once saved.
    const blob = new Blob([sentence || '(empty)'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sign-speaks-conversation.txt'
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Live Detection</h1>
      <p className="opacity-70 mb-8">Real-time ISL recognition — tracks one or both hands, whichever the sign needs.</p>

      <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
        {/* Left Panel */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold">Camera</h3>
          <video ref={videoRef} className="hidden" playsInline muted />
          <div className={`text-xs px-3 py-1 rounded-full inline-block ${active ? 'bg-teal/20 text-teal-light' : 'bg-white/10 opacity-70'}`}>
            {active ? (handDetected ? `${hands.length} hand${hands.length > 1 ? 's' : ''} detected` : 'No hand detected') : 'Camera off'}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={startCamera} disabled={active} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold disabled:opacity-40">
              <FiCamera /> Start Camera
            </button>
            <button onClick={stopCamera} disabled={!active} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold disabled:opacity-40">
              <FiCameraOff /> Stop Camera
            </button>
            <button onClick={switchCamera} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold">
              <FiRefreshCw /> Switch Camera
            </button>
          </div>
          <p className="text-xs opacity-50">Facing: {facingMode === 'user' ? 'Front' : 'Back'}</p>
        </div>

        {/* Center Panel */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center min-h-[420px]">
          {active ? (
            <canvas ref={canvasRef} className="w-full max-w-xl rounded-xl" />
          ) : (
            <div className="text-center opacity-60">
              <FiCamera className="text-5xl mx-auto mb-3" />
              <p>Start the camera to see live hand landmark visualization.</p>
            </div>
          )}
          {active && !handDetected && (
            <p className="mt-3 text-sm text-coral">No hand detected — position one or both hands in frame.</p>
          )}
        </div>

        {/* Right Panel */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold mb-1">Current Sign</h3>
            <div className="text-4xl font-display font-extrabold text-gradient">
              {lastSign?.sign || '—'}
            </div>
            <p className="text-xs opacity-60 mt-1">
              Confidence: {lastSign ? `${Math.round(lastSign.confidence * 100)}%` : '—'} · {clientFps} FPS
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold opacity-80 mb-1">Sentence</h4>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-black/20 p-3 text-sm outline-none"
              placeholder="Detected signs form a sentence here…"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSpeak} className="flex items-center justify-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold"><FiVolume2 /> Speak</button>
            <button onClick={handleCopy} className="flex items-center justify-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold"><FiCopy /> Copy</button>
            <button onClick={handleClear} className="flex items-center justify-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold"><FiTrash2 /> Clear</button>
            <button onClick={handleDownloadPdf} className="flex items-center justify-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold"><FiDownload /> Export</button>
            <button onClick={handleSave} className="col-span-2 flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-brand-gradient text-white text-xs font-semibold"><FiSave /> Save Conversation</button>
          </div>

          <div>
            <h4 className="text-sm font-semibold opacity-80 mb-2">Detection History</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {history.length === 0 && <p className="text-xs opacity-50">No signs detected yet.</p>}
              {history.map((h, i) => (
                <div key={i} className="flex justify-between text-xs opacity-80 border-b border-white/5 py-1">
                  <span>{h.sign}</span>
                  <span>{Math.round(h.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
