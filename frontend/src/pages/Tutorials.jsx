import { useEffect, useState } from 'react'
import api from '../utils/api'
 
const CATEGORIES = ['All', 'Beginner', 'Intermediate', 'Advanced']
 
// Fallback demo tutorials shown if the admin hasn't uploaded any yet —
// so the page never looks empty on a fresh install.
const DEMO_TUTORIALS = [
  { _id: 'demo1', title: 'ISL Alphabet Basics', category: 'Beginner', video_id: '5yYbIEF_L0U' },
  { _id: 'demo2', title: 'Numbers in ISL', category: 'Beginner', video_id: 'NBRlKdNC6Jk' },
  { _id: 'demo3', title: 'Everyday Conversations', category: 'Intermediate', video_id: 'NBRlKdNC6Jk' },
  { _id: 'demo4', title: 'Advanced Storytelling in ISL', category: 'Advanced', video_id: 'Vj_13bdU4dU' },
].map((t) => ({ ...t, youtube_url: `https://www.youtube.com/embed/${t.video_id}` }))
 
function VideoEmbed({ videoId, url, title }) {
  const [failed, setFailed] = useState(false)
  const id = videoId || (url && url.split('/embed/')[1])
 
  if (failed || !id) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/30">
        <p className="text-sm opacity-70">Preview unavailable</p>
        <a
          href={id ? `https://www.youtube.com/watch?v=${id}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs px-3 py-1.5 rounded-full bg-brand-gradient text-white font-semibold"
        >
          Watch on YouTube
        </a>
      </div>
    )
  }
 
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title={title}
      className="w-full h-full"
      allowFullScreen
      onError={() => setFailed(true)}
    />
  )
}
 
export default function Tutorials() {
  const [tutorials, setTutorials] = useState(DEMO_TUTORIALS)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [recentlyWatched, setRecentlyWatched] = useState(
    JSON.parse(localStorage.getItem('ss_recent_tutorials') || '[]')
  )
 
  useEffect(() => {
    api
      .get('/api/tutorials', { params: { category: category === 'All' ? undefined : category, search: search || undefined } })
      .then(({ data }) => {
        if (data && data.length) setTutorials(data)
      })
      .catch(() => {})
  }, [category, search])
 
  const filtered = tutorials.filter((t) => {
    const matchesCategory = category === 'All' || t.category === category
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })
 
  const watchTutorial = (t) => {
    const updated = [t, ...recentlyWatched.filter((r) => r._id !== t._id)].slice(0, 4)
    setRecentlyWatched(updated)
    localStorage.setItem('ss_recent_tutorials', JSON.stringify(updated))
  }
 
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Tutorials</h1>
      <p className="opacity-70 mb-8">Curated ISL video lessons, organized by skill level.</p>
 
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tutorials…"
          className="glass rounded-full px-4 py-2 text-sm outline-none flex-1 min-w-[200px]"
        />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              category === c ? 'bg-brand-gradient text-white' : 'glass opacity-80'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
 
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {filtered.map((t) => (
          <div key={t._id} onClick={() => watchTutorial(t)} className="glass rounded-2xl overflow-hidden cursor-pointer">
            <div className="aspect-video">
              <VideoEmbed videoId={t.video_id} url={t.youtube_url} title={t.title} />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-xs opacity-60">{t.category}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="opacity-60 col-span-full">No tutorials match your search.</p>}
      </div>
 
      {recentlyWatched.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display font-semibold mb-3">Recently Watched</h3>
          <div className="flex gap-3 overflow-x-auto">
            {recentlyWatched.map((t) => (
              <div key={t._id} className="glass rounded-xl px-4 py-3 text-sm min-w-[180px]">
                {t.title}
              </div>
            ))}
          </div>
        </div>
      )}
 
      <div>
        <h3 className="font-display font-semibold mb-3">Recommended for You</h3>
        <div className="flex gap-3 overflow-x-auto">
          {DEMO_TUTORIALS.slice(0, 3).map((t) => (
            <div key={t._id} className="glass rounded-xl px-4 py-3 text-sm min-w-[180px]">
              {t.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}