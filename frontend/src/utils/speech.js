// Thin wrapper around the browser-native Web Speech API. No external
// TTS provider or API key is required.

export function getVoices() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : []
}

export function speak(text, { voiceGender = 'female', rate = 1, lang, onEnd } = {}) {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  if (lang) utterance.lang = lang

  const voices = getVoices()
  let preferred = null
  if (lang) {
    // Prefer a voice that matches the requested language code, then fall
    // back to the generic gender preference.
    preferred = voices.find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
  }
  if (!preferred) {
    preferred = voices.find((v) =>
      voiceGender === 'female'
        ? /female|zira|samantha|susan/i.test(v.name)
        : /male|david|daniel|alex/i.test(v.name)
    )
  }
  if (preferred) utterance.voice = preferred
  if (onEnd) utterance.onend = onEnd

  window.speechSynthesis.speak(utterance)
}

export function pauseSpeech() {
  window.speechSynthesis?.pause()
}

export function resumeSpeech() {
  window.speechSynthesis?.resume()
}

export function stopSpeech() {
  window.speechSynthesis?.cancel()
}
