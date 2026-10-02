import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LogoMark from '../components/LogoMark'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/my-progress')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="flex justify-center mb-6"><LogoMark /></div>
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold mb-6 text-center">Create Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm opacity-80">Full Name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 rounded-xl bg-ink/40 px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 rounded-xl bg-ink/40 px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 rounded-xl bg-ink/40 px-4 py-2 outline-none"
            />
          </div>
          {error && <p className="text-coralDeep text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 btn-primary disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm opacity-80 mt-4 text-center">
          Already have an account? <Link to="/login" className="hover:text-violet font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  )
}
