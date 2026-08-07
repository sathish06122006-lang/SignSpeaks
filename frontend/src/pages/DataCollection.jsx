import { useRef, useState, useEffect, useCallback } from 'react'
import { FiCamera, FiCameraOff, FiDownload, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import { useMediaPipeHands } from '../hooks/useMediaPipeHands'
import api from '../utils/api'

const RECOMMENDED_SAMPLES = 50

function guessCategory(label) {
  if (!label) return 'word'
  if (/^\d$/.test(label)) return 'number'
  if (/^[a-zA-Z]$/.test(label)) return 'alphabet'
  return 'word'
}

export default function DataCollection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const [label, setLabel] = useState('A')
  const [capturing, setCapturing] = useState(false)
  const [capturedCount, setCapturedCount] = useState(0)
  const [summary, setSummary] = useState([])
  const captureIntervalRef = useRef(null)

  // maxHands=2 so two-handed signs (e.g. certain words/phrases) capture
  // both hands in one sample, while single-hand signs just use one slot.
  const { handDetected, hands, fps } = useMediaPipeHands({ videoRef, canvasRef, active, maxHands: 2 })
  const handsRef = useRef(hands)
  handsRef.current = hands

  const loadSummary = useCallback(() => {
    api.get('/api/dataset/summary').then(({ data }) => setSummary(data)).catch(() => {})
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])

  const captureSingleSample = useCallback(async () => {
    const currentHands = handsRef.current
    if (!currentHands || currentHands.length === 0) return
    try {
      await api.post('/api/dataset/samples', {
        label,
        category: guessCategory(label),
        hands: currentHands.map((h) => ({ handedness: h.handedness, landmarks: h.landmarks })),
      })
      setCapturedCount((c) => c + 1)
    } catch {
      // ignore transient failures during rapid capture
    }
  }, [label])

  const startBurstCapture = () => {
    if (capturing) return
    setCapturing(true)
    setCapturedCount(0)
    captureIntervalRef.current = setInterval(captureSingleSample, 250) // ~4 samples/sec
  }

  const stopBurstCapture = () => {
    setCapturing(false)
    clearInterval(captureIntervalRef.current)
    loadSummary()
  }

  const clearLabelData = async () => {
    if (!confirm(`Delete all captured samples for "${label}"?`)) return
    await api.delete('/api/dataset/samples', { params: { label } })
    loadSummary()
  }

  const exportDataset = async () => {
    try {
      const response = await api.get('/api/dataset/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'isl_landmark_dataset.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed. Make sure you are logged in, then try again.')
    }
  }

  const currentEntry = summary.find((s) => s.label === label)
  const currentCount = currentEntry?.count || 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Collect Training Data</h1>
      <p className="opacity-70 mb-8 max-w-2xl">
        Hold each sign steady in front of your webcam while capturing. Use one hand for
        single-hand signs, or both hands for two-handed signs — the camera tracks up to two hands
        at once and saves whichever are present in each sample. Landmarks (not raw images) are
        stored — aim for {RECOMMENDED_SAMPLES}+ samples per sign.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center min-h-[420px]">
          <video ref={videoRef} className="hidden" playsInline muted />
          {active ? (
            <canvas ref={canvasRef} className="w-full max-w-xl rounded-xl" />
          ) : (
            <div className="text-center opacity-60">
              <FiCamera className="text-5xl mx-auto mb-3" />
              <p>Start the camera to begin capturing samples.</p>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setActive(true)} disabled={active}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold disabled:opacity-40"
            >
              <FiCamera /> Start Camera
            </button>
            <button
              onClick={() => setActive(false)} disabled={!active}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold disabled:opacity-40"
            >
              <FiCameraOff /> Stop Camera
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            {active && (
              <span className={`px-3 py-1 rounded-full ${handDetected ? 'bg-teal/20 text-teal-light' : 'bg-white/10 opacity-70'}`}>
                {handDetected ? `${hands.length} hand${hands.length > 1 ? 's' : ''} detected (${hands.map(h => h.handedness).join(', ')})` : 'No hand detected'}
              </span>
            )}
            {active && <span className="opacity-50">{fps} FPS</span>}
          </div>
          {active && !handDetected && (
            <p className="mt-2 text-sm text-coral">Position one or both hands in frame.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 space-y-5">
          <div>
            <label className="text-sm font-semibold opacity-80">Sign Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, 12))}
              placeholder="A, 5, Hello…"
              className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none text-lg font-display font-bold"
            />
            <p className="text-xs opacity-50 mt-1">
              Category auto-detected: <span className="opacity-80">{guessCategory(label)}</span>
            </p>
          </div>

          <div className="text-sm opacity-80">
            Samples for "{label}": <span className="font-semibold text-teal-light">{currentCount}</span>
            {currentEntry?.two_handed && <span className="ml-2 text-xs opacity-60">(two-handed)</span>}
            {currentCount >= RECOMMENDED_SAMPLES && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-teal-light"><FiCheckCircle /> Ready</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!capturing ? (
              <button
                onClick={startBurstCapture}
                disabled={!active || !handDetected}
                className="py-3 rounded-full bg-brand-gradient text-white font-semibold disabled:opacity-40"
              >
                Start Capturing
              </button>
            ) : (
              <button onClick={stopBurstCapture} className="py-3 rounded-full bg-coral text-white font-semibold">
                Stop ({capturedCount} captured this session)
              </button>
            )}
            <button onClick={clearLabelData} className="flex items-center justify-center gap-2 py-2 rounded-full glass text-xs font-semibold text-coral">
              <FiTrash2 /> Clear samples for this label
            </button>
          </div>

          <button onClick={exportDataset} className="w-full flex items-center justify-center gap-2 py-3 rounded-full glass text-sm font-semibold">
            <FiDownload /> Export Full Dataset (CSV)
          </button>

          <div>
            <h4 className="text-xs font-semibold opacity-70 mb-2">Collected So Far</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {summary.length === 0 && <p className="text-xs opacity-50">No samples collected yet.</p>}
              {summary.map((s) => (
                <div key={s.label} className="flex justify-between text-xs opacity-80 border-b border-white/5 py-1">
                  <span>{s.label} <span className="opacity-50">({s.category}{s.two_handed ? ', 2-hand' : ''})</span></span>
                  <span>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mt-8 text-sm opacity-80">
        <h3 className="font-display font-semibold mb-2">Next step: train your model</h3>
        <p>
          Once you've collected enough samples, click <strong>Export Full Dataset</strong>, save the
          file as <code>backend/training/isl_landmark_dataset.csv</code>, then run:
        </p>
        <pre className="bg-black/30 rounded-xl p-3 mt-2 overflow-x-auto text-xs">
{`cd backend
pip install -r training/requirements-train.txt
python training/train_model.py`}
        </pre>
        <p className="mt-2">
          Restart the backend afterward — Live Detection will automatically start using your trained
          model (which handles both single- and two-handed signs) instead of the placeholder classifier.
        </p>
      </div>
    </div>
  )
}
