import { useEffect, useState } from 'react'
import api from '../utils/api'

const TABS = ['Analytics', 'Users', 'Tutorials', 'Categories', 'Model Upload']

export default function AdminPanel() {
  const [tab, setTab] = useState('Analytics')

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="opacity-70 mb-8">Manage tutorials, users, categories, and the detection model.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              tab === t ? 'bg-brand-gradient text-white' : 'glass opacity-80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Analytics' && <AnalyticsTab />}
      {tab === 'Users' && <UsersTab />}
      {tab === 'Tutorials' && <TutorialsTab />}
      {tab === 'Categories' && <CategoriesTab />}
      {tab === 'Model Upload' && <ModelUploadTab />}
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState(null)
  useEffect(() => {
    api.get('/api/admin/analytics').then(({ data }) => setData(data)).catch(() => setData({ total_users: 0, total_detections: 0, category_breakdown: [] }))
  }, [])
  if (!data) return null
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="glass rounded-2xl p-5">
        <p className="text-xs opacity-60">Total Users</p>
        <p className="text-3xl font-display font-bold text-gradient">{data.total_users}</p>
      </div>
      <div className="glass rounded-2xl p-5">
        <p className="text-xs opacity-60">Total Detections</p>
        <p className="text-3xl font-display font-bold text-gradient">{data.total_detections}</p>
      </div>
      <div className="glass rounded-2xl p-5 sm:col-span-1">
        <p className="text-xs opacity-60 mb-2">By Category</p>
        {data.category_breakdown.map((c) => (
          <div key={c.category} className="flex justify-between text-sm opacity-80">
            <span>{c.category}</span><span>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const load = () => api.get('/api/admin/users').then(({ data }) => setUsers(data)).catch(() => setUsers([]))
  useEffect(() => { load() }, [])

  const removeUser = async (id) => {
    if (!confirm('Remove this user?')) return
    await api.delete(`/api/admin/users/${id}`)
    load()
  }

  return (
    <div className="glass rounded-2xl p-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left opacity-60 border-b border-white/10">
            <th className="py-2">Name</th><th>Email</th><th>Role</th><th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-white/5">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => removeUser(u._id)} className="text-coral text-xs font-semibold">Remove</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td className="py-4 opacity-60" colSpan={4}>No users found.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function TutorialsTab() {
  const [tutorials, setTutorials] = useState([])
  const [form, setForm] = useState({ title: '', youtube_url: '', category: 'Beginner', description: '' })
  const load = () => api.get('/api/tutorials').then(({ data }) => setTutorials(data)).catch(() => setTutorials([]))
  useEffect(() => { load() }, [])

  const addTutorial = async (e) => {
    e.preventDefault()
    await api.post('/api/admin/tutorials', form)
    setForm({ title: '', youtube_url: '', category: 'Beginner', description: '' })
    load()
  }
  const removeTutorial = async (id) => {
    await api.delete(`/api/admin/tutorials/${id}`)
    load()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={addTutorial} className="glass rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-semibold">Upload Tutorial</h3>
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl bg-black/20 px-4 py-2 outline-none" />
        <input required placeholder="YouTube embed URL" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className="w-full rounded-xl bg-black/20 px-4 py-2 outline-none" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl bg-black/20 px-4 py-2 outline-none">
          <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl bg-black/20 px-4 py-2 outline-none" />
        <button type="submit" className="w-full py-2 rounded-full bg-brand-gradient text-white font-semibold">Add Tutorial</button>
      </form>

      <div className="glass rounded-2xl p-5 space-y-2 max-h-96 overflow-y-auto">
        <h3 className="font-display font-semibold mb-2">Existing Tutorials</h3>
        {tutorials.map((t) => (
          <div key={t._id} className="flex justify-between items-center text-sm border-b border-white/5 py-2">
            <span>{t.title} <span className="opacity-50">({t.category})</span></span>
            <button onClick={() => removeTutorial(t._id)} className="text-coral text-xs font-semibold">Remove</button>
          </div>
        ))}
        {tutorials.length === 0 && <p className="opacity-60 text-sm">No tutorials uploaded yet.</p>}
      </div>
    </div>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const load = () => api.get('/api/categories').then(({ data }) => setCategories(data)).catch(() => setCategories([]))
  useEffect(() => { load() }, [])

  const addCategory = async (e) => {
    e.preventDefault()
    await api.post('/api/admin/categories', { name, description: '' })
    setName('')
    load()
  }
  const removeCategory = async (id) => {
    await api.delete(`/api/admin/categories/${id}`)
    load()
  }

  return (
    <div className="glass rounded-2xl p-5 max-w-md space-y-3">
      <h3 className="font-display font-semibold">Manage Categories</h3>
      <form onSubmit={addCategory} className="flex gap-2">
        <input required placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 rounded-xl bg-black/20 px-4 py-2 outline-none" />
        <button type="submit" className="px-4 py-2 rounded-full bg-brand-gradient text-white text-sm font-semibold">Add</button>
      </form>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c._id} className="flex justify-between items-center text-sm border-b border-white/5 py-2">
            <span>{c.name}</span>
            <button onClick={() => removeCategory(c._id)} className="text-coral text-xs font-semibold">Remove</button>
          </div>
        ))}
        {categories.length === 0 && <p className="opacity-60 text-sm">No categories yet.</p>}
      </div>
    </div>
  )
}

function ModelUploadTab() {
  const [file, setFile] = useState(null)
  const [models, setModels] = useState([])
  const [status, setStatus] = useState('')

  const load = () => api.get('/api/admin/models').then(({ data }) => setModels(data)).catch(() => setModels([]))
  useEffect(() => { load() }, [])

  const upload = async (e) => {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/api/admin/models/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    setStatus(`Uploaded ${file.name}`)
    setFile(null)
    load()
  }

  return (
    <div className="glass rounded-2xl p-5 max-w-md space-y-3">
      <h3 className="font-display font-semibold">Upload New CNN Model</h3>
      <p className="text-xs opacity-60">
        Stores the model file and metadata. Swap it into the live detection pipeline by pointing
        <code className="mx-1 opacity-80">mock_cnn.py</code> at the saved file path.
      </p>
      <form onSubmit={upload} className="space-y-3">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm" />
        <button type="submit" className="w-full py-2 rounded-full bg-brand-gradient text-white font-semibold">Upload</button>
      </form>
      {status && <p className="text-teal-light text-sm">{status}</p>}
      <div className="space-y-1 pt-2">
        {models.map((m) => (
          <div key={m._id} className="text-sm opacity-80 flex justify-between border-b border-white/5 py-1">
            <span>{m.filename}</span>
            <span>{(m.size_bytes / 1024).toFixed(1)} KB</span>
          </div>
        ))}
      </div>
    </div>
  )
}
