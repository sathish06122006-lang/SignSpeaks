import { FiAlertTriangle, FiHelpCircle } from 'react-icons/fi'
import { STATUS } from '../config/recognition'

/**
 * Reusable alert shown when a recognition is unclear (Low Confidence /
 * Unknown sign) or when the model could not supply confidence. Reduces to
 * null for any healthy (High/Medium) state.
 */
export default function UnknownSignAlert({ status }) {
  if (!status) return null
  const isUnknown = status.level === STATUS.LOW
  const isUnavailable = status.level === STATUS.UNAVAILABLE
  if (!isUnknown && !isUnavailable) return null

  const detail = status.detail || (isUnknown
    ? 'Sign unclear. Please try again — hold the hand shape steady.'
    : 'The current model returned no confidence score for this prediction.')

  return (
    <div role="alert" className="rounded-xl border border-coral/40 bg-coral/10 p-3 space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-coral">
        {isUnknown ? <FiAlertTriangle aria-hidden /> : <FiHelpCircle aria-hidden />}
        {isUnknown ? '⚠️ Sign unclear / Unknown sign' : '⚠️ Confidence unavailable'}
      </div>
      <p className="text-xs opacity-80">{detail}</p>
    </div>
  )
}