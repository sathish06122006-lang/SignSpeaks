import { useEffect, useRef, useState, useCallback } from 'react'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { HAND_CONNECTIONS } from '@mediapipe/hands'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { classifyLandmarks } from '../utils/mockDetection'

/**
 * Runs MediaPipe Hands entirely client-side (no external API calls).
 * Tracks up to two hands (for two-handed signs), draws both skeletons
 * onto `canvasRef`, and reports a quick client-side mock prediction +
 * FPS via state. `hands` is the structured list you send to the backend
 * for real prediction: [{ handedness: "Right"|"Left", landmarks: [...] }]
 */
export function useMediaPipeHands({ videoRef, canvasRef, active, maxHands = 2 }) {
  const [handDetected, setHandDetected] = useState(false)
  const [hands, setHands] = useState([]) // [{ handedness, landmarks }]
  const [prediction, setPrediction] = useState({ sign: null, confidence: 0, category: null })
  const [fps, setFps] = useState(0)
  const [error, setError] = useState(null) // camera permission / availability failure
  const cameraRef = useRef(null)
  const lastFrameTime = useRef(performance.now())

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = results.image.width
    canvas.height = results.image.height
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    const now = performance.now()
    setFps(Math.round(1000 / (now - lastFrameTime.current)))
    lastFrameTime.current = now

    const detectedHands = results.multiHandLandmarks || []
    const handednessInfo = results.multiHandedness || []

    if (detectedHands.length > 0) {
      setHandDetected(true)
      const structured = detectedHands.map((landmarks, i) => {
        const label = handednessInfo[i]?.label || (i === 0 ? 'Right' : 'Left')
        const color = label === 'Right' ? '#5EEAD4' : '#A5B4FC'
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color, lineWidth: 3 })
        drawLandmarks(ctx, landmarks, { color: '#FB7185', lineWidth: 1, radius: 3 })
        return { handedness: label, landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z || 0 })) }
      })
      setHands(structured)
      // Quick client-side visual feedback using the first detected hand;
      // the authoritative prediction comes from the backend classifier.
      setPrediction(classifyLandmarks(detectedHands[0]))
    } else {
      setHandDetected(false)
      setHands([])
      setPrediction({ sign: null, confidence: 0, category: null })
    }
    ctx.restore()
  }, [canvasRef])

  useEffect(() => {
    if (!active || !videoRef.current) return

    const handsModel = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })
    handsModel.setOptions({
      maxNumHands: maxHands,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })
    handsModel.onResults(onResults)

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await handsModel.send({ image: videoRef.current })
      },
      width: 640,
      height: 480,
    })

    // Some browsers throw (permission denied / no device). Surface a
    // meaningful message instead of leaving the page silently broken.
    setError(null)
    camera
      .start()
      .then(() => {
        cameraRef.current = camera
      })
      .catch((err) => {
        console.warn('[useMediaPipeHands] Camera failed to start:', err)
        setError(
          'Camera permission denied or camera unavailable. Please allow camera access and try again.'
        )
      })

    return () => {
      try {
        camera.stop()
      } catch {
        // camera never started — nothing to stop
      }
      handsModel.close()
    }
  }, [active, onResults, videoRef, maxHands])

  return { handDetected, hands, prediction, fps, error }
}
