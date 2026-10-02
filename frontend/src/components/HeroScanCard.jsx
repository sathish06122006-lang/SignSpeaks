import { useEffect, useRef, useState } from 'react'
import './HeroScanCard.css'

/**
 * Hero visual — "particle-scan" hand landmark visualization that behaves
 * like a live computer-vision detector:
 *  - 21 real MediaPipe hand-landmark topology (wrist + 5 x 4 joints)
 *  - cycles poses A (fist) / B (open palm) / K (V) every 2.4s
 *  - auto-rotates in 3D (rotateY 0->360deg / 9s, constant rotateX tilt)
 *  - scanning line + violet tech-grid + solid ink2 card
 *  - mouse-hover 3D tilt (+-20deg), cycling outer glow (6s)
 * Pure visual/presentational component — no copy or navigation.
 */
const POSE_ORDER = ['A', 'B', 'K']

// 21 hand landmarks, MediaPipe ordering: wrist (0), thumb (1-4),
// index (5-8), middle (9-12), ring (13-16), pinky (17-20).
// Coordinates are hand-designed for the normalized viewBox 100 x 110.
const HAND_POSES = {
  B: [
    [50, 96], [41, 88], [32, 82], [25, 76], [20, 70],
    [43, 60], [43, 42], [43, 31], [43, 22],
    [50, 58], [50, 37], [50, 25], [50, 15],
    [57, 60], [57, 42], [57, 31], [57, 22],
    [64, 62], [64, 47], [64, 38], [64, 31],
  ], // B — open flat palm
  A: [
    [50, 96], [41, 88], [31, 83], [24, 78], [18, 72],
    [43, 62], [41, 68], [42, 73], [44, 75],
    [50, 60], [49, 67], [50, 72], [51, 75],
    [57, 60], [58, 66], [58, 71], [57, 74],
    [64, 62], [64, 64], [63, 66], [62, 68],
  ], // A — closed fist
  K: [
    [50, 96], [41, 88], [32, 83], [26, 78], [21, 73],
    [43, 60], [39, 41], [37, 29], [35, 19],
    [50, 58], [55, 37], [57, 24], [58, 13],
    [57, 60], [56, 66], [55, 70], [55, 72],
    [64, 62], [63, 64], [62, 66], [61, 67],
  ], // K — index + middle extended in a V
}

// MediaPipe HAND_CONNECTIONS — 24 edges (wrist fan + metacarpal joins + phalanges).
const EDGES = [
  [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
  [1, 2], [2, 3], [3, 4],
  [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
]

const FINGERTIPS = new Set([4, 8, 12, 16, 20])

export default function HeroScanCard() {
  const [poseIdx, setPoseIdx] = useState(1)
  const [confidence, setConfidence] = useState(94)
  const cardRef = useRef(null)

  // Pose cycle every 2.4s + confidence refresh (random 90-98%).
  useEffect(() => {
    const timer = setInterval(() => {
      setPoseIdx((p) => (p + 1) % POSE_ORDER.length)
      setConfidence(Math.min(98, 90 + Math.round(Math.random() * 8)))
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  // 3D hover tilt — +-20deg from card center, smooth, resets on leave.
  const handleTiltMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5 // -0.5 .. 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `rotateX(${(-py * 40).toFixed(1)}deg) rotateY(${(px * 40).toFixed(1)}deg)`
  }

  const handleTiltLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'none'
  }

  const pose = HAND_POSES[POSE_ORDER[poseIdx]]

  return (
    <div
      ref={cardRef}
      className="hero-card"
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
    >
      <div className="hero-scan">
        {/* tech grid + scanning line (behind the skeleton) */}
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-scanline" aria-hidden="true" />
        {/* 3D auto-rotating skeleton */}
        <div className="hero-skeleton-spin" aria-hidden="true">
          <svg
            viewBox="0 0 100 110"
            className="hero-svg"
            fill="none"
            role="img"
            aria-label="Animated hand landmark visualization cycling through sign poses A, B, K"
          >
            {EDGES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={pose[a][0]}
                y1={pose[a][1]}
                x2={pose[b][0]}
                y2={pose[b][1]}
                className="hero-edge"
              />
            ))}
            {pose.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === 0 ? 3.2 : 1.9}
                className={i === 0 ? 'hero-node-wrist' : FINGERTIPS.has(i) ? 'hero-node-tip' : 'hero-node-mid'}
              />
            ))}
          </svg>
        </div>
        {/* labels — on solid/semi-opaque chips, never directly over the grid */}
        <span className="hero-badge" aria-hidden="true">{POSE_ORDER[poseIdx]}</span>
        <span className="hero-pts" aria-hidden="true">21 pts</span>
        <span className="hero-pill" aria-hidden="true">{confidence}%</span>
      </div>
    </div>
  )
}