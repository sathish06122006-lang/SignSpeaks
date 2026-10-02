import { useState } from 'react'
import { FiType, FiArrowRight, FiAlertCircle, FiAlertTriangle, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { textToSign } from '../services/textToSignService'

export default function TextToSign() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState([])
  const [converted, setConverted] = useState(false)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleConvert = () => {
    if (!input.trim()) {
      setError('Please type a word or sentence first.')
      setResult([])
      setConverted(false)
      return
    }
    setError('')
    setResult(textToSign(input))
    setCurrentIndex(0)
    setConverted(true)
  }

  const handleClear = () => {
    setInput('')
    setResult([])
    setConverted(false)
    setError('')
    setCurrentIndex(0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConvert()
  }

  const handleNext = () => {
    if (currentIndex < result.length - 1) setCurrentIndex(currentIndex + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const hasUnsupported = result.some((r) => r.unsupported.length > 0)
  const current = result[currentIndex] || null
  const total = result.length

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Text to Sign</h1>
      <p className="opacity-70 mb-8 max-w-2xl">
        Type a word or sentence and see it represented in Indian Sign Language.
        Words with a known sign show as a whole-sign image; others are fingerspelled letter by letter.
      </p>

      {/* Input area */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
          <FiType /> Enter text
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder='Type here — e.g. "Hello" or "Xavier"'
          className="w-full rounded-xl bg-ink/40 p-4 text-base outline-none resize-none placeholder:text-ivory/40"
        />
        {error && (
          <p className="flex items-center gap-2 text-sm text-coralDeep">
            <FiAlertCircle className="shrink-0" /> {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleConvert}
            className="flex items-center gap-2 px-6 py-2.5 btn-primary"
          >
            <FiArrowRight /> Convert to Sign
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 btn-secondary"
          >
            <FiRefreshCw /> Clear
          </button>
        </div>
      </div>

      {/* Result area */}
      <div className="mt-8">
        {!converted ? (
          <div className="glass rounded-2xl p-12 text-center opacity-60">
            <FiType className="text-5xl mx-auto mb-4" />
            <p>Type a word or sentence above to see it in ISL.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hasUnsupported && (
              <p className="flex items-center gap-2 text-sm text-coralDeep border border-coral/30 bg-coral/10 rounded-xl px-4 py-3">
                <FiAlertTriangle className="shrink-0" />
                Some characters have no sign representation and are marked below.
              </p>
            )}

            {/* Single sign display with navigation */}
            {current && (
              <div className="glass rounded-2xl p-6 sm:p-8">
                {/* Word header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wide opacity-60">
                      {current.type === 'whole-sign'
                        ? 'Whole sign'
                        : current.type === 'fingerspelled'
                          ? 'Fingerspelled'
                          : 'Unsupported'}
                    </span>
                    <span className="text-lg font-semibold capitalize">{current.word}</span>
                  </div>
                  <span className="text-sm opacity-60">
                    {currentIndex + 1} / {total}
                  </span>
                </div>

                {/* Large image display */}
                {current.type === 'unsupported' ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <FiAlertCircle className="text-5xl mx-auto mb-3 text-coral" />
                      <p className="text-coral">No sign representation for "{current.word}".</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-5">
                    {current.images.map((img, j) => (
                      <div key={`${img.char}-${j}`} className="flex flex-col items-center">
                        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-2xl bg-ink/40 overflow-hidden flex items-center justify-center border border-white/10">
                          <img
                            src={img.src}
                            alt={current.type === 'whole-sign' ? `ISL sign for ${current.word}` : `ISL letter ${img.char}`}
                            className="max-w-full max-h-full object-contain p-2"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        </div>
                        <span className="text-base mt-2 opacity-60">
                          {current.type === 'whole-sign' ? current.word : img.char}
                        </span>
                      </div>
                    ))}
                    {current.unsupported.map((ch, j) => (
                      <div key={`unsupported-${j}`} className="flex flex-col items-center">
                        <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-2xl bg-coral/10 border border-coral/30 flex items-center justify-center">
                          <span className="text-coral text-4xl font-bold">{ch}</span>
                        </div>
                        <span className="text-base mt-2 text-coral">no sign</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation buttons */}
                {total > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-5 py-2.5 btn-secondary disabled:opacity-30"
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex === total - 1}
                      className="flex items-center gap-2 px-5 py-2.5 btn-primary disabled:opacity-30"
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
