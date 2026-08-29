# FINAL API CONTRACT & INTEGRATION GUIDE — PathFinder

> [!IMPORTANT]
> **FRONTEND TEAM (Person 4 & 5):** This is your **Single Source of Truth**. 
> Ignore any outdated endpoints mentioned in older `API_Spec` or `UX_Flow` documents. If you follow the routes in this document exactly, you will not hit 404s.

---

## 1. Global Setup & Integration

### Base URL
All API requests must be prefixed with:
`http://localhost:8000/api/v1`

### Authentication (Supabase Auth)
> [!IMPORTANT]
> **Supabase JWT Authentication IS STRICTLY ENFORCED.**
> You MUST pass an `Authorization: Bearer <token>` header on every API request. The frontend should handle login natively using `@supabase/supabase-js`, get the session token, and pass it to the backend. The backend will verify it using `verify_supabase_jwt`.

### AI / ML Boundary (Person 2's Domain)
Person 2 has implemented the core intelligence:
- **Implemented:** Gemini Goal Extraction, pgvector semantic search, 6-factor recommendation scoring, and the LangGraph AI Mentor (`/mentor/chat`).
- **Stretch Goal (Not Implemented):** Dynamic RAG Assessments/Quizzes. You can safely build dummy UI for quizzes or omit them for the MVP.

---

## 2. Verified API Endpoints

| Method | Actual Endpoint | Purpose |
|--------|----------------|---------|
| `GET` | `/health` | Health Check (No `/api/v1` prefix needed) |
| `POST` | `/api/v1/auth/signup` | Register a new user with Email and Password |
| `POST` | `/api/v1/auth/login` | Login with Email and Password -> Returns `access_token` |
| `GET` | `/api/v1/auth/google` | Returns the Supabase OAuth Redirect URL for Google Login |
| `GET` | `/api/v1/auth/github` | Returns the Supabase OAuth Redirect URL for GitHub Login |
| `POST` | `/api/v1/onboarding/chat` | AI-assisted goal & skill extraction |
| `POST` | `/api/v1/learners/` | Create Learner profile and get `learner_id` |
| `GET` | `/api/v1/learners/{learner_id}` | Fetch full learner profile & mastery state |
| `GET` | `/api/v1/paths/gaps/{learner_id}` | Calculate radar chart skill gaps |
| `GET` | `/api/v1/paths/recommendations/{learner_id}` | Test endpoint for single best resource recommendation |
| `GET` | `/api/v1/paths/generate/{learner_id}` | Generate full subway-map timeline (The Core Path) |
| `GET` | `/api/v1/paths/nba/{learner_id}` | Fetch Next Best Action for Dashboard |
| `POST` | `/api/v1/modules/action` | Complete, Skip, or flag "Struggling" on a module |
| `GET` | `/api/v1/modules/{module_id}/explanation` | Fetch "Why This?" scoring breakdown |
| `POST` | `/api/v1/mentor/chat` | Converse with AI Mentor Agent |

---

## 3. Frontend ↔ Backend Screen Mapping

This table maps every screen required by the `Frontend_Spec` to the exact API that supports it.

| UI Screen | Component | Required API Route | HTTP Method | Expected Input | Expected Output |
|-----------|-----------|--------------------|-------------|----------------|-----------------|
| **Landing** | Hero | N/A | N/A | None | Static UI |
| **Onboarding** | Chat Window | `/api/v1/onboarding/chat` | `POST` | `{ "message": "...", "history": [] }` | `{ "reply": "...", "extracted_profile": {...}, "is_complete": bool }` |
| **Onboarding** | Confirmation Card | `/api/v1/learners/` | `POST` | `LearnerProfileCreate` JSON | `{ "id": "UUID", ... }` -> **Save this to LocalStorage!** |
| **Skill Gap** | Radar Chart | `/api/v1/paths/gaps/{learner_id}` | `GET` | `learner_id` in URL | `{ "gaps": [...], "radar_data": {...} }` |
| **Dashboard** | Next Best Action | `/api/v1/paths/nba/{learner_id}` | `GET` | `learner_id` in URL | `{ "module_id": "...", "title": "..." }` |
| **Timeline** | Subway Map Path | `/api/v1/paths/generate/{learner_id}`| `GET` | `learner_id` in URL | `{ "weeks": [ { "modules": [...] } ] }` |
| **Action** | Complete/Skip/Struggle | `/api/v1/modules/action` | `POST` | `{ "learner_id": "...", "skill_id": "...", "action_type": "complete|skip|struggling" }` | `{ "status": "success", "requires_recalculation": bool }` |
| **Details** | "Why This?" Modal | `/api/v1/modules/{module_id}/explanation` | `GET` | `module_id` in URL, `?learner_id=UUID` in Query | `{ "scoring_factors": {...}, "explanation": "..." }` |
| **Mentor** | Chat FAB | `/api/v1/mentor/chat` | `POST` | `{ "learner_id": "...", "message": "...", "history": [] }` | `{ "reply": "..." }` |
