import { FiHelpCircle } from 'react-icons/fi'
import { STATUS } from '../config/recognition'

/**
 * Reusable confidence bar. `level` and `value` come from
 * ConfidenceService.classifyConfidence(). When confidence is unavailable,
 * an honest "Confidence unavailable" state is rendered instead of a number.
 */
const BAR_COLORS = {
  high: { track: 'bg-brandGreen/20', fill: 'bg-brandGreen' },
  medium: { track: 'bg-coral/20', fill: 'bg-coral' },
  low: { track: 'bg-coralDeep/20', fill: 'bg-coralDeep' },
  none: { track: 'bg-ivory/10', fill: 'bg-ivory/40' },
}

export default function ConfidenceIndicator({ level, value }) {
  if (level === STATUS.UNAVAILABLE || value === null || value === undefined) {
    return (
      <div className="flex items-center gap-2 text-sm opacity-70" title="The current model returned no confidence score.">
        <FiHelpCircle className="shrink-0" />
        <span>Confidence unavailable</span>
      </div>
    )
  }

  const colors = BAR_COLORS[level] || BAR_COLORS.none
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="opacity-70">Confidence</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className={`h-2 w-full rounded-full ${colors.track}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Confidence ${pct}%`}>
        <div className={`h-full rounded-full ${colors.fill} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}