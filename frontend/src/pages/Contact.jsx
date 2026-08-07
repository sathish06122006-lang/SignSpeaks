import { useState } from 'react'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import api from '../utils/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/contact', form)
      setStatus(data.message)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('Something went wrong. Please try again later.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display text-3xl font-bold mb-4">Contact Us</h1>
        <p className="opacity-70 mb-8">Questions, feedback, or partnership ideas — we'd love to hear from you.</p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 opacity-80"><FiMail /> contact@signspeaks.app</div>
          <div className="flex items-center gap-3 opacity-80"><FiPhone /> +91 98765 43210</div>
          <div className="flex items-center gap-3 opacity-80"><FiMapPin /> Chennai, Tamil Nadu, India</div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <iframe
            title="Location map"
            src="https://www.google.com/maps?q=Chennai,India&output=embed"
            className="w-full h-64 border-0"
            loading="lazy"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4 h-fit">
        <h2 className="font-display text-xl font-semibold mb-2">Send Feedback</h2>
        <div>
          <label className="text-sm opacity-80">Name</label>
          <input
            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
          />
        </div>
        <div>
          <label className="text-sm opacity-80">Email</label>
          <input
            type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
          />
        </div>
        <div>
          <label className="text-sm opacity-80">Message</label>
          <textarea
            required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full mt-1 rounded-xl bg-black/20 px-4 py-2 outline-none"
          />
        </div>
        <button type="submit" className="w-full py-3 rounded-full bg-brand-gradient text-white font-semibold">
          Submit
        </button>
        {status && <p className="text-teal-light text-sm text-center">{status}</p>}
      </form>
    </div>
  )
}
