import { useState } from 'react'
import { FiSettings, FiX } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { speak } from '../utils/speech'

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme, largeText, setLargeText, highContrast, setHighContrast } = useTheme()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-64 glass rounded-2xl p-4 shadow-glass" role="dialog" aria-label="Accessibility settings">
          <h4 className="font-display font-semibold mb-3">Accessibility</h4>
          <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center justify-between">
              <span>Dark / Light mode</span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 text-xs btn-primary"
              >
                {theme === 'dark' ? 'Dark' : 'Light'}
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span>Large text</span>
              <input
                type="checkbox"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
                aria-label="Toggle large text"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>High contrast</span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                aria-label="Toggle high contrast"
              />
            </label>
            <button
              onClick={() =>
                speak(
                  'Accessibility panel open. You can toggle dark mode, large text, and high contrast here.'
                )
              }
              className="mt-1 text-xs font-semibold text-violet hover:text-ivory text-left"
            >
              🔊 Read this panel aloud
            </button>
            <p className="text-xs opacity-60">
              Full keyboard navigation is supported — use Tab and Enter throughout the site.
            </p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open accessibility settings"
        className="w-12 h-12 btn-primary flex items-center justify-center shadow-glass text-xl"
      >
        {open ? <FiX /> : <FiSettings />}
      </button>
    </div>
  )
}
