/**
 * SentenceFormationService — Context-Aware Recognition sentence builder.
 *
 * MODULE STATUS: PROTOTYPE / demo mode. No external NLP/LLM service is
 * wired up in this build. This module is a clean, swappable interface:
 * callers pass a sequence of recognised signs and receive a sentence. To
 * switch to a real NLP/LLM backend later, only this module's internals
 * change — UI components and calling code stay identical.
 *
 * The prototype logic is intentionally conservative:
 *   1. a tiny phrase dictionary for a few common sign sequences, and
 *   2. a plain rule-based join + capitalisation + punctuation fallback.
 * It NEVER invents meaning beyond the order of the signs it was given,
 * and it never claims to be full natural-language processing.
 */

export const MODE = 'prototype'

// Common demo sign sequences (labels exactly as the classifier emits them).
const PHRASES = {
  'HELLO HOW ARE YOU': 'Hello, how are you?',
  'HOW ARE YOU': 'How are you?',
  'WHAT IS YOUR NAME': 'What is your name?',
  'NICE TO MEET YOU': 'Nice to meet you.',
  'THANK YOU': 'Thank you.',
  'GOODBYE': 'Goodbye.',
  'GOOD MORNING': 'Good morning.',
  'I AM LOST': 'I am lost.',
  'HELP ME': 'Help me.',
}

/**
 * Build a sentence from a recognised sign sequence.
 *
 * @param {Array<{sign:string, confidence:number, recognized:boolean}>} sequence
 * @returns {{ sentence:string, partial:boolean, sentenceConfidence:number|null, hasUnknown:boolean, mode:string }}
 */
export function buildSentence(sequence) {
  const entries = Array.isArray(sequence) ? sequence : []
  const real = entries.filter((e) => e.recognized && e.sign && e.sign !== 'UNKNOWN')
  const hasUnknown = entries.some((e) => !e.recognized || e.sign === 'UNKNOWN')

  // No reliably recognised signs at all -> cannot form a sentence.
  if (real.length === 0) {
    return {
      sentence: '',
      partial: true,
      sentenceConfidence: null,
      hasUnknown,
      mode: MODE,
    }
  }

  const tokens = real.map((e) => e.sign.trim())
  const key = tokens.join(' ').toUpperCase()

  let sentence = PHRASES[key]
  if (!sentence) {
    // Rule-based fallback: preserve single-letter signs uppercase (letters/
    // numbers of ISL fingerspelling), lower-case whole words, join naturally.
    sentence = tokens
      .map((t) => (t.length === 1 && /[A-Za-z0-9]/.test(t) ? t.toUpperCase() : t.toLowerCase()))
      .join(' ')
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
    if (!/[.!?]$/.test(sentence)) sentence += '.'
  }

  // If any sign in the sequence was Unknown / below threshold, the sentence
  // is NOT presented as confident — it may be incomplete.
  const partial = hasUnknown

  const confidences = real
    .map((e) => Number(e.confidence))
    .filter((c) => !Number.isNaN(c) && c > 0)
  const sentenceConfidence = confidences.length
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100
    : null

  return { sentence, partial, sentenceConfidence, hasUnknown, mode: MODE }
}