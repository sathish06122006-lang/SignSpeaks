import { publicImageSrc, WORD_IMAGE_FILES } from '../data/signCatalog'

/**
 * TextToSignService — converts typed text into ISL sign representations.
 *
 * Reuses the existing sign catalog (signCatalog.js) so data is never
 * duplicated. For each word:
 *   - If a whole-sign image exists in the catalog → whole-sign representation
 *   - Otherwise → letter-by-letter fingerspelling using A-Z / 0-9 images
 *   - Characters with no available image → flagged as "unsupported"
 */

const WORD_KEYS = new Set(Object.keys(WORD_IMAGE_FILES))

function normalizeWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function hasWholeSign(word) {
  return WORD_KEYS.has(word.toLowerCase())
}

function wordToImages(word) {
  const src = publicImageSrc(word)
  return [{ char: word, src }]
}

function fingerspellWord(word) {
  const chars = word.split('')
  const images = []
  const unsupported = []

  for (const ch of chars) {
    if (/[a-z0-9]/.test(ch)) {
      images.push({ char: ch.toUpperCase(), src: publicImageSrc(ch.toUpperCase()) })
    } else {
      unsupported.push(ch)
    }
  }

  return { images, unsupported }
}

/**
 * Convert a raw input string into a structured ISL representation.
 *
 * @param {string} input
 * @returns {Array<{word:string, type:string, images:Array, unsupported:Array}>}
 */
export function textToSign(input) {
  if (!input || !input.trim()) return []

  const tokens = input.trim().split(/\s+/)
  const results = []

  for (const token of tokens) {
    const cleaned = normalizeWord(token)

    if (!cleaned) {
      results.push({ word: token, type: 'unsupported', images: [], unsupported: token.split('') })
      continue
    }

    if (hasWholeSign(cleaned)) {
      results.push({ word: cleaned, type: 'whole-sign', images: wordToImages(cleaned), unsupported: [] })
    } else {
      const { images, unsupported } = fingerspellWord(cleaned)
      results.push({ word: cleaned, type: 'fingerspelled', images, unsupported })
    }
  }

  return results
}
