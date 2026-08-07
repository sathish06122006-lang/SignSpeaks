"""
Local, offline word-level translation dictionary for common ISL vocabulary.
No external translation API is used, per project requirements. Unknown
words fall back to the original English text so the UI never breaks.
"""

DICTIONARY = {
    "hello": {"Tamil": "வணக்கம்", "Hindi": "नमस्ते"},
    "thank you": {"Tamil": "நன்றி", "Hindi": "धन्यवाद"},
    "please": {"Tamil": "தயவுசெய்து", "Hindi": "कृपया"},
    "yes": {"Tamil": "ஆம்", "Hindi": "हाँ"},
    "no": {"Tamil": "இல்லை", "Hindi": "नहीं"},
    "help": {"Tamil": "உதவி", "Hindi": "मदद"},
    "sorry": {"Tamil": "மன்னிக்கவும்", "Hindi": "माफ़ करना"},
    "good": {"Tamil": "நல்லது", "Hindi": "अच्छा"},
    "name": {"Tamil": "பெயர்", "Hindi": "नाम"},
    "water": {"Tamil": "தண்ணீர்", "Hindi": "पानी"},
}


def translate_text(text: str, target_language: str) -> str:
    if target_language == "English" or not text:
        return text

    words = text.split(" ")
    translated_words = []
    for word in words:
        entry = DICTIONARY.get(word.strip().lower())
        if entry and target_language in entry:
            translated_words.append(entry[target_language])
        else:
            translated_words.append(word)
    return " ".join(translated_words)
