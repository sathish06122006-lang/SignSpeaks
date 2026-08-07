import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [done, setDone] = useState(false)

  const requestReset = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/api/auth/forgot-password', { email })
    setMessage(data.message)
    if (data.reset_token) setResetToken(data.reset_token)
  }

  const submitReset = async (e) => {
    e.preventDefault()
    await api.post('/api/auth/reset-password', { token: resetToken, new_password: newPassword })
    setDone(true)
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold mb-6 text-center">Reset Password</h1>

        {!resetToken && (
          <form onSubmit={requestReset} className="space-y-4">
            <div>
              <label className="text-sm opacity-80">Account Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-brand-gradient text-white font-semibold">
              Send Reset Link
            </button>
            {message && <p className="text-sm text-teal-light">{message}</p>}
          </form>
        )}

        {resetToken && !done && (
          <form onSubmit={submitReset} className="space-y-4">
            <p className="text-xs opacity-60">
              Demo mode: since no SMTP provider is configured offline, use the generated token below
              directly instead of checking email.
            </p>
            <div>
              <label className="text-sm opacity-80">New Password</label>
              <input
                type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-brand-gradient text-white font-semibold">
              Update Password
            </button>
          </form>
        )}

        {done && (
          <p className="text-sm text-teal-light text-center">
            Password updated. <Link to="/login" className="font-semibold underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
