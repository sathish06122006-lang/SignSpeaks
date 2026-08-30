import { FiTrash2, FiRotateCcw, FiVolume2, FiAlertTriangle } from 'react-icons/fi'

/**
 * Reusable Context-Aware Interpretation panel.
 *
 * Props:
 *  - sequence:         [{ sign, confidence, recognized, timestamp }]
 *  - sentence:         generated sentence string
 *  - partial:          true when some signs were unclear (sentence may be incomplete)
 *  - sentenceConfidence: average confidence (0-100) of the recognised signs, from real model output
 *  - onClear / onRetry / onSpeak
 */
export default function ContextInterpretation({
  sequence = [],
  sentence = '',
  partial = false,
  sentenceConfidence = null,
  onClear,
  onRetry,
  onSpeak,
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display font-semibold">Context-Aware Interpretation</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 opacity-70" title="Sentence formation uses a rule-based prototype until a real NLP service is connected.">Prototype formation</span>
          {sentenceConfidence !== null && sentenceConfidence !== undefined && (
            <span className="text-xs px-3 py-1 rounded-full border border-indigoAccent/40 bg-indigoAccent/20 text-indigoAccent-light font-semibold">
              Sentence confidence: {Math.round(sentenceConfidence)}%
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wide opacity-60 mb-2">Detected Signs</h4>
        {sequence.length === 0 ? (
          <p className="text-xs opacity-50">No signs detected yet — perform ISL signs to build a sequence.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sequence.map((e, i) => (
              <span
                key={`${e.timestamp}-${i}-${e.sign}`}
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                  e.recognized
                    ? 'bg-teal/20 border-teal/40 text-teal-light'
                    : 'bg-coral/20 border-coral/40 text-coral'
                }`}
              >
                [{e.recognized ? e.sign : 'UNKNOWN'}]
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wide opacity-60 mb-1">Generated Sentence</h4>
        {sentence ? (
          <p className="text-lg font-display font-semibold leading-snug">“{sentence}”</p>
        ) : (
          <p className="text-sm opacity-50">—</p>
        )}

        {partial && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-coral border border-coral/30 bg-coral/10 rounded-lg px-3 py-2">
            <FiAlertTriangle className="shrink-0 mt-0.5" aria-hidden />
            <span>Some signs weren't recognized clearly; the sentence may be incomplete.</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClear}
          disabled={!sequence.length}
          className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold disabled:opacity-40"
        >
          <FiTrash2 /> Clear
        </button>
        <button onClick={onRetry} className="flex items-center gap-1 px-3 py-2 rounded-full glass text-xs font-semibold">
          <FiRotateCcw /> Retry
        </button>
        <button
          onClick={onSpeak}
          disabled={!sentence}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-brand-gradient text-white text-xs font-semibold disabled:opacity-40"
        >
          <FiVolume2 /> Speak
        </button>
      </div>
    </div>
  )
}