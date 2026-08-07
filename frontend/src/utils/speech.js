// Thin wrapper around the browser-native Web Speech API. No external
// TTS provider or API key is required.

export function getVoices() {
  return window.speechSynthesis ? window.speechSynthesis.getVoices() : []
}

export function speak(text, { voiceGender = 'female', rate = 1, onEnd } = {}) {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  const voices = getVoices()
  const preferred = voices.find((v) =>
    voiceGender === 'female'
      ? /female|zira|samantha|susan/i.test(v.name)
      : /male|david|daniel|alex/i.test(v.name)
  )
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
