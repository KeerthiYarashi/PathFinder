# PathFinder — Master Project Plan

## Product Vision
**PathFinder** is an adaptive AI learning companion that acts as a "GPS for learning". It builds a personalized, prerequisite-aware roadmap from your goals and skills, then continuously recalculates it based on your performance.

---

## Architecture

```
Next.js Frontend (TypeScript + Tailwind + Recharts + Framer Motion)
         ↕ HTTP/REST
FastAPI Backend (Python)
   ├── Onboarding         → LangChain structured output (Gemini)
   ├── Skill-Gap Engine   → Deterministic array comparison
   ├── Recommendation     → pgvector semantic search + multi-factor scoring
   ├── Path Generator     → Kahn's Algorithm (topological sort on DAG)
   ├── Adaptive Engine    → Rule-based triggers (Struggling / Skip / Score)
   ├── NBA Engine         → State-machine "What do I do now?"
   └── AI Mentor          → LangGraph ReAct tool-using agent
         ↕
Supabase PostgreSQL (relational data) + pgvector (vector embeddings)
Gemini 1.5 Flash (LLM) + text-embedding-004 (embeddings)
```

---

## Branches

| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | All | Stable, always runnable |
| `ai/core-pipeline` | AI Engineer | All AI/ML components |
| `ui/dashboard-layout` | Frontend | Next.js UI components |
| `api/path-generator` | Backend | API wiring |

---

## Phase 1 — AI Core Pipeline (`ai/core-pipeline` branch)

### 1A. Seed Data
- `Backend/data/skills.json` — ~40 atomic skills across 4 roles
- `Backend/data/prerequisites.json` — DAG edges defining skill dependencies
- `Backend/data/resources.json` — 60+ curated learning resources

### 1B. Infrastructure & Config
- Update `Backend/core/config.py` — add LLM, embedding, vector DB env vars
- `Backend/scripts/seed_vector_db.py` — embed resources into Supabase pgvector

### 1C. LLM Layer
- `Backend/services/llm.py` — Gemini/OpenAI abstraction (extract_profile, generate_explanation, followup questions)

### 1D. Vector Search Layer
- `Backend/services/vector_store.py` — pgvector semantic search interface

### 1E. Recommendation Engine
- `Backend/engines/recommendation.py` — 6-factor weighted scoring (semantic + prereq + difficulty + time + format + history)

### 1F. Path Generation (Wire Real Data)
- Update `Backend/engines/path_generator.py` — replace mock stubs with real RecommendationEngine calls

### 1G. NBA Engine
- `Backend/engines/nba.py` — Next Best Action state machine

### 1H. Onboarding Endpoint
- `Backend/api/v1/onboarding.py` — full LangChain extraction chain with follow-up logic

### 1I. Explanation Endpoint
- `Backend/api/v1/modules.py` — "Why This?" endpoint grounded in real scoring data

### 1J. AI Mentor Agent
- `Backend/services/mentor_agent.py` — LangGraph stateful ReAct agent with tools
- `Backend/api/v1/mentor.py` — connect agent to FastAPI endpoint

### 1K. Bug Fixes
- Fix mastery ceiling: `adaptive.py` uses `5`, should be `3`
- Fix taxonomy: `skill_gap.py` hardcoded roles → load from `skills.json`
- Fix unreachable route in `path.py`
- Fix adaptive "Struggling" to update path JSON directly

---

## Phase 2 — Frontend (`ui/dashboard-layout` branch)

### Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero + animated GPS metaphor |
| `/onboarding` | Chat-based profile creation |
| `/skills` | Radar chart + gap table + "Generate Path" CTA |
| `/dashboard` | Bento-box: NBA card, progress ring, radar, milestones |
| `/path` | Subway-map timeline with module cards |

### Key Components
- `NBACard` — hero card, always visible
- `RadarChart` (Recharts) — current vs required skills
- `Timeline` — scrollable subway map with module states
- `ResourceDetailPanel` — slide-over with "Why This?" + action buttons
- `RecalculatingOverlay` — Framer Motion animation
- `MentorChat` — FAB + floating popover

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (radar, progress)
- Framer Motion (recalculation animation)
- Zustand (state management)
- Axios (API calls)

---

## Phase 3 — Testing & Demo Prep

- Unit tests: skill-gap engine, path generator, scoring engine
- Integration tests: onboarding → path generation full flow
- E2E: full demo path (onboarding → struggling → recalculation)
- Pre-demo checklist execution

---

## Data Architecture

### Supabase PostgreSQL Tables
- `learners` — profile, time budget, preferences
- `learning_goals` — target role, deadline
- `learner_skills` — mastery map (skill_id × level 0–3)
- `skills` + `prerequisites` — taxonomy DAG
- `resources` + `course_skills` — content catalog
- `learning_paths` — generated path JSONB + version
- `progress_log` — action history (start/complete/skip/struggling)
- `recommendations_cache` — scoring factors + explanation text

### pgvector Collection
- Collection: `learning_resources`
- Document: `"Title: X. Description: Y. Teaches skills: Z"`
- Metadata: `difficulty_level`, `duration_hours`, `format_type`, `skills_covered`, `url`, `title`, `resource_id`, `type`

---

## Key Design Principles
1. **LLM does NLU/NLG only** — never decides curriculum or sequencing
2. **Topological sort for ordering** — cannot hallucinate prerequisite order
3. **Multi-factor scoring** — transparent, reproducible, explainable
4. **Hybrid architecture** — deterministic engines + AI for language tasks
5. **No hallucinated resources** — everything comes from curated pgvector DB

---

## Demo Flow (3-5 minutes)
1. `0:00–0:30` — Hook: "I know Python, want ML Engineer in 6 months"
2. `0:30–1:00` — Radar chart shows Statistics/ML gaps
3. `1:00–1:30` — 6-month roadmap with milestones renders
4. `1:30–2:00` — "Why This?" on Statistics course → scoring breakdown
5. `2:00–2:15` — Click **"I'm Struggling"** on Statistics
6. `2:15–2:45` — **"Recalculating Route…"** → Probability Refresher inserted
7. `2:45–3:15` — NBA card flips to "Action Required: Probability Refresher"
8. `3:15–4:00` — AI Mentor explains the specific change
9. `4:00–4:30` — Updated radar chart. *"PathFinder learns as you learn."*
