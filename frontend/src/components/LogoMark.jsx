const TONE_CLASS = {
  ivory: 'text-ivory',
  coral: 'text-coral',
}

/**
 * Reusable brand logo — spinning conic-gradient ring (coral → violet →
 * green) behind the logo mark, paired with the Fraunces wordmark.
 * Used everywhere the logo appears (Navbar, footer, auth pages…).
 * Renders as plain markup; wrap in a <Link> where navigation is needed.
 */
export default function LogoMark({ tone = 'ivory' }) {
  return (
    <span className="flex items-center gap-2">
      <span className="logo-ring" aria-hidden="true">
        <span className="logo-mark">S</span>
      </span>
      <span className={`font-display font-bold text-xl ${TONE_CLASS[tone] || TONE_CLASS.ivory}`}>Sign Speaks</span>
    </span>
  )
}