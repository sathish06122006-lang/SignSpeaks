import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import LogoMark from './LogoMark'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 glass shadow-glass">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <LogoMark />
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <button
            aria-label="Toggle dark and light mode"
            onClick={toggleTheme}
            className="p-2 rounded-full btn-secondary"
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium opacity-90 hover:text-violet">
                {user.name?.split(' ')[0]}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium opacity-90 hover:text-violet">
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="px-4 py-2 text-sm btn-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium opacity-90 hover:text-violet">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm btn-primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-2xl text-ivory" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden px-6 pb-4 flex flex-col gap-3"
          >
            <button onClick={toggleTheme} className="text-sm font-medium opacity-90 text-left">
              Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Profile
                </Link>
                <button onClick={logout} className="text-sm font-semibold text-coral text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="text-sm font-semibold text-coral">
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
