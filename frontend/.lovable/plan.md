

# DraftMind AI - Phase 1 Implementation Plan

## Overview
Building a professional esports draft simulator with a dark esports theme, featuring the complete Draft Board as the star feature, along with the navigation sidebar infrastructure.

---

## 1. Foundation & Theme Setup

### Design System Configuration
- Update Tailwind config with the dark esports color palette (navy/charcoal gradients, Cloud9 blue accents)
- Add custom colors: surface cards, blue/red side colors, success/danger/warning states
- Configure Inter and JetBrains Mono fonts
- Set up glass-morphism utilities and custom animations

### Dependencies
- Install framer-motion for professional animations
- Configure animation presets (fade-in-up, count-up, hover scale effects)

---

## 2. Navigation Sidebar

### Collapsible Sidebar Component
- Fixed left sidebar: 64px collapsed → 240px on hover
- DraftMind AI logo at top (brain/draft icon in Cloud9 blue)
- Navigation items with icons: Draft Board, Champions, Teams, Scouting, About
- Active route highlighting with blue accent
- Bottom section: "Powered by GRID Esports Data" with live stats from /api/meta

### App Layout Structure
- Sidebar + main content area layout
- Route configuration for all 5 pages (placeholder pages for non-Draft Board routes)

---

## 3. API & Data Layer

### API Service
- Centralized API client with base URL configuration
- Toggle between real API (localhost:8000) and mock data fallback
- Error handling with graceful degradation

### Mock Data Layer
- Mock teams data (56 teams including Cloud9 Kia)
- Mock champions data (200+ champions with roles, stats, win rates)
- Mock recommendation responses
- Mock simulation/analysis responses

### Custom Hooks
- `useTeams()` - Fetch team list
- `useChampions()` - Fetch champion grid data
- `useDraftRecommendations()` - Get AI recommendations
- `useDraftSimulation()` - Get composition analysis
- `useMeta()` - Fetch series/games count

---

## 4. Draft Board - Team Selection Modal

### Pre-Draft Overlay
- Full-screen modal overlay before draft begins
- Two searchable dropdowns for Blue/Red team selection
- Team options show: name, win rate badge, games played
- Cloud9 Kia pre-selected on blue side
- "Start Draft" primary button
- "Start without team data" secondary option

---

## 5. Draft Board - Main Layout

### Header Bar
- Left: DraftMind AI logo
- Center: Phase indicator pill (BAN PHASE 1, PICK PHASE 1, etc.)
- Center below: Sequence indicator ("7/20 — Blue Side Pick") with color coding
- Right: "New Draft" reset button

### Three-Column Layout
- Blue Team Column (left, ~250px)
- Center Panel (~800px, flexible)
- Red Team Column (right, ~250px)
- Bottom Analysis Bar (~120px)

---

## 6. Team Columns (Blue & Red)

### Team Header
- Team name with side-colored accent
- Win rate badge

### Bans Row
- 5 circular slots for banned champions
- Empty: dashed circle outline
- Filled: champion portrait with red X overlay, grayed out

### Picks Column
- 5 vertical pick slots
- Empty: dashed border, "Pick 1-5" label, role icon hint
- Filled: champion splash cropped (200x60px), name overlay, colored glow border
- Active: pulsing border animation, "PICKING..." label

---

## 7. Center Panel - Champion Grid

### Search & Filters
- Search bar with live filtering
- Role filter tabs: All, Top, Jungle, Mid, Bot, Support

### Champion Grid
- 8-column responsive grid of champion portraits (48px circles)
- Champion states: available (full color), banned (grayed + red X), picked (grayed + checkmark)
- Hover tooltip: mini stats (WR%, pick rate, role)
- Click: triggers selection confirmation

### Champion Portraits
- Images from Riot Data Dragon CDN
- Smooth loading with skeleton placeholders

---

## 8. Center Panel - AI Recommendations

### Tab Toggle
- Switch between "Champions" and "AI Recommendations" views

### Recommendation Cards (5 cards)
- Champion portrait (64px) with name
- Score bar: gradient progress bar with numeric value
- Confidence badge: HIGH (green), MEDIUM (amber), LOW (gray)
- Signal breakdown: 4 mini bars for Meta, Team, Counter, Composition
- Reasoning bullets in muted text
- "Select This Champion" button

---

## 9. Champion Selection Confirmation

### Confirmation Modal
- Large champion splash preview
- Champion name, role, key stats
- "Confirm [Ban/Pick]" primary button
- "Cancel" secondary button
- On confirm: animate champion into slot, advance sequence

---

## 10. Bottom Analysis Bar

### Live Composition Display
- Split view: Blue composition | Red composition
- For each side:
  - Composition type label (Teamfight, Dive, Poke, etc.)
  - Damage split bar (Physical vs Magic)
  - CC rating bar with score
  - Engage threat count
  - Scaling indicator (Early/Mid/Late)
  - Synergy score
- Real-time updates after each pick

---

## 11. Draft Logic Engine

### Sequence Controller
- 20-action draft sequence implementation
- Phase tracking: Ban Phase 1 (1-6), Pick Phase 1 (7-12), Ban Phase 2 (13-16), Pick Phase 2 (17-20)
- Side tracking: knows which team acts at each sequence number
- State management for all picks/bans

### Draft State
- Current sequence number
- Blue team bans & picks
- Red team bans & picks
- Currently selected champion
- Draft phase indicator

---

## 12. Draft Complete State

### Results Display
- Full simulation results in center panel
- Side-by-side composition comparison
- Matchup insight cards with highlights
- Strengths (green badges) and weaknesses (red badges) for each team
- Large "New Draft" button to reset

---

## 13. Animations & Polish

### Framer Motion Animations
- Cards fade-in-up on mount (staggered)
- Champion slot fill animation
- Count-up animation for numbers/scores
- Hover scale effects on interactive elements
- Pulsing border for active pick slot
- Smooth transitions between states

### Visual Polish
- Glass-morphism effects on cards
- Subtle gradients and glows
- Responsive sizing for different screens
- Loading skeletons during data fetch

---

## Technical Architecture

### Component Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── AppLayout.tsx
│   ├── draft/
│   │   ├── DraftBoard.tsx
│   │   ├── TeamColumn.tsx
│   │   ├── ChampionGrid.tsx
│   │   ├── RecommendationPanel.tsx
│   │   ├── CompositionAnalysis.tsx
│   │   ├── TeamSelectionModal.tsx
│   │   └── ChampionConfirmation.tsx
│   └── shared/
│       ├── ChampionPortrait.tsx
│       └── ScoreBar.tsx
├── hooks/
│   ├── useDraft.ts
│   ├── useTeams.ts
│   └── useChampions.ts
├── lib/
│   ├── api.ts
│   └── mockData.ts
└── pages/
    ├── Index.tsx (Draft Board)
    ├── Champions.tsx (placeholder)
    ├── Teams.tsx (placeholder)
    ├── Scouting.tsx (placeholder)
    └── About.tsx (placeholder)
```

---

## What You'll Get

✅ Professional esports broadcast-style draft interface
✅ Fully interactive 20-step draft sequence
✅ Real champion images from Riot's CDN
✅ AI recommendations with confidence scores
✅ Live composition analysis
✅ Smooth animations throughout
✅ Works offline with mock data, connects to real API when available
✅ Complete navigation sidebar ready for other pages

