# SignSpeaks — Hackathon Presentation Slides

> **Team Limitless** — Gowthaami SM, Jeevasri J, Sathish Kumar S
> **Mentor:** Ms. Ramani

---

## SLIDE 1 — TITLE PAGE

- **Problem Statement Title:**
  Building an AI-powered platform for **Indian Sign Language (ISL) detection and learning** to bridge the communication gap between the Deaf/Hard-of-Hearing community and the hearing world.

- **Theme:**
  Social Innovation · Assistive Technology / Accessibility · AI for Good (EdTech + Inclusive Digital India)

- **PS Category:**
  Software — Artificial Intelligence / Computer Vision

---

## SLIDE 2 — IDEA TITLE

**Title:**
**SignSpeaks** — *Real-time AI Indian Sign Language Detection & Learning Platform*

**Proposed Solution:**
- **Real-time ISL recognition** from a live webcam feed (alphabet, numbers, common words), powered by in-browser hand tracking + an ML classifier — turning a sign into spoken, readable text.
- **A complete self-learning ecosystem** that goes beyond detection: Learn ISL reference library, AI practice with instant feedback, progress & analytics dashboard, bilingual Text-to-Sign, emergency communication tools, and full model-training pipeline — so anyone can learn, practice, and communicate.

---

## SLIDE 3 — TECHNICAL APPROACH

**Technologies Used:**
- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion, Chart.js
- **Backend:** FastAPI (Python), JWT authentication
- **AI / Vision:** MediaPipe Hands (client-side 21-point hand landmarks) + CNN-shaped classifier (pluggable real TensorFlow model; geometric mock fallback)
- **Data:** MongoDB · **Speech:** Web Speech API (browser-native TTS) · **Translation:** local offline dictionary
- **No external/paid APIs** anywhere (no OpenAI / cloud TTS / online translate)

**Methodology:**
1. **Collect Data → Train → Detect** pipeline built in-house (no external API or pretrained weights required).
2. MediaPipe extracts **21 landmarks per hand (up to 2 hands)** → normalized into a fixed **126-dimension feature vector**.
3. In-app **Collect Data** page captures landmark samples per sign → exports CSV → trains a lightweight **1-D CNN**.
4. Trained model is **auto hot-swapped** into live detection when present; the app stays fully demoable on the fallback otherwise.
5. **Live Detection** builds recognized signs into sentences, speaks them aloud (Web Speech API), translates offline, and saves history.
6. Support modules: **AI practice with feedback** (correct/incorrect/unclear + confidence), **progress dashboard** (accuracy, practice time, weekly/daily charts), **emergency communication**, and **multilingual text-to-sign**.

---

## SLIDE 4 — FEASIBILITY AND VIABILITY

**Feasibility:**
- A **fully working end-to-end prototype** — every module is implemented and runnable from a fresh clone.
- **Low cost & zero third-party spend** — no paid/external APIs; runs on commodity hardware with just a webcam.
- **Privacy-friendly** — stores only hand-landmark geometry, not raw camera images; hand tracking runs in the browser.
- **Offline-capable** — local dictionary + browser TTS work without internet for core flows.

**Challenges:**
- ISL has regional variations and limited standardized public datasets.
- Accuracy of single-frame classification vs. continuous/natural signing.
- Two-handed signs and gesture segmentation.
- Ambient/varying lighting, background, and hand angles in real webcam feeds.

**Mitigation:**
- **In-app data collection** lets us build our own standardized ISL dataset and easily re-train — no external dataset dependency.
- **Confidence-based recognition + unknown-sign detection** avoids false positives; a **sentence builder** assembles recognized words instead of demanding perfect continuous signing.
- **Clean swap-in architecture** for the real CNN model (mock fallback keeps the demo reliable).
- Collect **40–60+ varied samples per sign** (angle/position/lighting) to improve robustness.

---

## SLIDE 5 — IMPACT AND BENEFITS

**Target Audience:**
- Deaf & hard-of-hearing individuals in India.
- Families, educators, and ISL learners.
- Interpreters and healthcare / emergency responders (emergency communication mode).
- Organizations building inclusive workplaces and digital services.

**Benefits:**
- **Bridges the communication gap** — deaf users can express themselves in sign that becomes speech/text; hearing users can translate text back to sign.
- **Empowers independence & inclusion** in education, healthcare, and daily life.
- **Accessible learning** — practice with instant AI feedback plus analytics to track progress.
- **Low-cost, private, offline-first** assistive tech that scales beyond urban/school settings.
- Aligns with **Digital India / inclusive accessibility** goals and reduces the need for scarce, expensive human interpreters.

---

## SLIDE 6 — RESEARCH AND REFERENCES

- **Google MediaPipe Hands** — on-device 21-point hand landmark tracking and handedness estimation.
- **Indian Sign Language (ISL) research & datasets** — e.g., the **INCLUDE** dataset and academic studies on ISL recognition (alphabet/numbers/common words).
- **Landmark-based (non-image) deep learning for sign recognition** — 1-D CNN / MLP classifiers over hand-geometry features (IEEE/ACM literature on hand-gesture classification).
- **Web Speech API (W3C)** — browser-native text-to-speech for accessibility.
- **MongoDB / FastAPI / JWT** — standard backend & auth patterns used in production assistive platforms.
- Project README: `c:\Users\Sathish kumar S\Desktop\sign-speaks\sign-speaks\README.md` (full architecture, training pipeline, and feature list).

---

*Prepared from the live SignSpeaks codebase (commit `34abc060`) — all claims reflect implemented functionality.*
