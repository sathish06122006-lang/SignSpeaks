// Offline, rule-based translation dictionary. No external translation API
// is called; unknown words fall back to the original English text.
export const DICTIONARY = {
  hello: { Tamil: 'வணக்கம்', Hindi: 'नमस्ते' },
  'thank you': { Tamil: 'நன்றி', Hindi: 'धन्यवाद' },
  please: { Tamil: 'தயவுசெய்து', Hindi: 'कृपया' },
  yes: { Tamil: 'ஆம்', Hindi: 'हाँ' },
  no: { Tamil: 'இல்லை', Hindi: 'नहीं' },
  help: { Tamil: 'உதவி', Hindi: 'मदद' },
  sorry: { Tamil: 'மன்னிக்கவும்', Hindi: 'माफ़ करना' },
  good: { Tamil: 'நல்லது', Hindi: 'अच्छा' },
  name: { Tamil: 'பெயர்', Hindi: 'नाम' },
  water: { Tamil: 'தண்ணீர்', Hindi: 'पानी' },
}

export function translateText(text, targetLanguage) {
  if (targetLanguage === 'English' || !text) return text
  return text
    .split(' ')
    .map((word) => {
      const entry = DICTIONARY[word.trim().toLowerCase()]
      return entry && entry[targetLanguage] ? entry[targetLanguage] : word
    })
    .join(' ')
}
