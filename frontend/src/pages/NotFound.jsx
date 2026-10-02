import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <h1 className="font-display text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="opacity-70 mb-8">This page hasn't been signed into existence yet.</p>
      <Link to="/" className="px-6 py-3 btn-primary">
        Back to Home
      </Link>
    </div>
  )
}
