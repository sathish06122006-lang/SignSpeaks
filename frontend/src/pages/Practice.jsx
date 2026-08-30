import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiCamera, FiCameraOff, FiCheckCircle, FiChevronRight, FiImage, FiX, FiAlertTriangle } from 'react-icons/fi'
import { useMediaPipeHands } from '../hooks/useMediaPipeHands'
import api from '../utils/api'
import { speak } from '../utils/speech'
import { classifyConfidence, isRecognized, displaySign } from '../services/ConfidenceService'
import { MODULES, publicImageSrc } from '../data/signCatalog'
import { savePracticeSession } from '../services/PracticeService'
import ConfidenceIndicator from '../components/ConfidenceIndicator'
import RecognitionStatus from '../components/RecognitionStatus'
import UnknownSignAlert from '../components/UnknownSignAlert'

const MAX_ATTEMPTS_SHOWN = 20

function feedbackFor(result, target, detected, confidence) {
  if (result === 'correct') {
    return `Correct! Detected ${target} at ${Math.round(confidence * 100)}% confidence.`
  }
  if (result === 'incorrect') {
    return `Not quite — ${detected} was recognized instead. Try the ${target} sign again.`
  }
  return 'The sign was not recognized clearly. Hold the hand shape steady and try again.'
}

export default function Practice() {
  const [searchParams] = useSearchParams()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [active, setActive] = useState(false)
  const [facingMode, setFacingMode] = useState('user')
  const [target, setTarget] = useState(null)
  const [liveResult, setLiveResult] = useState(null)
  const [attempts, setAttempts] = useState([]) // recorded attempts for the current target
  const [checking, setChecking] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [backendError, setBackendError] = useState('')
  const [labelsMeta, setLabelsMeta] = useState({ labels: [], source: 'loading' })
  const [showViewer, setShowViewer] = useState(false)
  const [catalogSigns, setCatalogSigns] = useState([])
  const lastAttemptRef = useRef({ time: 0, label: null })

  const { handDetected, hands, fps, error: cameraError } = useMediaPipeHands({ videoRef, canvasRef, active, maxHands: 2 })
  const handsRef = useRef(hands)
  handsRef.current = hands

  // Load the model's real label set so practice targets are honest.
  useEffect(() => {
    api
      .get('/api/detection/labels')
      .then(({ data }) => setLabelsMeta(data))
      .catch(() => setLabelsMeta({ labels: [], source: 'unknown' }))
  }, [])

  // Assemble all catalog signs once.
  useEffect(() => {
    setCatalogSigns(MODULES.flatMap((m) => m.items.map((item) => ({ item, module: m }))))
  }, [])

  // Pre-select a sign passed via query (?target=).
  useEffect(() => {
    const t = searchParams.get('target')
    if (t && catalogSigns.some((s) => s.item === t)) setTarget(t)
  }, [searchParams, catalogSigns])

  const supported = new Set((labelsMeta.labels || []).map((l) => l.toLowerCase()))
  const isSupported = (item) => supported.has(item.toLowerCase())

  // Poll the backend recognizer ~twice a second while the camera runs.
  const runPrediction = useCallback(async () => {
    const currentHands = handsRef.current
    if (!currentHands || currentHands.length === 0) {
      setLiveResult(null)
      return
    }
    try {
      const { data } = await api.post('/api/detection/predict', {
        hands: currentHands.map((h) => ({ handedness: h.handedness, landmarks: h.landmarks })),
      })
      setBackendError('')
      setLiveResult((prev) =>
        prev && prev.sign === data.sign && prev.confidence === data.confidence ? prev : data
      )
    } catch (err) {
      setBackendError(
        err?.response?.status === 401
          ? 'Your session has expired — please log in again.'
          : 'Backend unavailable. Make sure the API server is running (default http://localhost:8000).'
      )
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(runPrediction, 500)
    return () => clearInterval(interval)
  }, [active, runPrediction])

  // Keep the camera off when no target is selected.
  useEffect(() => {
    if (!target && active) {
      setActive(false)
      const tracks = videoRef.current?.srcObject?.getTracks?.() || []
      tracks.forEach((t) => t.stop())
    }
  }, [target, active])

  const startCamera = () => {
    setBackendError('')
    setActive(true)
  }
  const stopCamera = () => {
    setActive(false)
    setLiveResult(null)
    const tracks = videoRef.current?.srcObject?.getTracks?.() || []
    tracks.forEach((t) => t.stop())
  }
  const switchCamera = () => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))

  const liveStatus = liveResult?.sign ? classifyConfidence(liveResult.confidence) : null
  const liveLabel = liveResult ? displaySign(liveResult) : null
  const liveMatch = Boolean(target && liveResult?.sign && liveLabel === target && liveStatus && isRecognized(liveStatus))
const pickNext = () => {
    const pool = catalogSigns.filter((s) => isSupported(s.item)).map((s) => s.item)
    const next = pool.filter((s) => s !== target)
    const chosen = next[Math.floor(Math.random() * next.length)] || target
    setTarget(chosen)
    setShowViewer(false)
    setLiveResult(null)
    setAttempts([])
    setSaveError('')
  }

  const handleCheck = async () => {
    if (checking || !target) return
    setChecking(true)
    setSaveError('')

    const result = liveResult?.sign
      ? isRecognized(classifyConfidence(liveResult.confidence))
        ? liveLabel === target
          ? 'correct'
          : 'incorrect'
        : 'unclear'
      : 'unclear'
    const detected = result === 'correct' ? target : result === 'incorrect' ? liveLabel : 'UNKNOWN'
    const confidence = liveResult?.confidence ?? 0
    const attempt = { detected, confidence, result, time: new Date().toISOString() }
    const updated = [...attempts, attempt]
    setAttempts(updated)
    lastAttemptRef.current = { time: Date.now(), label: detected }

    try {
      await savePracticeSession({
        targetSign: target,
        detectedSign: detected,
        confidence,
        result,
        attempts: updated.length,
      })
    } catch {
      setSaveError('Could not save this attempt to your progress — check your connection and try again.')
    } finally {
      setChecking(false)
    }
  }

  const handleClearAttempts = () => {
    setAttempts([])
    setSaveError('')
  }

  const correctCount = attempts.filter((a) => a.result === 'correct').length
  const score = attempts.length ? Math.round((correctCount / attempts.length) * 100) : null
  const lastAttempt = attempts[attempts.length - 1] || null

  const sourceBadge =
    labelsMeta.source === 'model'
      ? 'Trained CNN model'
      : labelsMeta.source === 'mock'
        ? 'Placeholder classifier (no model file)'
        : 'Model status unknown'
  const sourceTone =
    labelsMeta.source === 'model'
      ? 'bg-teal/20 text-teal-light border-teal/40'
      : 'bg-white/10 opacity-70 border-white/10'
return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h1 className="font-display text-3xl font-bold">AI Practice</h1>
        <span className={`text-xs px-3 py-1 rounded-full border ${sourceTone}`}>{sourceBadge}</span>
      </div>
      <p className="opacity-70 mb-6 max-w-2xl">
        Pick a sign, check the reference, then perform it in front of the camera. Feedback and
        results are real recognition outcomes — never invented.
      </p>

      {(cameraError || backendError) && (
        <div className="mb-6 space-y-2">
          {cameraError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              <FiAlertTriangle className="shrink-0" /> {cameraError}
            </div>
          )}
          {backendError && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              <FiAlertTriangle className="shrink-0" /> {backendError}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sign selector */}
        <div className="glass rounded-2xl p-4 max-h-[70vh] overflow-y-auto">
          <h3 className="font-display font-semibold mb-3">Choose a Sign</h3>
          <p className="text-xs opacity-60 mb-4">
            {labelsMeta.source === 'model'
              ? 'Only signs the trained model supports can be practised.'
              : 'All catalog signs are available with the current classifier.'}
          </p>
          {MODULES.map((m) => (
            <div key={m.key} className="mb-4">
              <p className="text-xs uppercase tracking-wide opacity-60 mb-2">{m.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.items.map((item) => {
                  const sup = isSupported(item)
                  const selected = target === item
                  return (
                    <button
                      key={item}
                      onClick={() => setTarget(item)}
                      disabled={!sup}
                      title={sup ? 'Practice this sign' : 'Not in the current model'}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selected
                          ? 'bg-brand-gradient text-white border-transparent'
                          : sup
                            ? 'glass hover:opacity-80'
                            : 'bg-white/5 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Practice area */}
        <div className="space-y-6">
          {!target ? (
            <div className="glass rounded-2xl p-10 text-center opacity-70">
              <FiChevronRight className="text-4xl mx-auto mb-3" />
              <p>Select a sign on the left to start practising.</p>
            </div>
          ) : (
            <>
              {/* Target card */}
              <div className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-brand-gradient flex items-center justify-center font-display font-bold text-white text-2xl shrink-0">
                  {target.length > 3 ? target[0] : target}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold">Target: {target}</h3>
                  <p className="text-xs opacity-60 mt-1">Speak the target aloud if helpful, then perform the sign.</p>
                </div>
              </div>
<div className="flex flex-wrap gap-2">
                  <button onClick={() => setShowViewer(true)} className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold">
                    <FiImage /> View reference
                  </button>
                  {!active ? (
                    <button onClick={startCamera} className="flex items-center gap-1 px-3 py-2 rounded-full bg-brand-gradient text-white text-xs font-semibold">
                      <FiCamera /> Start Camera
                    </button>
                  ) : (
                    <button onClick={stopCamera} className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold">
                      <FiCameraOff /> Stop
                    </button>
                  )}
                  <button onClick={pickNext} className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold">
                    Next Sign
                  </button>
                </div>

                {/* Camera + live recognition */}
                <div className="glass rounded-2xl p-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="rounded-xl bg-black/30 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
                      {active ? (
                        <canvas ref={canvasRef} className="w-full rounded-xl" />
                      ) : (
                        <div className="text-center opacity-60 p-6">
                          <FiCamera className="text-4xl mx-auto mb-2" />
                          <p className="text-sm">Start the camera and perform the {target} sign.</p>
                          <button onClick={switchCamera} className="mt-3 px-3 py-1 rounded-full glass text-xs font-semibold">
                            Use {facingMode === 'user' ? 'back' : 'front'} camera
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold opacity-80">Live Recognition</h4>
                      <div className={`text-4xl font-display font-extrabold ${liveLabel === 'UNKNOWN' ? 'text-coral' : 'text-gradient'}`}>
                        {active ? liveLabel || '…' : '—'}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {liveStatus && active && <RecognitionStatus status={liveStatus} />}
                        {liveStatus && liveResult?.sign && (
                          <div className="min-w-[160px]"><ConfidenceIndicator level={liveStatus.level} value={liveStatus.value} /></div>
                        )}
                      </div>
                      <p className="text-xs opacity-60">{fps} FPS{active && !handDetected ? ' · position your hand in frame' : ''}</p>
                      {liveStatus && liveResult?.sign && <UnknownSignAlert status={liveStatus} />}
                      {liveMatch && (
                        <p className="flex items-center gap-1.5 text-sm text-teal-light border border-teal/40 bg-teal/10 rounded-lg px-3 py-2">
                          <FiCheckCircle className="shrink-0" /> Looking correct! Press <strong>Check Signature</strong> to record this attempt.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCheck}
                    disabled={checking || !active}
                    className="mt-5 w-full py-3 rounded-full bg-brand-gradient text-white font-semibold disabled:opacity-40"
                  >
                    {checking ? 'Recording attempt…' : 'Check Signature'}
                  </button>
                </div>
{/* Feedback */}
                {attempts.length > 0 && (
                  <div className="glass rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-display font-semibold">Feedback</h4>
                      <button onClick={handleClearAttempts} className="px-3 py-1 rounded-full glass text-xs font-semibold text-coral">
                        Clear attempts
                      </button>
                    </div>

                    <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                      lastAttempt.result === 'correct'
                        ? 'border-teal/40 bg-teal/10'
                        : lastAttempt.result === 'incorrect'
                          ? 'border-coral/40 bg-coral/10'
                          : 'border-white/10 bg-black/20'
                    }`}>
                      <div className="text-2xl shrink-0">
                        {lastAttempt.result === 'correct' ? '✅' : lastAttempt.result === 'incorrect' ? '❌' : '⚠️'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {lastAttempt.result === 'correct'
                            ? 'Correct!'
                            : lastAttempt.result === 'incorrect'
                              ? 'Try Again'
                              : 'Sign unclear'}
                        </p>
                        <p className="text-xs opacity-80 mt-1">{feedbackFor(lastAttempt.result, target, lastAttempt.detected, lastAttempt.confidence)}</p>
                        <p className="text-xs opacity-60 mt-1">
                          Detected: {lastAttempt.detected} · Confidence:{' '}
                          {lastAttempt.confidence > 0 ? `${Math.round(lastAttempt.confidence * 100)}%` : 'unavailable'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-black/20 p-3">
                        <p className="text-2xl font-display font-bold text-gradient">{attempts.length}</p>
                        <p className="text-[10px] uppercase tracking-wide opacity-60">Attempts</p>
                      </div>
                      <div className="rounded-xl bg-black/20 p-3">
                        <p className="text-2xl font-display font-bold text-teal-light">{correctCount}</p>
                        <p className="text-[10px] uppercase tracking-wide opacity-60">Correct</p>
                      </div>
                      <div className="rounded-xl bg-black/20 p-3">
                        <p className="text-2xl font-display font-bold text-indigoAccent-light">{score !== null ? `${score}%` : '—'}</p>
                        <p className="text-[10px] uppercase tracking-wide opacity-60">Score</p>
                      </div>
                    </div>

                    {saveError && (
                      <p className="text-xs text-coral border border-coral/30 bg-coral/10 rounded-lg px-3 py-2">{saveError}</p>
                    )}

                    {attempts.length > 1 && (
                      <div>
                        <h5 className="text-xs uppercase tracking-wide opacity-60 mb-2">Recent attempts</h5>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {attempts.slice(-MAX_ATTEMPTS_SHOWN).reverse().map((a, i) => (
                            <div key={`${a.time}-${i}`} className="flex justify-between text-xs opacity-80 border-b border-white/5 py-1">
                              <span>{a.detected}</span>
                              <span>{a.confidence > 0 ? `${Math.round(a.confidence * 100)}%` : 'n/a'} · {a.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Reference image viewer */}
      {showViewer && target && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setShowViewer(false)}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowViewer(false)} className="absolute top-3 right-3 p-2 rounded-full glass" aria-label="Close reference">
              <FiX />
            </button>
            <h3 className="font-display text-2xl font-bold mb-1">{target}</h3>
            <p className="text-xs opacity-60 mb-4">ISL reference for the {target} sign.</p>
            <img
              src={publicImageSrc(target)}
              alt={`ISL sign for ${target}`}
              className="w-full max-h-72 object-contain rounded-xl mb-4 bg-black/20"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <button onClick={() => speak(target, { voiceGender: 'female' })} className="px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold">
              🔊 Hear it again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}