# PathFinder — REST API Specification & Backend Architecture

---

## 1. Backend Architecture (FastAPI)

### 1.1 Project Structure
The backend follows a clean, layered architecture separating routing (API), business logic (Engines/Services), data access (CRUD/DB), and AI abstraction.

```text
backend/
├── main.py                  # FastAPI application entry point, CORS, and Exception Handlers
├── core/
│   ├── config.py            # Pydantic BaseSettings for environment variables
│   ├── exceptions.py        # Custom application exceptions (e.g., ResourceNotFound)
│   └── logging.py           # Structured logging configuration
├── api/                     # Controller Layer (FastAPI Routers)
│   ├── v1/
│   │   ├── onboarding.py    # /api/v1/onboarding endpoints
│   │   ├── learner.py       # /api/v1/learner endpoints
│   │   ├── path.py          # /api/v1/path endpoints (generation, gaps)
│   │   ├── modules.py       # /api/v1/modules endpoints (progress, explanation)
│   │   └── mentor.py        # /api/v1/mentor endpoints
├── schemas/                 # Pydantic Models (Request/Response validation)
│   ├── learner.py
│   ├── path.py
│   ├── request.py
│   └── response.py
├── engines/                 # Business Logic (Deterministic algorithms)
│   ├── skill_gap.py         # Skill-gap computation
│   ├── recommendation.py    # Multi-factor scoring
│   ├── path_generator.py    # Topological sort & timeline
│   └── adaptive.py          # Adaptation triggers (Struggling, Skip)
├── services/                # External/AI Integrations
│   ├── llm.py               # OpenAI/Gemini abstraction
│   ├── vector_store.py      # Supabase pgvector client wrapper
│   ├── mentor_agent.py      # LangGraph Stateful Agent + Tool Bindings
├── db/                      # Data Access Layer (Supabase PostgreSQL)
│   ├── database.py          # Supabase client initialization
│   └── crud.py              # Repository functions (get, create, update via Supabase SDK)
└── requirements.txt         # Dependencies
```

### 1.2 Configuration & Environment Variables (`core/config.py`)
Managed via Pydantic `BaseSettings`.
*   `SUPABASE_URL` and `SUPABASE_KEY`: Supabase API credentials.
*   `OPENAI_API_KEY` / `GEMINI_API_KEY`: Keys for LLM extraction/generation.
*   `SUPABASE_DB_URL`: PostgreSQL connection string for pgvector.
*   `CORS_ORIGINS`: Comma-separated list of allowed origins (e.g., `http://localhost:3000`).

### 1.3 CORS, Versioning, and Authentication
*   **CORS:** Enabled in `main.py` using `CORSMiddleware`, restricting to frontend domains.
*   **Versioning:** All endpoints are prefixed with `/api/v1/`.
*   **Authentication:** Supabase Auth is integrated. Endpoints require a valid Supabase JWT verified via a FastAPI dependency (`Depends(verify_supabase_jwt)`).

### 1.4 Error Handling
Custom global exception handlers in `main.py` return consistent JSON errors.
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Learner profile not found.",
    "details": {}
  }
}
```

---

## 2. API Endpoints

*Note: All endpoints assume the base URL `http://localhost:8000/api/v1`*

### 2.1 Health Check
*   **Method:** `GET`
*   **URL:** `/health`
*   **Purpose:** Verify API, DB, and LLM connectivity.
*   **Response:** `{"status": "ok", "db": "connected", "llm": "ready"}`

### 2.2 Onboarding (Chat Profile Extraction)
*   **Method:** `POST`
*   **URL:** `/onboarding/chat`
*   **Purpose:** Process a user's natural language goal and extract a structured profile.
*   **Request Schema:**
    ```json
    {
      "message": "I know python, want to be an ML engineer in 6 months",
      "history": [{"role": "assistant", "content": "Hi..."}]
    }
    ```
*   **Response Schema:**
    ```json
    {
      "reply": "Got it. You want to be an ML Engineer. Is this correct?",
      "extracted_profile": {
        "target_role_id": "role_ml_engineer",
        "current_skills": [{"skill_id": "python", "level": 2}],
        "time_budget_hours": 10
      },
      "is_complete": true
    }
    ```
*   **Validation:** Pydantic checks message length.
*   **Errors:** `400 Bad Request` (Empty message), `503 Service Unavailable` (LLM timeout).

### 2.3 Learner Profile / Goal Creation
*   **Method:** `POST`
*   **URL:** `/learners`
*   **Purpose:** Save the confirmed profile and initialize the learner state.
*   **Request Schema:** `LearnerProfileCreate` (Target role, skills, time budget, preferences).
*   **Response Schema:** `LearnerProfileResponse` (Returns created UUID).
*   **Errors:** `422 Unprocessable Entity` (Invalid schema).

### 2.4 Get Learner Profile
*   **Method:** `GET`
*   **URL:** `/learners/{learner_id}`
*   **Purpose:** Retrieve learner data and current mastery map.
*   **Authentication:** Requires a valid Supabase JWT Bearer token in the `Authorization` header.
*   **Response Schema:** `LearnerProfileDetail` (Includes `mastery_map`).
*   **Errors:** `404 Not Found`.

### 2.5 Skill-Gap Analysis
*   **Method:** `GET`
*   **URL:** `/path/{learner_id}/skill-gap`
*   **Purpose:** Calculate deterministic gaps between learner mastery and target role.
*   **Response Schema:**
    ```json
    {
      "gaps": [
        {"skill_id": "math_prob", "name": "Probability", "current_level": 0, "required_level": 1, "severity": "high"}
      ],
      "radar_data": {"labels": [...], "current": [...], "required": [...]}
    }
    ```

### 2.6 Learning-Path Generation
*   **Method:** `POST`
*   **URL:** `/path/{learner_id}/generate`
*   **Purpose:** Execute Semantic Retrieval -> Scoring -> Topological Sort to create the roadmap.
*   **Response Schema:** `LearningPathResponse` (List of ordered modules, milestones, estimated weeks).
*   **Errors:** `500 Internal Server Error` (DAG cycle detected or Vector DB failure).

### 2.7 Get Dashboard
*   **Method:** `GET`
*   **URL:** `/dashboard/{learner_id}`
*   **Purpose:** Aggregated endpoint returning data for the main UI.
*   **Response Schema:**
    ```json
    {
      "progress": {"completed": 2, "total": 10, "percentage": 20},
      "next_best_action": {"module_id": "res_104", "title": "Start Pandas"},
      "active_path": {...},
      "recent_activity": [...]
    }
    ```

### 2.8 Course/Resource Details & Recommendations
*   **Method:** `GET`
*   **URL:** `/modules/{module_id}`
*   **Purpose:** Fetch full metadata for a learning resource.
*   **Response Schema:** `ResourceDetail` (Title, description, URL, duration, skills covered).

### 2.9 Recommendation Explanations ("Why This?")
*   **Method:** `GET`
*   **URL:** `/modules/{module_id}/explanation`
*   **Authentication:** Requires a valid Supabase JWT Bearer token in the `Authorization` header.
*   **Purpose:** Fetch the scoring breakdown and LLM-generated explanation for why a module was recommended to *this specific user*.
*   **Response Schema:**
    ```json
    {
      "scoring_factors": {"semantic_fit": 0.9, "difficulty_fit": 0.8, "time_fit": 1.0},
      "explanation": "This fits your goal because it covers Pandas (your #1 gap)..."
    }
    ```

### 2.10 Progress Updates (Start / Complete / Skip)
*   **Method:** `POST`
*   **URL:** `/modules/{module_id}/action`
*   **Purpose:** Log a user action, update progress, and conditionally trigger adaptation.
*   **Request Schema:**
    ```json
    {
      "action": "complete", // 'start', 'complete', 'skip'
      "score": 85 // Optional, if assessment was taken
    }
    ```
*   **Response Schema:**
    ```json
    {
      "success": true,
      "mastery_updated": true,
      "adaptation_triggered": false
    }
    ```

### 2.11 Adaptive Recommendations ("Struggling")
*   **Method:** `POST`
*   **URL:** `/modules/{module_id}/struggling`
*   **Purpose:** Explicitly trigger the Adaptive Engine to insert a prerequisite refresher.
*   **Response Schema:**
    ```json
    {
      "adaptation_applied": true,
      "inserted_module": {"id": "res_refresher_1", "title": "Probability Review"},
      "updated_path": {...} // The new timeline
    }
    ```

### 2.12 Skill Assessment
*   **Method:** `GET`
*   **URL:** `/assessment/{skill_id}`
*   **Purpose:** Retrieve a dynamic 3-question MCQ quiz for a skill to verify mastery.
*   **Response Schema:** `List[Question]` (Question text, options, correct index).

### 2.13 Milestone Completion
*   **Method:** `POST`
*   **URL:** `/path/{learner_id}/milestones/{milestone_id}/unlock`
*   **Purpose:** Verify a milestone's skills are met and unlock it. 
*   **Response Schema:** `{"unlocked": true, "project_recommendation": {...}}`

### 2.14 Project Recommendations
*   *(Handled via the Path Generation endpoint (2.6) which inserts projects at milestones, or via Milestone Completion (2.13).)*

### 2.15 AI Mentor / Chat
*   **Method:** `POST`
*   **URL:** `/api/v1/mentor/chat` (or `/api/v1/mentor/stream` for SSE)
*   **Purpose:** Interact with the LangGraph Stateful Tool-using Agent via standard FastAPI endpoints.
*   **Request Schema:** `{"learner_id": "123", "message": "Why is math before ML?"}`
*   **Response Schema:** `{"response": "Math is recommended because...", "tools_used": ["get_skill_gap", "get_current_path"]}`

### 2.16 Feedback
*   **Method:** `POST`
*   **URL:** `/modules/{module_id}/feedback`
*   **Purpose:** Submit explicit thumbs up/down to update the `Historical_Reward` weighting.
*   **Request Schema:** `{"rating": 1}` // 1 or -1

---

## 3. Ordered Implementation Plan (Backend)

Follow this order to ensure dependencies are met and blockers are minimized during the hackathon.

### Phase 1: Foundation & Data Access (Hours 1-3)
1.  **Setup:** Initialize FastAPI project, Pydantic settings, and `requirements.txt`. Add CORS middleware.
2.  **Database Schema:** Set up Supabase PostgreSQL tables matching the Data Model schemas (Learners, Skills, Paths).
3.  **Seed Data Loading:** Write a startup script to load `skills.json` and `prerequisites.json` into Supabase.
4.  **Vector DB Setup:** Initialize Supabase pgvector using `langchain-postgres`. Write `seed_supabase.py` to embed resources via OpenAI API and store them in pgvector.

### Phase 2: Core Engines (Hours 3-6)
*(Develop these as pure Python functions, testing them independently of FastAPI)*
5.  **Skill-Gap Engine:** Implement array comparison logic between target role and current skills.
6.  **Recommendation Engine:** Implement pgvector querying via LangChain and the multi-factor scoring formula.
7.  **Path Generator Engine:** Implement Kahn's Algorithm for Topological Sort on the prerequisite DAG.

### Phase 3: Core API Endpoints (Hours 6-10)
8.  **Learner API:** Implement `POST /learners` and `GET /learners/{id}`.
9.  **Skill Gap & Path API:** Wire up the engines to `GET /path/{id}/skill-gap` and `POST /path/{id}/generate`.
10. **Action API:** Implement `POST /modules/{id}/action` to log progress and update the learner's `mastery_map` in the DB.
11. **Dashboard API:** Create the `GET /dashboard/{id}` aggregator endpoint to serve the frontend in one network call.

### Phase 4: Intelligence & Adaptation (Hours 10-14)
12. **Onboarding LLM:** Implement `POST /onboarding/chat` using OpenAI Structured Outputs (JSON mode) to parse profiles.
13. **Explainability:** Implement `GET /modules/{id}/explanation` to pass scoring factors to an LLM template.
14. **Adaptive Triggers:** Implement `POST /modules/{id}/struggling` to query the DAG, find a refresher, and patch the learning path JSON in the DB.

### Phase 5: Stretch Goals & Polish (Hours 14+)
15. **AI Mentor:** Implement `POST /mentor/chat` using LangChain. Define tools (`get_path`, `explain_module`) and bind them to the agent.
16. **Assessments:** Implement `GET /assessment/{skill_id}` using LLM generation to create on-the-fly quizzes.
17. **Error Handling:** Review all endpoints. Add try/catch blocks for LLM timeouts and Supabase failures, returning graceful fallback data.
