import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <h1 className="font-display text-6xl font-extrabold text-gradient mb-4">404</h1>
      <p className="opacity-70 mb-8">This page hasn't been signed into existence yet.</p>
      <Link to="/" className="px-6 py-3 rounded-full bg-brand-gradient text-white font-semibold">
        Back to Home
      </Link>
    </div>
  )
}
