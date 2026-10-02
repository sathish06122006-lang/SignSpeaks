/**
 * Shared ISL sign catalog — reused by Learn ISL (reference browsing) and
 * AI Practice (target selection / reference images). Single source of
 * truth so content is never duplicated between the two features.
 */

export const ALPHABET_EXAMPLES = {
  A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Fish',
  G: 'Goat', H: 'Hat', I: 'Ice', J: 'Jug', K: 'Kite', L: 'Lion',
  M: 'Mango', N: 'Nest', O: 'Orange', P: 'Pen', Q: 'Queen', R: 'Rat',
  S: 'Sun', T: 'Tree', U: 'Umbrella', V: 'Van', W: 'Water', X: 'X-ray',
  Y: 'Yak', Z: 'Zebra',
}

// Maps word labels to their actual filenames in frontend/public/
export const WORD_IMAGE_FILES = {
  hello: 'hello.jpg',
  sorry: 'sorry.jpg',
  yes: 'yes.jpg',
  no: 'NO.jpg',
  please: 'please.jpg',
  help: 'help.jpg',
  eat: 'eat.jpeg',
  more: 'more.jpeg',
  stop: 'stop.jpg',
  'thank you': 'Thank you.jpg',
  good: 'good.jpg',
  name: 'name.jpg',
  water: 'water.jpg',
}

// Return the correct public image path for a sign item (letter, number, or word)
export function publicImageSrc(item) {
  if (item.length === 1) return `/${item}.jpg` // A-Z and 0-9 images match their label exactly
  const file = WORD_IMAGE_FILES[item.toLowerCase()]
  return file ? `/${file}` : `/${item.toLowerCase()}.jpg`
}

export const MODULES = [
  {
    key: 'alphabets',
    title: 'Alphabet Lessons',
    level: 'Beginner',
    items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    speakPhrase: (item) => `${item}, as in ${ALPHABET_EXAMPLES[item]}`,
  },
  {
    key: 'numbers',
    title: 'Number Lessons',
    level: 'Beginner',
    items: Array.from({ length: 10 }, (_, i) => String(i)),
    speakPhrase: (item) => `Number ${item}`,
  },
  {
    key: 'words',
    title: 'Common Words',
    level: 'Intermediate',
    items: ['Hello', 'Thank You', 'Please', 'Yes', 'No', 'Help', 'Sorry', 'Good', 'Name', 'Water', 'Eat', 'More', 'Stop', 'Which', 'This', 'You', 'When', 'Same', 'What', 'With', 'Mine', 'Friend', 'Where', 'Drink', 'Pain'],
    speakPhrase: (item) => item,
  },
  {
    key: 'phrases',
    title: 'Daily Practice Phrases',
    level: 'Advanced',
    items: ['Give Me', 'I Love You'],
    speakPhrase: (item) => item,
  },
]

/** All catalog signs as [item, module] pairs, flattened & grouped by module. */
export function allCatalogSigns() {
  return MODULES.flatMap((m) => m.items.map((item) => ({ item, module: m })))
}