import LogoMark from './LogoMark'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-violet/15">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm">
        <LogoMark />
        <p className="opacity-70 mt-2">
          Bridging communication through artificial intelligence and Indian Sign Language.
        </p>
      </div>
      <div className="text-center text-xs opacity-60 pb-6">
        © {new Date().getFullYear()} Sign Speaks. Built by Team Limitless.
      </div>
    </footer>
  )
}
 