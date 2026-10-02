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
  high: 'bg-brandGreen/20 text-brandGreen border-brandGreen/40',
  medium: 'bg-coral/20 text-coral border-coral/40',
  low: 'bg-coralDeep/20 text-coralDeep border-coralDeep/40',
  none: 'bg-ivory/10 opacity-80 border-ivory/15',
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