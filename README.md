# DraftMind AI

**Data-driven draft recommendation engine for League of Legends**, built on **2,282+ professional games** from [GRID Esports Data](https://grid.gg/).

> Built for the **Cloud9 x JetBrains "Sky's the Limit" Hackathon**

---

## What It Does

DraftMind AI helps coaches, analysts, and fans make smarter champion select decisions by combining real professional match data with machine learning. It simulates the full 20-step pro draft sequence (bans and picks) while providing real-time AI recommendations, win probability, composition analysis, and live AI commentary.

### Key Features

- **AI Draft Recommendations** — Top 5 champion suggestions per draft step, scored across 4 dimensions: meta strength, team playstyle fit, counter-pick value, and composition synergy
- **Win Prediction** — XGBoost model trained on pro match data predicts win probability as the draft evolves
- **Composition Analysis** — Real-time damage profiles (AD/AP/True), crowd control ratings, scaling curves, and team comp archetypes
- **Scouting Reports** — Head-to-head team comparison with champion pools, draft tendencies, player strengths, and matchup verdicts
- **AI Commentator** — Google Gemini narrates each draft pick with context-aware analysis, delivered through Edge TTS voice synthesis
- **Champion & Team Browsers** — Explore stats, tier lists, matchups, win rates, and draft patterns across all 168 champions and 56 pro teams
- **Export & Share** — Download drafts/reports as PDF or PNG, share to X (Twitter), Reddit, or Discord

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Uvicorn |
| **ML Model** | XGBoost, scikit-learn |
| **AI Narration** | Google Gemini, Edge TTS |
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| **Data** | GRID Esports API (2,282 games, 941 series, 56 teams) |
| **Export** | html2canvas, jsPDF |

---

## Project Structure

```
DraftMind/
├── backend/
│   ├── draftmind/
│   │   ├── api/endpoints/     # REST endpoints (draft, teams, champions, analysis, narrator, tts)
│   │   ├── core/              # Draft rules, champion role mappings
│   │   ├── data/              # Data loading, GRID API client, champion metadata
│   │   ├── engine/            # Recommendation engine, win predictor, composition scorer,
│   │   │                      #   pattern detector, narrator, statistics
│   │   ├── models/            # Pydantic domain models & API schemas
│   │   ├── config.py          # Configuration & environment variables
│   │   └── main.py            # FastAPI app entry point
│   ├── scripts/               # Data pipeline (ingest, build DB, compute stats, train model)
│   ├── data/processed/        # Pre-computed champion stats, team profiles, draft DB
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/             # Draft Board, Champions, Teams, Scouting, About
│   │   ├── components/
│   │   │   ├── draft/         # DraftBoard, ChampionGrid, TeamColumn, NarratorPanel,
│   │   │   │                  #   CompositionAnalysis, RecommendationPanel, LockInAnimation
│   │   │   ├── team/          # Overview, Player Pools, Draft Patterns, Matchup Tool
│   │   │   ├── onboarding/    # Welcome tutorial dialog
│   │   │   ├── shared/        # Logo, ExportShareMenu, ChampionPortrait, ScoreBar
│   │   │   ├── layout/        # Sidebar, AppLayout, PageTransition
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── hooks/             # useDraft, useExportShare, useOnboarding, useTeams, etc.
│   │   └── lib/               # API client, utilities
│   ├── public/                # Static assets (logo, favicon)
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [GRID Esports API key](https://grid.gg/) (for data ingestion)
- [Google Gemini API key](https://aistudio.google.com/apikey) (for AI narrator)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys:
#   GRID_API_KEY=your_grid_api_key
#   GEMINI_API_KEY=your_gemini_api_key

# Start the server
uvicorn draftmind.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

### Docker (Backend Only)

```bash
cd backend
docker compose up --build
```

---

## Data Pipeline

The processed data is included in the repo, so you can run the app without re-ingesting. To refresh from GRID:

```bash
cd backend

# 1. Ingest raw series data from GRID API
python -m scripts.ingest_all_series

# 2. Build the draft database
python -m scripts.build_draft_database

# 3. Compute champion & team statistics
python -m scripts.compute_statistics

# 4. Train the XGBoost win prediction model
python -m scripts.train_win_model
```

---

## API Endpoints

| Group | Endpoints | Description |
|-------|-----------|-------------|
| **Health** | `GET /health` | Server status |
| **Champions** | `GET /champions`, `GET /champions/{name}` | Champion stats, matchups, tier data |
| **Teams** | `GET /teams`, `GET /teams/{id}` | Team profiles, rosters, draft patterns |
| **Draft** | `POST /draft/recommend`, `POST /draft/simulate` | AI recommendations & win simulation |
| **Analysis** | `POST /analysis/composition` | Composition scoring & damage profiles |
| **Narrator** | `POST /narrator/narrate-speak` | AI commentary with text + TTS audio |
| **TTS** | `POST /tts/speak` | Text-to-speech synthesis |

---

## How the AI Works

### Recommendation Engine

Each draft step produces ranked champion suggestions scored on 4 weighted signals:

1. **Meta Score** — Win rate, pick rate, and ban rate from 2,282 pro games
2. **Team Score** — How well the champion fits the team's historical playstyle and player pools
3. **Counter Score** — Effectiveness against the opponent's already-picked champions
4. **Composition Score** — Synergy with allied picks (damage balance, CC chain potential, scaling curve)

### Win Prediction

An XGBoost classifier trained on professional match features:
- Champion-level stats (win rates, role matchups)
- Team composition metrics (damage split, CC total, scaling)
- Draft order advantages
- Side-specific historical performance

### AI Narrator

Google Gemini generates context-aware commentary for each draft action with tone classification (analytical/excited/cautious). Edge TTS converts narration to audio, both delivered simultaneously for instant playback.

---

## Screenshots

*Coming soon*

---

## License

[MIT](LICENSE) - Copyright (c) 2026 Aniket

---

## Acknowledgments

- **[GRID Esports](https://grid.gg/)** — Professional match data powering all statistics
- **[Cloud9](https://cloud9.gg/) x [JetBrains](https://www.jetbrains.com/)** — Sky's the Limit Hackathon
- **[Riot Games](https://www.riotgames.com/)** — League of Legends, Data Dragon CDN
- **[Google Gemini](https://deepmind.google/technologies/gemini/)** — AI narration
- **[Edge TTS](https://github.com/rany2/edge-tts)** — Voice synthesis
