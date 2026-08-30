"""
Local, offline translation for common ISL vocabulary and demo sentences.
No external translation API is used, per project requirements. Unknown
words fall back to the original English text so the UI never breaks.

This is the demo/prototype tier of TranslationService: the frontend always
labels it as such. A production build would swap these dictionaries for a
real translation API (Google Translate / IndicTrans / Bhashini) driven by
an environment-variable key — the route contract would not change.
"""

import re

# Whole-phrase translations first (grammatically useful), matched on a
# punctuation-free, lower-cased key.
PHRASES = {
    "hello how are you": {"Tamil": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?", "Hindi": "नमस्ते, आप कैसे हैं?"},
    "how are you": {"Tamil": "நீங்கள் எப்படி இருக்கிறீர்கள்?", "Hindi": "आप कैसे हैं?"},
    "what is your name": {"Tamil": "உங்கள் பெயர் என்ன?", "Hindi": "आपका नाम क्या है?"},
    "thank you": {"Tamil": "நன்றி", "Hindi": "धन्यवाद"},
    "nice to meet you": {"Tamil": "உங்களை சந்தித்ததில் மகிழ்ச்சி", "Hindi": "आपसे मिलकर खुशी हुई"},
    "goodbye": {"Tamil": "பிரியாவிடை", "Hindi": "अलविदा"},
    "good morning": {"Tamil": "காலை வணக்கம்", "Hindi": "सुप्रभात"},
    "see you tomorrow": {"Tamil": "நாளை சந்திப்போம்", "Hindi": "कल मिलते हैं"},
    "i am lost": {"Tamil": "நான் வழி தவறிவிட்டேன்", "Hindi": "मैं खो गया हूँ"},
    "i need help": {"Tamil": "எனக்கு உதவி தேவை", "Hindi": "मुझे मदद चाहिए"},
    "i need medical help": {"Tamil": "எனக்கு மருத்துவ உதவி தேவை", "Hindi": "मुझे चिकित्सा सहायता चाहिए"},
    "call an ambulance": {"Tamil": "ஆம்புலன்ஸ் அழைக்கவும்", "Hindi": "एम्बुलेंस बुलाओ"},
    "call the police": {"Tamil": "காவல்துறையை அழைக்கவும்", "Hindi": "पुलिस बुलाओ"},
    "please call my family": {"Tamil": "தயவுசெய்து என் குடும்பத்தை அழைக்கவும்", "Hindi": "कृपया मेरे परिवार को बुलाओ"},
    "i am in danger": {"Tamil": "நான் ஆபத்தில் இருக்கிறேன்", "Hindi": "मैं खतरे में हूँ"},
    "i need assistance": {"Tamil": "எனக்கு உதவி தேவை", "Hindi": "मुझे सहायता चाहिए"},
    "help me": {"Tamil": "எனக்கு உதவுங்கள்", "Hindi": "मेरी मदद कीजिए"},
}

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
    "goodbye": {"Tamil": "பிரியாவிடை", "Hindi": "अलविदा"},
    "lost": {"Tamil": "வழி தவறியது", "Hindi": "खो गया"},
    "danger": {"Tamil": "ஆபத்து", "Hindi": "खतरा"},
    "urgent": {"Tamil": "அவசரம்", "Hindi": "अति आवश्यक"},
}


def _normalize_phrase(text: str) -> str:
    """Lower-cased, punctuation-free key for phrase matching."""
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", (text or "").lower()).split())


def translate_text(text: str, target_language: str) -> str:
    if target_language == "English" or not text:
        return text

    phrase_entry = PHRASES.get(_normalize_phrase(text))
    if phrase_entry and target_language in phrase_entry:
        return phrase_entry[target_language]

    words = text.split(" ")
    translated_words = []
    for word in words:
        entry = DICTIONARY.get(re.sub(r"[^a-z0-9 ]", "", word.strip().lower()))
        if entry and target_language in entry:
            translated_words.append(entry[target_language])
        else:
            translated_words.append(word)
    return " ".join(translated_words)
