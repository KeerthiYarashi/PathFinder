# PathFinder — Product Requirements Document (Team Review Edition)

## 1. Product Overview
**PathFinder** is an adaptive AI learning companion that understands where a learner is, determines where they need to go, creates a personalized learning path, and continuously learns from their performance and behaviour to modify that path as they learn.

**What problem it solves:** While there are millions of courses online, learners often struggle to figure out *what order* to take them in, ending up frustrated by courses that are too advanced or bored by courses that teach things they already know. They lack a personalized sequence — and when they do find a roadmap, it never adapts to how they actually learn.

**Who it is for:** College students and self-taught learners who have a specific goal (e.g., "Become a Data Scientist") but don't know the exact steps to get there.

**Why existing platforms are insufficient:** Generic roadmaps (like "Top 10 Python Courses") assume everyone starts from zero. They don't account for what a learner already knows, how much time they have, or adapt when the learner gets stuck. Even platforms that offer initial personalization generate a static plan that never evolves.

**What makes PathFinder different:** It acts like a GPS for learning — one that continuously recalculates. It identifies your specific skill gaps, generates a prerequisite-aware timeline, and dynamically recalculates your route based on assessment performance, behavioural signals, and learning history. Two learners with the same goal will receive different recommendations over time because PathFinder continuously learns from each learner's unique journey.

---

## 1A. Web + App Product Strategy

| Platform | Role | Primary Use |
|----------|------|-------------|
| **React Native Mobile App** | Primary learner experience | Daily learning, progress tracking, AI Mentor, roadmap, next actions |
| **Web Application** | Complementary access | Desktop users, judges, resume/JD workflows, broader accessibility |
| **Shared Backend** | Unified API layer | Both clients use the same APIs, learner state, recommendation engine and AI services |

**Goal:** Deliver the convenience of an app without losing the immediate accessibility of a web deployment.

---

## 1B. What Changes from the Original Approach

| Dimension | Original Approach | New PathFinder Approach |
|-----------|-------------------|-------------------------|
| Roadmap | Personalized roadmap generated once from initial profile | Continuously adaptive roadmap that changes as the learner progresses |
| Personalization Signals | Mostly profile + skill-gap driven | Profile + behaviour + assessment performance + learning history driven |
| Learning Sequences | Hardcoded/common learning sequences for MVP | Curated knowledge base + dynamic algorithms generate the path |
| Role of LLM | LLM could be heavily involved in recommendations | LLM handles understanding; algorithms make core decisions |
| Feedback | Simple feedback such as "too difficult" | Assessment-driven adaptation plus behavioural signals |
| Scoring | Recommendation based mainly on resource fit | Multi-factor scoring + learner-specific reward history |
| Learner Profile | Static learner profile | Continuously updated learner state |

---

## 2. Product Goal
**Main goal:** To provide learners with a dynamic, highly personalized roadmap that adapts to their progress and feedback in real-time.

**What success looks like:** A learner can input their goal and current skills, immediately receive a customized timeline of learning modules, and successfully follow that path to completion with the AI adjusting the difficulty when necessary.

**What the user accomplishes:** Reaching their learning goal efficiently without wasting time on redundant material or getting permanently blocked by missing prerequisites.

---

## 3. Target Users and Example Scenario
**User Types:**
1. **The Beginner:** Wants to reach a goal from scratch (e.g., "Learn Web Dev").
2. **The Skill Switcher:** Has some skills but wants to pivot (e.g., "Knows Python, wants to do Machine Learning").

**Detailed Example Scenario:**
*Arjun is a 3rd-year engineering student. He says: "I know basic Python, I want to become an ML Engineer, I have 10 hours a week, and I want to be ready in 6 months."*

PathFinder analyzes Arjun's profile. Instead of telling him to take a generic "Intro to Programming" course, it skips basic Python. It identifies a gap in Statistics and Linear Algebra. It generates a 6-month roadmap starting exactly at Statistics, moving to Pandas/NumPy, and then to Machine Learning, ensuring the sequence fits within his 10-hour weekly budget.

---

## 4. Core Features

### A. Conversational & Multimodal Onboarding (The "Wow" Entry)
* **Why we need it:** Forms are boring. Chat is good, but instant analysis is better.
* **What it does:** Users can simply upload their **Resume (PDF)** or paste a **Job Description (JD)** they want to apply for. The AI instantly extracts their current skills from the resume and their target skills from the JD to build the profile in seconds, using the chat only for follow-up clarifications.
* **When it is used:** First time the user opens the app.
* **What the user sees:** A drag-and-drop zone for resumes/JDs, followed by a chat interface.
* **What the system produces:** A structured JSON profile (a standardized data format that the application code can easily read).
* **Incomplete answers:** If answers are unclear, the AI politely asks follow-up clarifying questions before proceeding.

### B. Learner Profile & Continuous Learner State
* **Why we need it:** To remember the user across sessions and continuously adapt to their evolving behaviour.
* **What it does:** Stores the extracted goals, current skills (and proficiency levels), time budget, and learning history. Beyond the initial profile, PathFinder maintains a **continuously updated learner state** that evolves after every interaction.
* **Learner State Signals:**
  * **Skill mastery** — current estimated proficiency for each relevant skill, updated after assessments.
  * **Assessment scores** — performance on quizzes or module assessments.
  * **Completion behaviour** — completion rate, time taken per module, and abandonment patterns.
  * **Resource preference** — observed preference for videos, articles, projects, exercises, etc.
  * **Difficulty tolerance** — how the learner responds to increasingly difficult content.
  * **Struggle/skip history** — repeated weak areas and content that is consistently skipped.
* **How it connects:** This learner state is fed into the Skill-Gap Analyzer, the Recommendation Engine, and the Adaptive Recalculation layer. Two learners with the same goal will therefore receive different recommendations over time.

### C. Skill-Gap Analysis
* **Why we need it:** To figure out exactly what the user is missing.
* **What it does:** Compares the skills required for the target goal against the user's current skills.
* **Handling known skills:** If the user already knows Python, Python is removed from the gap list.
* **What the user sees:** A visual Radar Chart (a circular graph highlighting strengths and weaknesses) or Gap Table showing what they know vs. what they need to learn.
* **Example:** Goal requires React (Intermediate). User has React (None). Gap = Learn React.

### D. Recommendation Engine with Multi-Factor Scoring & Explainable AI (XAI)
* **Why we need it:** To match the skill gap to actual learning content using algorithmic intelligence, not just LLM prompts, while building user trust.
* **How it works (two-stage pipeline):**
  1. **Retrieval:** Candidate resources are retrieved using semantic similarity (embeddings/vector search) and metadata filters (difficulty, duration, type).
  2. **Ranking:** Retrieved candidates are ranked by an explicit multi-factor scoring system.
* **Scoring Factors:**
  * Skill-gap relevance — how directly the resource addresses the learner's gaps.
  * Prerequisite relevance — whether the learner has the prerequisites for this resource.
  * Difficulty fit — match between resource difficulty and learner's current level + tolerance.
  * Time fit — does it fit within the learner's weekly budget?
  * Learning preference — video vs. article vs. project alignment.
  * Previous performance — how the learner performed on similar content.
  * Historical learner reward — reinforcement signal from past interactions.
* **Explainability (XAI):** Next to every recommended course is a "Why was this chosen?" button. Clicking it reveals the AI's logic (e.g., "Your goal requires *Advanced Pandas*, but you only have *Basic Python*. This course was selected because it bridges that exact gap and fits your 2-hour-per-week budget.")
* **Role of the LLM:** The LLM can explain the final recommendation in natural language, but it should not be the only component deciding which course/resource wins. The scoring algorithm makes the core decision.

### E. Prerequisite-Aware Learning Path
* **Why we need it:** To prevent learners from taking advanced topics before fundamentals.
* **What it does:** Orders the recommended modules into a strict chronological timeline.
* **How it works:** It looks at a prerequisite map. If you need ML, it schedules Statistics *before* ML.
* **Example:** Python (skipped, already known) → Statistics → Data Preprocessing → Scikit-learn → Capstone Project.
* **Milestones:** Major achievements (e.g., "Data Cleaning Master") are inserted after key modules.

### F. Next Best Action (NBA) Engine
* **Why we need it:** To eliminate choice paralysis.
* **What it answers:** "What is the single most useful thing I should do right now?"
* **How it adapts:** If you are on schedule, it suggests the next module. If you failed a quiz, the NBA changes to "Review this math concept." If you are behind schedule, it suggests a shorter priority resource.

### G. Progress Tracking
* **Why we need it:** To motivate the learner and trigger adaptations.
* **What the learner does:** Marks modules as *Started*, *Completed*, *Skipped (too easy)*, or *Struggling (too hard)*.
* **What happens:** The overall progress bar updates. If marked "Struggling", it triggers the Adaptive Learning engine.

### H. Assessment-Driven Adaptive Learning & Reinforcement-Based Recommendation
* **Why we need it:** Static roadmaps fail when reality hits. Relying only on a manual "too difficult" button is not enough — modules should include lightweight assessments that drive adaptation automatically.

**Assessment-Driven Adaptation:**
  * *High score / fast completion:* Increase difficulty or compress the roadmap — skip or fast-track redundant material.
  * *Low score:* Identify a weak prerequisite and insert a refresher module before the learner continues.
  * *Repeated failure:* Move further backward in the prerequisite graph to find the foundational gap.
  * *Repeated success:* Skip or compress redundant material and accelerate the timeline.
  * *Goal change:* Recalculate the roadmap while preserving completed skills.

**Reinforcement-Based / Adaptive Recommendation Layer:**
  The system uses a reward-based or contextual-bandit-style recommendation approach. This is presented as adaptive/reinforcement-based personalization rather than claiming sophisticated Deep Reinforcement Learning.

  * **Feedback loop:** Recommendation → learner action → assessment/behaviour → reward signal → learner-state update → re-ranking → next recommendation.
  * **Positive reward signals:** Successful completion, assessment score improvement, preference alignment.
  * **Negative reward signals:** Abandonment, repeated failure, excessive time spent.
  * **Effect:** The reward history influences future recommendation scoring, so the system learns what works for each individual learner over time.

### I. AI Mentor (Contextual Agentic AI)
* **Why we need it:** To provide contextual help and safely execute scoped actions via tool-calling. The AI Mentor is contextual rather than a generic chatbot.
* **What it knows:** The learner's current goal, skills, progress, skill gaps, active module, and full learner state.
* **Available Tool Functions:**
  * `get_progress()` — retrieve the learner's current progress and completion status.
  * `get_skill_gap()` — retrieve the current skill-gap analysis.
  * `mark_module_complete()` — mark a module as completed (with learner confirmation).
  * `skip_module()` — skip a module and adjust the roadmap (with learner confirmation).
  * `trigger_recalculation()` — trigger a full adaptive recalculation of the learning path (with learner confirmation).
* **State-changing actions** should be controlled and confirmed by the learner — the Mentor always asks before executing.
* **Difference from generic chatbot:** It uses a structured tool-calling agent (LangChain & LangGraph ReAct Agent) rather than just generating text, with access to the learner's full context. It can Reason and Act in a loop, but remains strictly scoped to a controlled set of functions.

### J. Dashboard
* **What it displays:** 
  1. The Next Best Action (hero card).
  2. Overall progress bar (%).
  3. Interactive timeline of the learning path (past, present, future).
  4. Skill Radar chart showing growth.
  5. The floating AI Mentor chat.

---

## 5. Complete End-to-End Product Flow

1. **Onboarding:** User enters goal/profile or uploads Resume + JD.
2. **Document Processing:** Documents are extracted and interpreted into a structured learner/target profile (digital PDF → direct text extraction; scanned/image PDF → OCR fallback).
3. **Learner & Target Profile:** System structures input into a saved, queryable learner profile and target-role profile.
4. **Skill-Gap Engine:** Compares current skills against target requirements to produce a prioritized gap report.
5. **Prerequisite Graph:** Determines dependencies and ordering constraints.
6. **Resource Retrieval:** Semantic similarity search + metadata filters find relevant courses, projects and learning materials.
7. **Recommendation Scoring:** Multi-factor scoring ranks the candidates (skill-gap relevance, difficulty fit, time fit, preference, learner reward history).
8. **Personalized Roadmap & Milestones:** A visual, prerequisite-aware timeline is generated.
9. **Learning & Assessments:** Learner studies, completes modules and takes lightweight assessments.
10. **Behaviour & Performance Update:** Completion behaviour, assessment scores and interaction signals update the learner state.
11. **Reward / Adaptive Layer:** Re-ranks future resources and recalculates the learning path based on updated learner state.
12. **Next Best Action:** The dashboard's primary guidance updates to the single most useful thing the learner should do right now.
13. **AI Mentor:** Explains decisions, answers contextual questions and performs a small set of controlled, learner-confirmed actions.
14. **Goal Completion / Evolution:** Learner reaches the final milestone and is prompted to pick a new advanced goal or re-target a new JD.

---

## 6. Differentiating Features

1. **Resume-to-Job-Description Pipeline (Should Have):**
   * *Why it matters:* Connects learning directly to employability, which is the #1 reason people learn online.
   * *Differentiation:* Instead of generic goals, it targets real-world job requirements.
2. **Adaptive Route Recalculation (MVP):**
   * *Why it matters:* Proves the system is intelligent. 
   * *Differentiation:* Actually changing the future path based on a failed quiz or "too difficult" signal.
3. **Explainable AI (XAI) Transparency (MVP):**
   * *Why it matters:* Judges hate "black box" AI. 
   * *Differentiation:* Exposing exactly *why* a course was chosen builds trust and scores high on AI implementation criteria.
4. **Next Best Action Engine (MVP):** 
   * *Why it matters:* Prevents users from getting lost in a massive roadmap.
   * *Differentiation:* Gives a direct, calculated command rather than a generic list.
5. **What-If Time Machine (Stretch):**
   * *Why it matters:* Allows users to see how changing their study hours affects their graduation date.
   * *Demo Impact:* Extremely high; visually impressive slider mechanic.
6. **RPG Skill Tree (Stretch):**
   * *Why it matters:* Gamifies learning. Instead of a boring vertical list, the roadmap is a visual, branching skill tree (like in video games). As users complete modules, nodes glow and unlock the next path.
   * *Demo Impact:* High; visually stunning compared to a standard to-do list.

*Recommendation:* Prioritize the **Next Best Action Engine** and **Adaptive Recalculation** as they form the core intelligence of the product.

---

## 7. Genuine Intelligence — What is AI vs. What is App Logic

Static data is acceptable for the knowledge base. The decision-making should remain dynamic.

### What Stays Curated / Static
* Skill taxonomy, prerequisite relationships, resource metadata, role-to-skill knowledge.

### What is Dynamic (App Logic + Algorithms)
* Skill-gap calculation, prerequisite ordering (topological sort), resource scoring, timeline generation, adaptation, learner-state updates, Next Best Action, reinforcement-based reward updates.

### What Uses the LLM
* Natural-language understanding, ambiguous skill extraction, JD interpretation, recommendation explanations, contextual AI Mentor.

### What Uses Semantic Retrieval
* Embeddings/vector search (e.g., Pinecone/Chroma) identify relevant resources before the scoring layer selects the final recommendation.

### Detailed Breakdown

* **Onboarding & Profile Extraction:** **AI (LLM / LangChain)**. Natural language parsing using structured outputs (forcing the AI to return strict JSON data, not just plain text).
* **Resume & JD Processing:** **Hybrid.** Digital PDF → direct text extraction. Scanned/image PDF → OCR as fallback. Skill extraction combines structured parsing, skill taxonomy matching and LLM interpretation where ambiguity exists. JD interpretation uses the LLM for extracting required skills, proficiency/context and target-role information.
* **Skill Analysis & Gap Detection:** **App Logic**. Array comparison (Required minus Current) with priority scoring based on topological importance.
* **Prerequisite Ordering:** **App Logic**. Graph algorithm (Topological sort) ensures it never hallucinates a bad order.
* **Resource Retrieval:** **AI (RAG / Vector Embeddings)**. Semantic search matches concepts even if keywords don't align perfectly.
* **Recommendation Scoring:** **App Logic**. Multi-factor scoring algorithm (skill-gap relevance + prerequisite relevance + difficulty fit + time fit + learning preference + previous performance + historical learner reward).
* **Recommendation Explanation:** **AI (LLM)**. LLM writes a readable explanation based on the scoring system's logic.
* **AI Mentor:** **Agentic AI (LangChain & LangGraph ReAct Agent)**. Uses tool-calling for scoped functions (`get_progress`, `get_skill_gap`, `mark_module_complete`, `skip_module`, `trigger_recalculation`), always with user confirmation before state changes.
* **Adaptation & Reward Updates:** **App Logic**. Assessment-driven adaptation and reinforcement-based reward signals are strict application logic (triggered by learner actions and assessment results).
* **Learner State Updates:** **App Logic**. Continuously updating skill mastery, assessment scores, completion behaviour, resource preference, difficulty tolerance and struggle/skip history.

---

## 8. Data / Content Required

1. **Skill Taxonomy:** A JSON file acting as a knowledge map that links Roles to Skills, and Skills to Prerequisites (e.g., React requires JS). *Required for Gap Analysis and Path Generation.*
2. **Learning Resources:** A JSON database of ~50 mock courses with difficulty and duration. *Required for the Recommendation Engine.*
3. **Learner Profile:** User's data. *Required for personalization.*
4. **Unstructured Data Parsers (Should Have):** Libraries and prompts for reliable extraction of skills from PDF resumes and free-text Job Descriptions.

---

## 9. Edge Cases and Fallback Behavior

* **Impossible learning goal/deadline:** (e.g., "Learn ML in 1 week"). System warns the user, maxes out weekly hours, and generates a highly compressed "crash course" path.
* **Incomplete information:** AI Mentor politely refuses to generate a path until the user provides at least a goal and current skill level.
* **Learner claims fake skills:** If they claim to know ML but fail the first module, the Adaptive Engine downgrades their skill and inserts beginner prerequisites.
* **No suitable resource found:** System falls back to a generic LLM-generated summary of the topic.
* **Missing prerequisite in DB:** The Graph algorithm flags an error; the system skips the module and notifies the user to find external material.
* **Agent calls wrong tool or misinterprets intent:** Mentor asks for confirmation before executing any state-changing action (e.g. "Want me to skip this module?") rather than acting silently. *Note: Tool-calling safety (confirming before state-changing actions) is the AI Owner's responsibility to implement and test.*
* **Agent gets stuck in a reasoning loop:** Hard timeout/max-iteration limit triggers a fallback to a static canned response.

---

## 10. MVP vs Stretch

### MUST HAVE (MVP)
* Conversational Onboarding (Chat-based)
* Explainable AI (XAI) for Course Recommendations
* Skill Gap Analysis & Radar Chart
* Dashboard with Next Best Action
* Feedback-based Adaptation (struggle → refresher insert)
*Note: For MVP, prerequisite paths can be 3-4 hardcoded common sequences (e.g. ML Engineer, Web Dev, Data Analyst) rather than a general graph solver — expand to full topological sort only if time permits.*

### SHOULD HAVE
* Resume-to-Job-Description Pipeline (Multimodal Onboarding)
* Full Prerequisite-Aware Path Generator (general topological sort)
* AI Mentor Agent (tool-calling)
* Recommendation Engine (weighted scoring)

### STRETCH
* What-If Time Machine
* RPG Skill Tree
* AI Skill Verification Interview

---

## 11. Demo Journey (The 3-5 Minute "Wow")
*(Note: If the Resume/JD pipeline stretch goal isn't ready, the Hook falls back to MVP chat onboarding: "I know Python, want to become an ML Engineer in 6 months...")*

1. **The Hook (Onboarding):** "I want to apply for this Machine Learning role at Google." The user pastes the Job Description and uploads their Resume.
2. **Instant Profile & Gap:** The system instantly parses both, showing a Radar Chart that highlights the exact missing Statistics and ML skills required for that specific job.
3. **Roadmap:** A beautiful 6-month roadmap generates.
4. **Learning Start:** Learner clicks "Start" on the first module (Statistics).
5. **The Struggle:** Learner clicks a button: "This is too difficult."
6. **The "Wow" Moment (Adaptation):** The screen shakes slightly. An alert says *"Recalculating Route..."*
7. **Path Update:** The timeline shifts. A new module ("Basic Probability Refresher") is dynamically inserted *before* Statistics.
8. **Next Best Action:** The Dashboard's main card flips from "Continue Statistics" to "Action Required: Complete Probability Refresher."
9. **AI Mentor:** The chat pops open automatically: *"I noticed Statistics was tough! I've added a quick Probability refresher to help you bridge the gap."*

---

## 12. Feature Dependency Map

```text
Conversational Onboarding
           │
           ▼
    Learner Profile ──────────┐
           │                  │
           ▼                  ▼
    Skill-Gap Analysis ◄── AI Mentor (Context)
           │                  ▲
           ▼                  │
   Recommendation Engine      │
           │                  │
           ▼                  │
 Prerequisite Learning Path   │
           │                  │
           ▼                  │
  Dashboard (Progress) ───────┘
           │
           ▼
  Adaptive Recalculation
           │
           ▼
 Next Best Action Engine
 ```

---

## 13. Final Architecture

```text
React Native App + Web App
           ↓
      Backend API
           ↓
 Document Processing (PDF extraction / OCR)
           ↓
   Learner & Target Profile
           ↓
     Skill Gap Engine
           ↓
  Skill / Prerequisite Graph
           ↓
 Semantic Resource Retrieval
           ↓
  Recommendation Scoring
           ↓
  Personalized Roadmap
           ↓
 Learning + Assessments + Behaviour
           ↓
 Learner State + Reward Update
           ↓
  Adaptive Recalculation
           ↓
 Next Best Action + AI Mentor
```

---

## 14. Final Product Positioning

PathFinder is an **adaptive AI learning companion** that understands where a learner is, determines where they need to go, creates a personalized learning path, and continuously learns from their performance and behaviour to change that path as they learn.

The new approach keeps the original project's strong personalization, explainability and adaptive roadmap ideas while making the intelligence more **algorithmic, measurable and continuously personalized**. The product is delivered through both web and mobile app experiences.
