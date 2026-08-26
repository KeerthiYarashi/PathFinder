# PathFinder — Progress Tracker
> Branch: `ai/core-pipeline` | Last updated: 2026-08-26

---

## Phase 1 — AI Core Pipeline

### 🔷 STEP 1 — Seed Data Files

- [x] 1.1 Create `Backend/data/` directory
- [x] 1.2 Write `Backend/data/skills.json` (≥ 15 skills, 4 roles)
- [x] 1.3 Write `Backend/data/prerequisites.json` (DAG edges, no cycles)
- [x] 1.4 Write `Backend/data/resources.json` (≥ 60 resources, 3+ per skill)

### 🔷 STEP 2 — Config Update

- [x] 2.1 Add `SUPABASE_DB_URL` to `core/config.py`
- [x] 2.2 Add `LLM_PROVIDER`, `GEMINI_API_KEY`, `OPENAI_API_KEY`
- [x] 2.3 Add `EMBEDDING_MODEL`, `VECTOR_COLLECTION` settings
- [x] 2.4 Create `.env.example` file

### 🔷 STEP 3 — LLM Service (`services/llm.py`)

- [x] 3.1 Create `LLMService` class with provider abstraction (Gemini/OpenAI)
- [x] 3.2 Implement `extract_profile(conversation)` → `ExtractedProfile`
- [x] 3.3 Implement `generate_explanation(scoring_data, learner_context)` → `str`
- [x] 3.4 Implement `generate_followup_question(partial_profile)` → `str`
- [x] 3.5 Implement `generate_mentor_reply(messages, system_prompt)` → `str`

### 🔷 STEP 4 — Vector Store Service (`services/vector_store.py`)

- [x] 4.1 Create `VectorStoreService` class with Supabase pgvector connection
- [x] 4.2 Implement `search_resources(skill_name, k, filters)` → `list[dict]`
- [x] 4.3 Implement `get_resource_by_id(resource_id)` → `dict | None`

### 🔷 STEP 5 — Seed Script (`scripts/seed_vector_db.py`)

- [x] 5.1 Create `scripts/` directory
- [x] 5.2 Write `seed_vector_db.py` to embed resources via Gemini embeddings
- [x] 5.3 Write `setup_db.sql` for Supabase schema + pgvector extension

### 🔷 STEP 6 — Recommendation Engine (`engines/recommendation.py`)

- [x] 6.1 Create `ScoringBreakdown` + `RecommendedResource` Pydantic schemas
- [x] 6.2 Implement `RecommendationEngine` class
- [x] 6.3 Implement `get_best_resource_for_gap(gap, learner, mastery, rewards)` → `RecommendedResource`
- [x] 6.4 Implement `_score_candidate()` with 6-factor formula
- [x] 6.5 Implement `_compute_difficulty_fit()` scorer
- [x] 6.6 Implement `_compute_time_fit()` scorer
- [x] 6.7 Implement `_compute_prereq_readiness()` scorer
- [x] 6.8 Implement `_compute_format_match()` scorer
- [x] 6.9 Implement `_compute_historical_reward()` scorer
- [x] 6.10 Generate template-based 1-line explanation summary (no LLM)

### 🔷 STEP 7 — Wire Recommendation into Path Generator

- [x] 7.1 Update `generate_timeline()` signature to accept `RecommendationEngine` + learner mastery
- [x] 7.2 Replace `mock_123` stub with real `RecommendationEngine.get_best_resource_for_gap()` call
- [x] 7.3 Update `services/data_access.py` to pass recommendation engine to path generator
- [x] 7.4 Update `api/v1/path.py` to wire the updated data_access call
- [x] 7.5 Expand `schemas/timeline.py` to include scoring and URL fields

### 🔷 STEP 8 — NBA Engine (`engines/nba.py`)

- [x] 8.1 Create `NextBestAction` Pydantic schema
- [x] 8.2 Implement `NBAEngine` class
- [x] 8.3 Implement `compute(modules, recent_scores, is_behind, days_inactive)` → `NextBestAction`
- [x] 8.4 Handle WELCOME_BACK state (inactivity > 7 days)
- [x] 8.5 Handle REVIEW state (last score < 50%)
- [x] 8.6 Handle PRIORITY state (behind schedule)
- [x] 8.7 Handle CELEBRATE state (milestone just completed)
- [x] 8.8 Handle CONTINUE state (default — next non-completed module)
- [x] 8.9 Add `GET /api/v1/paths/nba/{learner_id}` endpoint

### 🔷 STEP 9 — Onboarding Endpoint (`api/v1/onboarding.py`)

- [x] 9.1 Create `ChatRequest` and `ChatResponse` schemas
- [x] 9.2 Rewrite `POST /api/v1/onboarding/chat` to use `LLMService.extract_profile()`
- [x] 9.3 Add follow-up logic: if incomplete and < 3 prior turns → ask follow-up
- [x] 9.4 Add persistence: save chat turns to `chat_history` Supabase table
- [x] 9.5 Add profile confirmation flow
- [x] 9.6 Add `POST /api/v1/onboarding/confirm` to save confirmed profile as learner

### 🔷 STEP 10 — Explanation Endpoint ("Why This?")

- [x] 10.1 Update `recommendations_cache` upsert to happen during path generation
- [x] 10.2 Implement `GET /api/v1/modules/{module_id}/explanation?learner_id=X`
- [x] 10.3 Return cached `scoring_factors` + LLM-generated explanation text
- [x] 10.4 Cache explanation to avoid re-calling LLM on repeated views

### 🔷 STEP 11 — AI Mentor Agent (Stretch)

- [x] 11.1 Create `services/mentor_agent.py`
- [x] 11.2 Define tool functions: `get_my_progress`, `get_skill_gap`, `get_current_path`, `get_next_action`, `search_resources`
- [x] 11.3 Build LangGraph `create_react_agent` with tools + system prompt
- [x] 11.4 Build `MENTOR_SYSTEM_PROMPT` template with learner context injection
- [x] 11.5 Rewrite `POST /api/v1/mentor/chat` to call LangGraph agent
- [x] 11.6 Return `response` + `tools_used` list

### 🔷 STEP 12 — Bug Fixes

- [x] 12.1 Fix `engines/adaptive.py` line 44: mastery ceiling `5` → `3`
- [x] 12.2 Fix `engines/skill_gap.py`: load role taxonomy from `data/skills.json` + DB instead of hardcoded Python dict
- [x] 12.3 Fix `api/v1/path.py`: `get_learner_recommendations()` missing `@router.get` decorator
- [x] 12.4 Fix `engines/adaptive.py` "Struggling": after downgrade, regenerate and save path to DB

---

## Phase 2 — Frontend (Separate Branch)

- [ ] F1 Initialize Next.js + Tailwind + shadcn/ui
- [ ] F2 Set up routing structure (/, /onboarding, /dashboard, /path, /skills)
- [ ] F3 Build Onboarding Chat Interface
- [ ] F4 Build Skill-Gap Analysis page with RadarChart
- [ ] F5 Build Learning Path Timeline (subway map)
- [ ] F6 Build Dashboard (Bento-box: NBA + Progress + Radar + Milestones)
- [ ] F7 Build Resource Detail Slide-over panel
- [ ] F8 Build "Why This?" Explanation Modal
- [ ] F9 Implement Action Buttons (Complete / Skip / Struggling)
- [ ] F10 Implement Framer Motion "Recalculating Route..." animation
- [ ] F11 Build AI Mentor FAB + Chat Popover
- [ ] F12 Connect all pages to Backend API (Axios/fetch)
- [ ] F13 Zustand state management wiring
- [ ] F14 Dark mode support

---

## Phase 3 — Testing & Demo Prep

- [ ] T1 Unit test: skill_gap engine (test 5 scenarios)
- [ ] T2 Unit test: path_generator Kahn's sort (no prereq violations)
- [ ] T3 Unit test: recommendation scoring (same input → same output)
- [ ] T4 Integration test: onboarding → path generation flow
- [ ] T5 Integration test: struggling → refresher injection
- [ ] T6 E2E: full demo path (3-minute script end-to-end)
- [ ] T7 Pre-demo checklist execution

---

## Summary

| Phase | Total Steps | Done | Remaining |
|-------|------------|------|-----------|
| Phase 1 — AI Pipeline | 12 steps / ~55 microsteps | 0 | 55 |
| Phase 2 — Frontend | 14 steps | 0 | 14 |
| Phase 3 — Testing | 7 steps | 0 | 7 |
| **Total** | **76 microsteps** | **0** | **76** |
