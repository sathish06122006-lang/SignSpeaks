# Sign Speaks – AI Indian Sign Language Detection & Learning Platform

Bridging communication through artificial intelligence and Indian Sign Language.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Framer Motion |
| Backend | FastAPI |
| AI / Vision | MediaPipe Hands (in-browser), TensorFlow-CNN-shaped mock classifier |
| Database | MongoDB |
| Auth | JWT |
| Charts | Chart.js |
| Speech | Web Speech API (browser-native) |

**No external/paid APIs are used anywhere in this project** (no OpenAI, no Google Translate,
no cloud TTS). Hand tracking runs client-side via MediaPipe, text-to-speech uses the browser's
built-in Web Speech API, and translation uses a local offline dictionary. See
[`AI notes`](#swapping-in-a-real-cnn-model) below for how to plug in a real trained model later.

## Folder Structure

```
sign-speaks/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint
│   │   ├── config.py          # Settings (reads .env)
│   │   ├── database.py        # MongoDB (Motor) connection + collections
│   │   ├── models/             # Pydantic request/response schemas
│   │   ├── routes/             # auth, detection, dashboard, tutorials, admin
│   │   ├── services/           # mock_cnn.py, translation.py, pdf_service.py
│   │   └── utils/              # security.py (JWT/bcrypt), jwt_handler.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/               # Landing, LiveDetection, LearnISL, Tutorials,
    │   │                        # Dashboard, About, Contact, Login, Signup,
    │   │                        # ForgotPassword, Profile, AdminPanel
    │   ├── components/          # Navbar, Footer, ProtectedRoute, AccessibilityPanel
    │   ├── context/              # AuthContext, ThemeContext
    │   ├── hooks/useMediaPipeHands.js
    │   └── utils/                # api.js, translations.js, speech.js, mockDetection.js
    ├── package.json
    └── .env.example
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally (`mongodb://localhost:27017`) or an Atlas connection string

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # edit MONGO_URI / JWT_SECRET as needed
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Creating your first admin user

Sign up normally through the app (creates a `role: "user"` account), then promote it to admin
directly in MongoDB:

```js
// mongosh
use sign_speaks
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env             # points VITE_API_URL at your backend
npm run dev
```

The app will be live at `http://localhost:5173`.

## Training a Real Model From Your Own Dataset

Sign Speaks ships with a full **Collect Data → Train → Detect** pipeline, since a real ISL
recognizer needs real training data — no external API or pretrained weights file required.

### 1. Collect landmark data in-app (`Collect Data` page)

- Open the **Collect Data** page (nav bar), start the camera, type the sign label (e.g. `A`, `5`,
  `Hello`), hold the pose, and click **Start Capturing**. It saves ~4 samples/second while held.
- The camera tracks **up to two hands at once**. Single-hand signs just use one hand slot;
  two-handed signs (common in many ISL words/phrases) are captured with both hands in the same
  sample automatically — whatever you actually show it is what gets stored.
- Aim for 40–60+ samples per sign, varying hand angle/position slightly between captures, for a
  solid training set. The page shows a live per-label sample count.
- What's stored is the **21-point hand landmark geometry** (from MediaPipe), not raw images —
  smaller, faster to train on, and avoids storing camera photos of you or contributors.

### 2. Export and train

```bash
# In the Collect Data page: click "Export Full Dataset (CSV)"
# Save the downloaded file as:
mv ~/Downloads/isl_landmark_dataset.csv backend/training/isl_landmark_dataset.csv

cd backend
pip install -r training/requirements-train.txt   # tensorflow, scikit-learn, pandas, numpy
python training/train_model.py
```

This trains a lightweight 1D-CNN over the landmark features (126 values: 63 for a right-hand
slot + 63 for a left-hand slot, zero-padded for whichever hand a given sign doesn't use), reports
test accuracy, and saves:

- `backend/app/model_store/isl_landmark_model.h5` — the trained model
- `backend/app/model_store/labels.json` — the ordered list of signs it predicts

### 3. Live Detection automatically upgrades

Restart the backend. `app/services/real_cnn.py` auto-detects the trained model files at startup
and switches every `/api/detection/predict` call from the placeholder geometric classifier
(`mock_cnn.py`) to your real trained model — no frontend or route changes needed. If no model has
been trained yet, everything still runs end-to-end on the placeholder classifier, so the app is
fully demoable from a fresh clone.

### How it fits together (no external API)

1. **MediaPipe Hands** runs entirely in the browser (loaded from the `@mediapipe` npm packages,
   with model assets fetched from the public MediaPipe CDN — no API key, no server round-trip
   for the camera feed itself). It tracks up to 2 hands with Left/Right handedness labels.
2. The Live Detection page POSTs the current hand landmarks to `/api/detection/predict` a few
   times a second; the backend runs your trained model (or the mock fallback) and returns a sign
   + confidence.
3. Detected signs are appended into a sentence, spoken aloud via the Web Speech API, saved to
   MongoDB, and can be exported.

## Key Features Implemented

- Landing page with animated hero, gradient theme, and glassmorphism panels
- **Collect Data**: webcam-driven landmark capture for one or two hands per sign, live per-label
  sample counts, CSV export, feeding directly into `training/train_model.py`
- Live Detection: webcam controls, real-time hand skeleton overlay (up to 2 hands), live sign +
  confidence from your trained model (or the mock fallback), sentence builder, speak / copy /
  clear / export / save conversation
- Learn ISL: alphabet, number, common-word, and daily-practice modules with audio playback
- Tutorials: search, category filters, embedded YouTube videos, recently watched + recommended
- Dashboard: total signs detected, accuracy, practice time, weekly/daily charts (line/pie/bar)
- Accessibility panel: dark/light mode, large text, high contrast, keyboard navigation, "read
  aloud" voice assistance
- Full JWT auth: signup, login, forgot/reset password, profile, logout
- Admin Panel: manage users, upload/remove tutorials, manage categories, upload CNN model files,
  view platform analytics
- Contact page with feedback form (stored in MongoDB) and embedded map

## Team Limitless

- Gowthaami SM
- Jeevasri J
- Sathish Kumar S

**Mentor:** Ms. Ramani
