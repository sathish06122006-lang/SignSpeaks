import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferred_language || 'English')
  const [saved, setSaved] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    const { data } = await api.put('/api/auth/me', { name, preferred_language: preferredLanguage })
    setUser(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold mb-6">My Profile</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm opacity-80">Full Name</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 rounded-xl bg-ink/40 px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Email</label>
            <input
              disabled value={user?.email}
              className="w-full mt-1 rounded-xl bg-ink/30 px-4 py-2 outline-none opacity-60"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Preferred Translation Language</label>
            <select
              value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full mt-1 rounded-xl bg-ink/40 px-4 py-2 outline-none"
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 btn-primary">
            Save Changes
          </button>
          {saved && <p className="text-brandGreen text-sm text-center">Profile updated.</p>}
        </form>
        <button onClick={logout} className="w-full mt-4 py-3 btn-secondary text-coralDeep">
          Logout
        </button>
      </div>
    </div>
  )
}
