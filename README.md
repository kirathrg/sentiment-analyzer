# 📊 SentiRadar — Brand Sentiment Analyzer

A full-stack application that analyzes brand sentiment from **HackerNews** using NLP and presents results through 10+ interactive visualizations.

![Dashboard](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

---

## ✨ Features

- 🟠 **Live HackerNews data** — real posts & comments, no API key needed
- 🧠 **VADER NLP** — fast, accurate sentiment scoring
- 📊 **10 visualizations** — trend chart, word cloud, heat map, radar, donut, emotion analysis & more
- 🌗 **Dark glassmorphism UI** — premium design with smooth animations
- 🔄 **Mock fallback** — works offline with realistic demo data

## 📈 Visualizations

| Chart | Description |
|-------|-------------|
| Sentiment Trend | Area chart — score over time |
| Donut Chart | % Positive / Neutral / Negative |
| Word Cloud | D3 — color-coded by sentiment |
| Heat Map | D3 calendar — daily activity |
| Radar Chart | Topic breakdown (Finance, Tech, Reviews…) |
| Emotion Radar | 8-axis Plutchik emotion model |
| Subjectivity Gauge | Custom SVG arc gauge |
| Top Posts Table | Sortable, paginated post list |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt

# Copy env template and configure
cp .env.example .env
# Edit .env — set USE_MOCK_DATA=true for demo mode

python main.py
# API runs at http://localhost:8000
# Docs at   http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 🗂️ Project Structure

```
Sentiment Analyzer/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── config.py                  # Environment config
│   ├── database.py                # SQLite async setup
│   ├── requirements.txt
│   ├── .env.example               # ← copy to .env and fill in
│   ├── routers/
│   │   └── analyze.py             # API endpoints
│   └── services/
│       ├── hn_service.py          # HackerNews data fetcher
│       ├── reddit_service.py      # Reddit / mock data
│       ├── bluesky_service.py     # Bluesky (optional)
│       └── sentiment_service.py   # VADER NLP pipeline
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/            # 10 visualization components
        ├── hooks/
        └── pages/
```

---

## ⚙️ Configuration (`.env`)

```env
# Data source
USE_MOCK_DATA=false     # true = demo mode, false = live HackerNews

# Reddit (optional — only if you have a script-type app)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=
REDDIT_USERNAME=
REDDIT_PASSWORD=
```

---

## 🛠️ Tech Stack

**Backend**: Python · FastAPI · PRAW · VADER · TextBlob · SQLite · httpx

**Frontend**: React · Vite · Recharts · D3.js · Framer Motion · Axios
