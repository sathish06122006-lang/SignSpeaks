import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm opacity-80">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
            />
          </div>
          {error && <p className="text-coral text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-brand-gradient text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm opacity-80">
          <Link to="/forgot-password" className="hover:text-teal-light">Forgot password?</Link>
          <Link to="/signup" className="hover:text-teal-light">Create account</Link>
        </div>
      </div>
    </div>
  )
}
