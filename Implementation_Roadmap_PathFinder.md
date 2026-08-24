# PathFinder — Implementation Roadmap & Execution Plan

---

## Part 1: Phase-by-Phase Implementation Roadmap

This roadmap prioritizes a working end-to-end MVP. It strictly separates deterministic engines from LLM layers to enable parallel development.

### Phase 1 — Repository and Project Setup
*   **Tasks:** Initialize Git repo, setup Next.js frontend, setup FastAPI backend, configure linters/formatters.
*   **Files/Modules to create:**
    *   `frontend/` (Next.js app, package.json, tailwind.config.js)
    *   `backend/` (main.py, requirements.txt)
    *   `.gitignore`, `README.md`
*   **Dependencies:** None.
*   **Expected Output:** Both frontend and backend servers run locally (e.g., `localhost:3000` and `localhost:8000/docs`).
*   **Acceptance Criteria:** Backend serves a `/health` endpoint. Frontend shows a basic "Hello World" page.
*   **Estimated Difficulty:** Low
*   **Parallel Development:** Backend and Frontend environments can be set up simultaneously.

### Phase 2 — Database and Seed Data
*   **Tasks:** Define SQLAlchemy ORM models, curate JSON seed data (Skills, Prereqs, Resources), write script to load seed data into SQLite and ChromaDB.
*   **Files/Modules to create:**
    *   `backend/db/models.py`, `backend/db/database.py`
    *   `backend/data/skills.json`, `prerequisites.json`, `resources.json`
    *   `scripts/seed_db.py`, `scripts/seed_vectordb.py`
*   **Dependencies:** Phase 1 (Backend).
*   **Expected Output:** Populated SQLite database and local ChromaDB instance.
*   **Acceptance Criteria:** Can query a resource by ID from SQLite and perform a basic similarity search in ChromaDB.
*   **Estimated Difficulty:** Medium (Data curation is time-consuming).
*   **Parallel Development:** Data curation (JSON files) can happen independently of ORM setup.

### Phase 3 — Backend Foundation
*   **Tasks:** Implement basic CRUD endpoints (Learner creation), setup core Pydantic schemas, and define the LLM Service abstraction.
*   **Files/Modules to create:**
    *   `backend/schemas/learner.py`
    *   `backend/api/v1/learner.py`
    *   `backend/services/llm.py`
*   **Dependencies:** Phase 2 (Database).
*   **Expected Output:** API endpoints to create and fetch a Learner profile.
*   **Acceptance Criteria:** `POST /api/v1/learners` successfully writes to SQLite and returns a UUID.
*   **Estimated Difficulty:** Low.
*   **Parallel Development:** Frontend can start building UI components (Phase 11) using mock data.

### Phase 4 & 5 — Goal, Skill Extraction & Learner Profiling
*   **Tasks:** Implement the Onboarding LLM chain using LangChain `with_structured_output` to parse chat history into a Pydantic `LearnerProfile`.
*   **Files/Modules to create:**
    *   `backend/api/v1/onboarding.py`
    *   Prompt templates in `services/llm.py`
*   **Dependencies:** Phase 3 (LLM Service).
*   **Expected Output:** Endpoint that takes natural language and returns a JSON profile.
*   **Acceptance Criteria:** Inputting "I want to be an ML Engineer" returns a parsed JSON with `target_role: role_ml_eng`.
*   **Estimated Difficulty:** Medium (Prompt engineering and validation).

### Phase 6 — Skill-Gap Engine
*   **Tasks:** Implement the deterministic array comparison algorithm to find gaps between a target role and current skills.
*   **Files/Modules to create:**
    *   `backend/engines/skill_gap.py`
    *   `backend/api/v1/path.py` (wiring it up)
*   **Dependencies:** Phase 2 (Seed Data - Taxonomy).
*   **Expected Output:** Algorithm returning prioritized skill gaps.
*   **Acceptance Criteria:** Given a learner with Python Level 2 and a target requiring Python Level 3, the engine returns a gap of 1 with medium priority.
*   **Estimated Difficulty:** Medium (Prioritization math).

### Phase 7 — Hybrid Search & Recommendation Scoring
*   **Tasks:** Implement Hybrid Search (ChromaDB semantic search + explicit Metadata filtering) and the multi-factor scoring formula.
*   **Files/Modules to create:**
    *   `backend/engines/recommendation.py`
    *   `backend/services/vector_store.py`
*   **Dependencies:** Phase 2 (ChromaDB Seeded), Phase 6 (Skill Gaps).
*   **Expected Output:** Function that takes a `SkillGap` and returns a ranked list of `Resource` objects.
*   **Acceptance Criteria:** Returns courses matching the learner's difficulty tolerance and time budget constraints.
*   **Estimated Difficulty:** High (Tuning the scoring weights).

### Phase 8 — Learning-Path Generator
*   **Tasks:** Implement the DAG Topological Sort (Kahn's Algorithm) to order the skill gaps, assign resources from Phase 7, and chunk them into weeks.
*   **Files/Modules to create:**
    *   `backend/engines/path_generator.py`
*   **Dependencies:** Phase 6, Phase 7.
*   **Expected Output:** A fully sequenced learning path timeline JSON.
*   **Acceptance Criteria:** The generated path never violates a prerequisite constraint (e.g., Math is ALWAYS before ML).
*   **Estimated Difficulty:** High (Graph traversal logic).

### Phase 9 — LangGraph Stateful Mentor & LangServe
*   **Tasks:** Implement a LangGraph stateful agent for the Mentor, add custom tools, and expose it via LangServe.
*   **Files/Modules to create:**
    *   `backend/services/mentor_agent.py`
    *   `backend/api/v1/mentor.py` (LangServe routes)
*   **Dependencies:** Phase 6 (Skill-Gap).
*   **Expected Output:** Conversational endpoint for the Mentor UI.
*   **Acceptance Criteria:** Agent can accurately answer "Why is Statistics in my path?" by calling the `get_skill_gap` tool.
*   **Estimated Difficulty:** High (Agent reliability and hallucination prevention).

### Phase 10 — Progress & Adaptation (Plus RAG Assessments)
*   **Tasks:** Implement progress tracking (`POST /action`), the rule-based "Struggling" triggers, and the LangChain RetrievalQA chain for RAG-powered dynamic quiz assessments.
*   **Files/Modules to create:**
    *   `backend/api/v1/modules.py`
    *   `backend/engines/adaptive.py`
*   **Dependencies:** Phase 8 (Path Generator).
*   **Expected Output:** Path successfully recalculates and updates the DB when an action is logged.
*   **Acceptance Criteria:** Hitting the `/struggling` endpoint injects a prerequisite "refresher" module before the current module in the path JSON.
*   **Estimated Difficulty:** Medium.

### Phase 11 & 12 — Dashboard & Frontend Integration
*   **Tasks:** Build the React/Next.js components (Timeline, Radar Chart, Chat Interface) and wire them to the FastAPI endpoints.
*   **Files/Modules to create:**
    *   `frontend/components/...`
    *   `frontend/app/...`
    *   `frontend/lib/api.ts`
*   **Dependencies:** Phases 3-10 (Backend APIs).
*   **Expected Output:** A fully functional web application.
*   **Acceptance Criteria:** A user can complete the entire onboarding flow, view their generated path, click "Struggling", and see the timeline animate to recalculate.
*   **Estimated Difficulty:** High (State management and animations).
*   **Parallel Development:** UI components can be built using mock JSON responses from Day 1, long before the backend is finished.

### Phase 13, 14, 15 — Testing, Deployment & Demo Prep
*   **Tasks:** End-to-end manual testing of the critical path. Fix critical bugs. Write a tight 3-minute demo script. Run the stack locally for the presentation (or deploy to Vercel/Render if required).
*   **Dependencies:** Phase 12.
*   **Acceptance Criteria:** A flawless 3-minute walk-through without crashes or infinite LLM loading spinners.

---

## Part 2: Team Roles & Work Division (5-Person Team)

To move fast, the team must operate in parallel.

### 1. The Architect / Engine Lead (Person A)
*   **Focus:** Core algorithms, determinism, graph theory.
*   **Owns:** Skill-Gap Engine (Phase 6), Path Generator/DAG (Phase 8), Adaptive Engine (Phase 10).
*   **Why:** These engines require tight mathematical/logic cohesion. They don't need APIs or UIs to be tested.

### 2. The AI / Data Engineer (Person B)
*   **Focus:** LLMs, Vector DB, Prompt Engineering.
*   **Owns:** Seed Data Curation (Phase 2), ChromaDB setup, Recommendation Scoring (Phase 7), AI Mentor Agent (Phase 9), LLM Extraction prompts (Phase 4).
*   **Why:** Concentrates all token-handling and embedding logic with one person.

### 3. The Backend API Developer (Person C)
*   **Focus:** FastAPI, Database, Routing, Schema Validation.
*   **Owns:** FastAPI setup (Phase 1), SQLAlchemy DB/CRUD (Phase 2, 3), API Routers wiring up Person A & B's engines to the web (Phase 4, 10, etc.).
*   **Why:** Ensures API contracts are respected and database state is managed cleanly. Acts as the bridge between engines and frontend.

### 4. The Frontend Logic Lead (Person D)
*   **Focus:** React State, API Integration, Complex Visuals.
*   **Owns:** Zustand store, Axios/Fetch hooks (Phase 12), Radar Chart integration, Path Timeline component logic, Recalculation animations.
*   **Why:** Handles the heavy lifting of mapping complex nested JSON to the DOM.

### 5. The UX/UI Polish Lead (Person E)
*   **Focus:** CSS, Tailwind, User Flows, Components.
*   **Owns:** Next.js setup (Phase 1), Landing Page, Onboarding Chat UI, Dashboard Bento-box layout, Module Details slide-over, Dark mode.
*   **Why:** Ensures the app looks premium and professional, unblocking Person D to focus on state logic.

---

## Part 3: Recommended Git & GitHub Workflow

For a 48-hour hackathon, standard enterprise git flow (feature branches -> PRs -> CI/CD) is too slow. Use a **Trunk-Based / Fast-PR Workflow**.

### 1. Branch Naming
Keep it simple.
*   `ui/dashboard-layout`
*   `api/path-generator`
*   `ai/mentor-agent`
*   `data/seed-json`

### 2. The Golden Rule of `main`
*   **The `main` branch must ALWAYS compile and run.**
*   Broken code belongs on your branch. If you break `main`, you fix it immediately before doing anything else.

### 3. Fast PRs (No Blockers)
*   Don't wait for formal code reviews.
*   When a feature works locally, push it, open a PR, and announce it in the team chat: *"PR #12 open: Skill-Gap Engine. Anyone want to eyeball it?"*
*   If no one objects in 15 minutes, **Merge it yourself**.
*   Merge conflicts are resolved by the person merging.

### 4. API Contract Repository
*   Since the Frontend (Person D/E) and Backend (Person C) are working in parallel, establish the JSON API contracts in Phase 1 (use the `API_Spec_PathFinder.md`).
*   Frontend devs should mock these JSON responses immediately to build the UI, replacing them with real `fetch` calls when Person C merges the actual endpoint.

### 5. Continuous Integration (Optional but recommended)
*   Set up a simple GitHub Action that just runs `npm run build` and `pytest` on PRs. This catches syntax errors before they hit `main`. Do not write extensive unit tests; write just enough to ensure the core algorithms (DAG sorting, Scoring) work.
