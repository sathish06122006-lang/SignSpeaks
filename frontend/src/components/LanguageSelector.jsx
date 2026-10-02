import { SUPPORTED_LANGUAGES } from '../services/TranslationService'

/**
 * Reusable EN 🇬🇧 / Tamil 🇮🇳 / Hindi 🇮🇳 selector. Keyboard-accessible
 * radio group using the existing pill button style.
 */
export default function LanguageSelector({ value = 'en', onChange }) {
  return (
    <div role="radiogroup" aria-label="Translation language" className="flex flex-wrap gap-2">
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l.code}
          role="radio"
          aria-checked={value === l.code}
          onClick={() => onChange(l.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
            value === l.code
              ? 'bg-coral/25 border-coral text-ivory'
              : 'glass opacity-80 hover:opacity-100'
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}