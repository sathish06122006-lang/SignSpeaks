import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem('ss_theme') || 'dark')
  const [largeText, setLargeText] = useState(localStorage.getItem('ss_large_text') === 'true')
  const [highContrast, setHighContrast] = useState(localStorage.getItem('ss_high_contrast') === 'true')

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light')
    localStorage.setItem('ss_theme', theme)
  }, [theme])

  useEffect(() => {
    document.body.classList.toggle('large-text', largeText)
    localStorage.setItem('ss_large_text', largeText)
  }, [largeText])

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
    localStorage.setItem('ss_high_contrast', highContrast)
  }, [highContrast])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, largeText, setLargeText, highContrast, setHighContrast }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
