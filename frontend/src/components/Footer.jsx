export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm">
        <h3 className="font-display font-bold text-lg text-gradient mb-2">Sign Speaks</h3>
        <p className="opacity-70">
          Bridging communication through artificial intelligence and Indian Sign Language.
        </p>
      </div>
      <div className="text-center text-xs opacity-50 pb-6">
        © {new Date().getFullYear()} Sign Speaks. Built by Team Limitless.
      </div>
    </footer>
  )
}
 