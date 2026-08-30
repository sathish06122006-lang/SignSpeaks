import { FiCheckCircle, FiInfo, FiAlertTriangle, FiHelpCircle } from 'react-icons/fi'
import { STATUS, STATUS_META } from '../config/recognition'

/**
 * Reusable recognition-status chip. `status` is the object returned by
 * ConfidenceService.classifyConfidence(). Shows High / Medium / Low /
 * No hand detected / Confidence unavailable states with brand colours.
 */
const ICONS = {
  check: FiCheckCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
  help: FiHelpCircle,
}

const CHIP_COLORS = {
  high: 'bg-teal/20 text-teal-light border-teal/40',
  medium: 'bg-indigoAccent/20 text-indigoAccent-light border-indigoAccent/40',
  low: 'bg-coral/20 text-coral border-coral/40',
  none: 'bg-white/10 opacity-70 border-white/10',
}

const buildEmptyStatus = () => ({ level: STATUS.EMPTY, ...STATUS_META[STATUS.EMPTY] })

export default function RecognitionStatus({ status = buildEmptyStatus() }) {
  const Icon = ICONS[status?.icon] || FiHelpCircle
  const chip = CHIP_COLORS[status?.color] || CHIP_COLORS.none
  const label = status?.label || '—'

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${chip}`}>
      <Icon className="shrink-0" />
      {label}
    </span>
  )
}