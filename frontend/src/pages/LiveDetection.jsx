import { useRef, useState, useEffect, useCallback } from 'react'
import { FiCamera, FiCameraOff, FiRefreshCw, FiVolume2, FiCopy, FiTrash2, FiDownload, FiSave, FiRotateCcw, FiAlertTriangle } from 'react-icons/fi'
import { useMediaPipeHands } from '../hooks/useMediaPipeHands'
import { speak } from '../utils/speech'
import api from '../utils/api'
import { classifyConfidence, isRecognized, displaySign } from '../services/ConfidenceService'
import { STATUS, STATUS_META } from '../config/recognition'
import ConfidenceIndicator from '../components/ConfidenceIndicator'
import RecognitionStatus from '../components/RecognitionStatus'
import UnknownSignAlert from '../components/UnknownSignAlert'

export default function LiveDetection() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [sentence, setSentence] = useState('')
  const [history, setHistory] = useState([])
  const [lastSign, setLastSign] = useState(null)
  const [backendError, setBackendError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const lastAddedRef = useRef({ sign: null, time: 0 })
  const pollingRef = useRef(null)

  // Tracks up to 2 hands so both single-hand and two-handed signs work.
  // `error` surfaces camera permission/availability failures.
  const { handDetected, hands, fps: clientFps, error: cameraError } = useMediaPipeHands({ videoRef, canvasRef, active, maxHands: 2 })
  const handsRef = useRef(hands)
  handsRef.current = hands

  // Single shared prediction routine — used by both the live poll loop and
  // the manual Retry button, so the two can never drift apart.
  const runPrediction = useCallback(async () => {
    const currentHands = handsRef.current
    if (!currentHands || currentHands.length === 0) {
      // No hand in frame: keep camera running, clear stale result.
      setLastSign((prev) => (prev ? null : prev)) // no-op if already null
      return
    }
    try {
      const { data } = await api.post('/api/detection/predict', {
        hands: currentHands.map((h) => ({ handedness: h.handedness, landmarks: h.landmarks })),
      })
      setBackendError('')
      if (!data) return

      // Avoid pointless re-renders: only update when the result actually changed.
      setLastSign((prev) =>
        prev && prev.sign === data.sign && prev.confidence === data.confidence ? prev : data
      )

      // Only signs recognised with Medium+ confidence enter the sentence;
      // low-confidence / Unknown results are shown but never auto-appended.
      if (data.sign && isRecognized(classifyConfidence(data.confidence))) {
        const now = Date.now()
        if (data.sign !== lastAddedRef.current.sign || now - lastAddedRef.current.time > 1500) {
          lastAddedRef.current = { sign: data.sign, time: now }
          setSentence((s) => (s ? `${s} ${data.sign}` : data.sign))
          setHistory((h) => [{ ...data, timestamp: new Date().toISOString() }, ...h].slice(0, 50))
        }
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setBackendError('Your session has expired — please log in again.')
      } else {
        setBackendError('Backend unavailable. Make sure the API server is running (default http://localhost:8000).')
      }
    } finally {
      setRetrying(false)
    }
  }, [])

  // Poll the backend classifier roughly twice a second rather than on every
  // video frame, since each call is a network round trip.
  useEffect(() => {
    if (!active) return
    pollingRef.current = setInterval(runPrediction, 500)
    return () => clearInterval(pollingRef.current)
  }, [active, runPrediction])

  // Safety net: release browser camera tracks on unmount if the user navigates
  // away while the camera is still on.
  useEffect(
    () => () => {
      const tracks = videoRef.current?.srcObject?.getTracks?.() || []
      tracks.forEach((t) => t.stop())
    },
    []
  )

  const startCamera = () => {
    setActive(true)
    setBackendError('')
  }
  const stopCamera = () => {
    setActive(false)
    setLastSign(null)
    setBackendError('')
    const tracks = videoRef.current?.srcObject?.getTracks?.() || []
    tracks.forEach((t) => t.stop())
  }
  const switchCamera = () => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))

  const handleCopy = () => navigator.clipboard.writeText(sentence)
  const handleClear = () => {
    setSentence('')
    setHistory([])
    setLastSign(null)
    setBackendError('')
  }
  const handleRetry = () => {
    setBackendError('')
    setLastSign(null)
    setRetrying(true)
    runPrediction()
  }
  const handleSpeak = () => speak(sentence, { voiceGender: 'female' })

  // ---- Derived recognition state (real model output, never invented) ----
  const lastStatus = lastSign
    ? lastSign.sign
      ? classifyConfidence(lastSign.confidence)
      : { level: STATUS.NO_HAND, ...STATUS_META[STATUS.NO_HAND] }
    : null
  const detectedLabel = lastSign ? displaySign(lastSign) : '—'
  const showUnknown = lastSign?.sign && lastStatus && !isRecognized(lastStatus)

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
      <p className="opacity-70 mb-8">Real-time ISL recognition with confidence scoring — tracks one or both hands, whichever the sign needs.</p>

      {(cameraError || backendError) && (
        <div className="mb-6 space-y-2">
          {cameraError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              <FiAlertTriangle className="shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
          {backendError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              <FiAlertTriangle className="shrink-0" />
              <span>{backendError}</span>
              <button onClick={handleRetry} className="ml-auto shrink-0 px-3 py-1 rounded-full glass text-xs font-semibold hover:opacity-80">
                Retry
              </button>
            </div>
          )}
        </div>
      )}

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
          <div className="space-y-3">
            <h3 className="font-display font-semibold mb-1">Current Sign</h3>
            <div className={`text-4xl font-display font-extrabold ${detectedLabel === 'UNKNOWN' ? 'text-coral' : 'text-gradient'}`}>
              {detectedLabel}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {lastStatus && <RecognitionStatus status={lastStatus} />}
              {lastSign?.sign && lastStatus && (
                <div className="min-w-[180px]"><ConfidenceIndicator level={lastStatus.level} value={lastStatus.value} /></div>
              )}
            </div>

            <p className="text-xs opacity-60">
              {clientFps} FPS{lastSign?.category ? ` · Category: ${lastSign.category}` : ''}
            </p>

            {showUnknown && <UnknownSignAlert status={lastStatus} />}

            {showUnknown && lastSign?.top3?.length > 1 && (
              <p className="text-xs opacity-60">
                <span className="font-semibold">Nearest signs:</span> {lastSign.top3.map((t) => t.sign).join(' · ')}
              </p>
            )}

            {active && !lastSign?.sign && (
              <p className="text-xs opacity-60">No hand detected — position one or both hands in frame.</p>
            )}
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
            <button onClick={handleRetry} disabled={retrying} className="flex items-center justify-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold disabled:opacity-40"><FiRotateCcw /> {retrying ? 'Retrying…' : 'Retry'}</button>
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
