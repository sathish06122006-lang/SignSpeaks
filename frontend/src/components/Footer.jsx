import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-gradient mb-2">Sign Speaks</h3>
          <p className="opacity-70">
            Bridging communication through artificial intelligence and Indian Sign Language.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Explore</h4>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/live-detection">Live Detection</Link></li>
            <li><Link to="/learn">Learn ISL</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Project</h4>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Team Limitless</h4>
          <p className="opacity-70">Gowthaami SM · Jeevasri J · Sathish Kumar S</p>
          <p className="opacity-70">Mentor: Ms. Ramani</p>
        </div>
      </div>
      <div className="text-center text-xs opacity-50 pb-6">
        © {new Date().getFullYear()} Sign Speaks. Built by Team Limitless.
      </div>
    </footer>
  )
}
