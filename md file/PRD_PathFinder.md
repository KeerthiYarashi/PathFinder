# PathFinder — Hackathon Prototype PRD

---

## 1. Product Name

**PathFinder**

---

## 2. One-Line Value Proposition

PathFinder is an adaptive AI learning companion that builds a personalized, prerequisite-aware learning roadmap from your goals and skills, then continuously recalculates it based on your performance — like a GPS for learning.

---

## 3. Problem Statement

Millions of online courses exist, yet learners consistently fail to reach their goals — not because of a lack of content, but because of a lack of **intelligent sequencing**. Today's learners face three compounding problems:

1. **No personalized starting point.** Generic roadmaps assume everyone starts from zero, wasting time on material already known.
2. **No prerequisite awareness.** Learners jump into advanced courses without foundational skills, get stuck, and quit.
3. **No adaptation.** Even platforms that offer initial personalization generate a **static plan** that never evolves when the learner struggles, accelerates, or changes goals.

The result: learners waste hours on redundant content, hit invisible prerequisite walls, lose motivation, and abandon their goals.

**What is needed:** An AI system that understands where a learner is, determines where they need to go, generates a prerequisite-aware path, and **continuously recalculates** that path based on real performance and feedback.

---

## 4. Target Users / Personas

### Persona 1: The Beginner ("Priya")
- **Who:** 2nd-year college student, limited technical background
- **Goal:** "I want to learn Web Development from scratch"
- **Pain:** Overwhelmed by thousands of courses, doesn't know where to start or what order to follow
- **Needs:** A clear, step-by-step path starting from fundamentals, with encouragement and guidance

### Persona 2: The Skill Switcher ("Arjun")
- **Who:** 3rd-year engineering student, knows Python, some math
- **Goal:** "I know Python, I want to become an ML Engineer in 6 months"
- **Pain:** Generic roadmaps make him repeat basics he already knows; advanced courses assume knowledge he doesn't have (e.g., Statistics)
- **Needs:** A path that skips what he knows, fills exact gaps, and respects his 10-hour/week time budget

### Persona 3: The Job Targeter ("Sneha")
- **Who:** Final-year student preparing for placements
- **Goal:** "I want to qualify for this specific Data Analyst job posting"
- **Pain:** Doesn't know which of her existing skills match the JD and what gaps remain
- **Needs:** Resume-vs-JD gap analysis and a focused learning plan targeting missing skills

---

## 5. User Pain Points

| # | Pain Point | Impact |
|---|-----------|--------|
| 1 | **"I don't know where to start."** Generic roadmaps overwhelm beginners with too many options. | Paralysis, no action taken |
| 2 | **"I'm repeating things I already know."** Platforms don't account for existing skills. | Wasted time, frustration, dropout |
| 3 | **"I jumped into something too advanced."** No prerequisite enforcement. | Failure, loss of confidence |
| 4 | **"My plan never changes."** Static roadmaps don't adapt when the learner struggles or accelerates. | Mismatch grows over time |
| 5 | **"I don't understand why this was recommended."** Black-box recommendations erode trust. | Learner ignores recommendations |
| 6 | **"What should I do RIGHT NOW?"** Long roadmaps cause choice paralysis at each step. | Decision fatigue, procrastination |

---

## 6. Product Vision

PathFinder envisions a world where **every learner has a personal AI tutor** that not only tells them *what* to learn but *why*, *in what order*, and *what to do next* — adapting in real-time as they grow. Learning should feel like following a GPS: you set the destination, and the system handles the route, recalculating when you take a detour.

---

## 7. Product Goals

| # | Goal | Measurable By |
|---|------|---------------|
| 1 | Deliver a **personalized, prerequisite-aware** learning roadmap within 60 seconds of onboarding | Demo: path generated after onboarding |
| 2 | **Detect skill gaps** accurately by comparing current skills against goal requirements | Demo: radar chart showing gaps |
| 3 | **Explain every recommendation** with transparent, multi-factor reasoning | Demo: "Why this?" button on each course |
| 4 | **Adapt the path dynamically** when the learner struggles, skips, or accelerates | Demo: "Recalculating Route..." moment |
| 5 | Provide a **single Next Best Action** to eliminate choice paralysis | Demo: dashboard hero card |
| 6 | Offer a **contextual AI Mentor** that understands the learner's full state | Demo: mentor references specific progress |

---

## 8. Non-Goals (Scope Boundaries)

| # | Non-Goal | Why |
|---|----------|-----|
| 1 | **Building a course content platform.** We don't host courses; we recommend and sequence external resources. | Out of scope for a hackathon |
| 2 | **User authentication / multi-user accounts.** Single demo user is sufficient. | Not a differentiator for judges |
| 3 | **Mobile native app.** Web-only for the prototype. | Time constraint |
| 4 | **Real payment or enrollment integration.** We link to resources, not process transactions. | Enterprise feature |
| 5 | **Production-grade scalability.** Prototype handles 1 user demonstrating the flow. | Hackathon scope |
| 6 | **Deep RL / complex ML model training.** We use rule-based adaptation and reward signals, not trained neural policies. | Honest scope management |

---

## 9. Core Features

| ID | Feature | Priority | Category |
|----|---------|----------|----------|
| F1 | Conversational and Multimodal Onboarding | MVP | Core |
| F2 | Learner Profile and Continuous Learner State | MVP | Core |
| F3 | Skill-Gap Analysis and Radar Chart | MVP | Core |
| F4 | Recommendation Engine with Multi-Factor Scoring | MVP | Core |
| F5 | Explainable AI (XAI) — "Why This?" | MVP | AI Differentiation |
| F6 | Prerequisite-Aware Learning Path Generation | MVP | Core |
| F7 | Next Best Action (NBA) Engine | MVP | Core |
| F8 | Progress Tracking and Manual Feedback | MVP | Core |
| F9 | Adaptive Path Recalculation | MVP | Core |
| F10 | AI Mentor (LangGraph Tool-Using Chatbot) | MVP | AI Differentiation |
| F11 | Dashboard with Progress and Skill Visualization | MVP | UI/UX |
| F12 | RAG-Based Mini Assessments | Stretch | Innovation |
| F13 | What-If Time Machine | Stretch | Innovation |
| F14 | RPG Skill Tree Visualization | Stretch | Innovation |

---

## 10. Detailed Feature Requirements

### F1 — Conversational and Multimodal Onboarding

**Purpose:** Replace boring forms with an intelligent conversation that extracts a structured learner profile.

**Chat-Based Onboarding (MVP):**
- A conversational AI interface where the learner describes their goal in natural language (e.g., "I know Python, I want to become an ML Engineer in 6 months with 10 hrs/week")
- Powered by LangChain `with_structured_output`, the LLM extracts structured data directly into a Pydantic `LearnerProfile` model: `{ goal, current_skills[], target_role, time_budget_hours, deadline_months, experience_level }`
- This ensures reliable profile extraction instead of manually parsing LLM text.
- If answers are incomplete, the AI asks targeted follow-up questions (max 3 follow-ups)
- At the end, the extracted profile is shown to the user for confirmation before proceeding

**Resume + JD Upload (Should Have):**
- Drag-and-drop zone for Resume (PDF) and Job Description (paste or PDF)
- Digital PDF: direct text extraction (PyPDF2/pdfplumber)
- Scanned/image PDF: OCR fallback (Tesseract)
- LLM extracts current skills from resume and target skills from JD
- Chat used only for follow-up clarifications

**Output:** A structured JSON learner profile saved to the backend.

---

### F2 — Learner Profile and Continuous Learner State

**Purpose:** Remember the user and continuously adapt to their evolving behaviour.

**Initial Profile Fields:**
- Goal / target role
- Current skills with self-assessed proficiency (Beginner / Intermediate / Advanced)
- Time budget (hours/week)
- Target deadline
- Experience level
- Preferred learning format (video / article / project / mixed)

**Continuously Updated Learner State:**

| Signal | Source | Update Trigger |
|--------|--------|----------------|
| Skill mastery levels | Assessments | After each assessment |
| Assessment scores | Quiz results | After each quiz |
| Completion behaviour | Module actions | On complete/skip/struggle |
| Resource preference | Interaction patterns | Tracked over time |
| Difficulty tolerance | Performance patterns | After assessments |
| Struggle/skip history | Module actions | On struggle/skip |

**Storage:** JSON file or SQLite for the prototype. No complex DB needed.

---

### F3 — Skill-Gap Analysis and Radar Chart

**Purpose:** Show the learner exactly what they know vs. what they need.

**Logic:**
1. Look up the target role in the skill taxonomy to get required skills with expected proficiency levels
2. Compare against the learner's current skills
3. Gap = Required minus Current (per skill)
4. Prioritize gaps by topological importance (prerequisite skills first)

**UI Output:**
- A **Radar Chart** (spider chart) showing current proficiency vs. required proficiency per skill
- A **Gap Table** listing each skill, current level, required level, and gap severity (High / Medium / Low)

---

### F4 — Recommendation Engine with Multi-Factor Scoring

**Purpose:** Match skill gaps to actual learning resources using algorithmic intelligence, not just LLM prompts.

**Two-Stage Pipeline:**

**Stage 1 — Retrieval:**
- Semantic similarity search (embeddings + vector DB like ChromaDB) finds candidate resources matching the skill gap
- Metadata filters narrow by difficulty, duration, and resource type

**Stage 2 — Ranking (Multi-Factor Scoring):**

| Factor | Weight | Description |
|--------|--------|-------------|
| Skill-gap relevance | 30% | How directly it addresses the learner's gaps |
| Prerequisite readiness | 20% | Does the learner have the prereqs for this resource? |
| Difficulty fit | 15% | Match between resource difficulty and learner level + tolerance |
| Time fit | 15% | Does it fit within the weekly time budget? |
| Learning preference | 10% | Video vs. article vs. project alignment |
| Historical reward | 10% | Reinforcement signal from past interactions |

**Output:** A ranked list of resources per skill gap, with the top pick selected for the roadmap.

**Key Design Decision:** The LLM explains recommendations; the scoring algorithm decides them.

---

### F5 — Explainable AI (XAI) — "Why This?"

**Purpose:** Build trust and score high on AI implementation criteria by exposing the reasoning.

**Implementation:**
- Every recommended resource has a **"Why was this chosen?"** button
- The scoring engine already calculates relevance factors (skill-gap match, difficulty fit, time budget, etc.). Do not ask the LLM to invent the explanation.
- Instead, feed the deterministic scoring reasons to the LLM and let it turn them into natural language.
- Example: *"You have identified Python as a strength, but Statistics is currently missing from your profile. Machine Learning in your target path requires statistical foundations, so PathFinder placed this before ML. Furthermore, it fits your 2-hour/week budget."*

**Template Structure:**
```
"You need [TARGET_SKILL] at [REQUIRED_LEVEL], but you're at [CURRENT_LEVEL].
This [RESOURCE_TYPE] was chosen because:
- It covers [SKILL] (relevance score: X%)
- Difficulty [LEVEL] matches your current ability
- Duration [X hrs] fits your [Y hrs/week] budget
- It requires [PREREQS], which you've already completed."
```

---

### F6 — Prerequisite-Aware Learning Path Generation

**Purpose:** Prevent learners from taking advanced topics before fundamentals.

**Logic:**
1. From the skill gaps, build a Directed Acyclic Graph (DAG) using the prerequisite map
2. Topological sort determines the correct ordering
3. Already-known skills are skipped (pruned from the graph)
4. Each node is assigned a recommended resource from the Recommendation Engine
5. Milestones are inserted after key module clusters

**MVP Simplification:** For MVP, support 3-4 hardcoded prerequisite sequences (ML Engineer, Web Dev, Data Analyst). Expand to full topological sort if time permits.

**Output:** An ordered timeline of modules with milestones, estimated durations, and dependency arrows.

---

### F7 — Next Best Action (NBA) Engine

**Purpose:** Eliminate choice paralysis by answering "What should I do RIGHT NOW?"

**Logic:**

| Learner State | NBA Output |
|--------------|------------|
| On schedule, next module available | "Continue: [Next Module Name]" |
| Failed last assessment | "Review: [Weak Prerequisite Topic]" |
| Behind schedule | "Priority: [Shortest Critical Path Module]" |
| Completed a milestone | "Celebrate! Next milestone: [Name]" |
| Struggling on current module | "Help Available: [Refresher Resource]" |

**UI:** A hero card at the top of the dashboard — large, prominent, unmissable.

---

### F8 — Progress Tracking and Manual Feedback

**Purpose:** Motivate the learner and trigger adaptations.

**Learner Actions per Module:**
- **Start** — module status = In Progress
- **Complete** — module status = Done, triggers state update
- **Skip (too easy)** — module removed, skill mastery bumped up
- **Struggling (too hard)** — triggers adaptive recalculation

**UI Elements:**
- Overall progress bar (% complete)
- Per-module status indicators (Not Started / In Progress / Done / Skipped / Struggling)
- Completion timestamps

---

### F9 — Assessment-Driven Adaptive Recalculation

**Purpose:** Make the roadmap a living document that evolves with the learner.

**Adaptation Rules:**

| Trigger | System Response |
|---------|----------------|
| High score + fast completion | Increase difficulty, compress roadmap, skip/fast-track redundant content |
| Low score | Identify weak prerequisite, insert refresher module before current topic |
| Repeated failure on same area | Move further backward in prerequisite graph to find foundational gap |
| Repeated success | Accelerate timeline, suggest stretch content |
| "Too difficult" button | Insert easier prerequisite module, recalculate path |
| "Too easy" / Skip | Remove module, bump mastery, compress timeline |
| Goal change | Recalculate entire roadmap preserving completed skills |

**Reinforcement-Based Reward Layer:**
- Feedback loop: Recommendation then learner action then assessment/behaviour then reward signal then learner-state update then re-ranking then next recommendation
- Positive rewards: Successful completion, score improvement, preference alignment
- Negative rewards: Abandonment, repeated failure, excessive time spent
- Effect: Reward history influences future recommendation scoring per learner

**The "Wow" Moment:** When adaptation triggers, the UI shows a "Recalculating Route..." animation (like a GPS), and the timeline visibly shifts.

---

### F10 — AI Mentor (LangGraph Tool-Using Chatbot)

**Purpose:** Provide contextual help by reasoning over learner data using tool-calling.

**What the Mentor knows (Context):**
- Learner's goal, current skills, skill gaps
- Current progress and active module
- Full learner state (mastery, scores, behaviour)
- The entire learning path and milestones

**Tool Functions (LangChain/LangGraph Agent):**

| Tool | Action | Example Use Case |
|------|--------|------------------|
| `get_my_progress()` | Retrieve current progress | "How much is left?" |
| `get_skill_gap()` | Retrieve skill-gap analysis | "Why do I need to learn this?" |
| `get_current_path()` | Get the full ordered path | "What's coming next?" |
| `get_next_action()` | Retrieve the Next Best Action | "What should I do now?" |
| `search_resources()` | Look for alternative courses | "This course is too hard." |

**Implementation Focus:**
- By connecting the AI Mentor with the recommendation engine, learner profile, and DAG (via tools), the mentor can explain its reasoning naturally: "Statistics is recommended because... Machine Learning requires it."
- This is significantly stronger than a normal text-generation chatbot.

---

### F11 — Dashboard

**Purpose:** Single-screen overview of the learner's entire journey.

**Components:**

| # | Component | Description |
|---|-----------|-------------|
| 1 | Next Best Action Card | Hero card — the single most important thing to do now |
| 2 | Progress Bar | Overall completion percentage |
| 3 | Learning Path Timeline | Interactive visual timeline showing past, present, future modules |
| 4 | Skill Radar Chart | Spider chart showing skill growth over time |
| 5 | Milestones | Key achievements with status (locked/unlocked/completed) |
| 6 | AI Mentor Chat | Floating chat widget, always accessible |
| 7 | Recent Activity | Last 3-5 actions taken |

---

### F12 — Resume-to-JD Pipeline (Should Have)

**Purpose:** Connect learning directly to employability.

**Flow:**
1. User uploads Resume (PDF) + pastes/uploads Job Description
2. System extracts current skills from resume (text extraction + LLM parsing)
3. System extracts required skills from JD (LLM interpretation)
4. Automatic skill-gap analysis: Resume Skills vs. JD Requirements
5. Learning path targets the exact gap between "where you are" and "what this job needs"

---

### F13 — What-If Time Machine (Stretch)

**Purpose:** Let users see how changing study hours affects their timeline.

**UI:** A slider that adjusts weekly hours. As the user slides, the roadmap end-date dynamically recalculates. Example: "At 5 hrs/week: 9 months. At 15 hrs/week: 4 months."

---

### F14 — RPG Skill Tree Visualization (Stretch)

**Purpose:** Gamify the roadmap as a branching visual skill tree (like in video games). Nodes glow and unlock as modules are completed.

---

## 11. User Journeys

### Journey 1: The Beginner (Priya)
```
Opens PathFinder
  -> Types "I want to learn Web Development from scratch"
  -> AI asks: "What's your experience level?" -> "Complete beginner"
  -> AI asks: "How many hours per week?" -> "8 hours"
  -> AI asks: "Any deadline?" -> "6 months"
  -> Profile confirmed
  -> Skill gaps shown (HTML, CSS, JS, React — all gaps)
  -> Full roadmap: HTML -> CSS -> JS Basics -> JS DOM -> React -> Capstone
  -> Dashboard shows NBA: "Start: HTML Fundamentals"
  -> Priya starts learning
```

### Journey 2: The Skill Switcher (Arjun)
```
Opens PathFinder
  -> Types "I know Python, want to become ML Engineer in 6 months, 10 hrs/week"
  -> AI extracts profile, confirms
  -> Radar chart shows: Python OK, Statistics GAP, ML GAP, Pandas GAP
  -> Roadmap: Statistics -> Pandas/NumPy -> Scikit-learn -> ML Projects -> Capstone
  -> Python is SKIPPED (already known)
  -> Arjun starts Statistics -> Clicks "Struggling"
  -> "Recalculating Route..." -> Probability Refresher inserted before Statistics
  -> NBA updates: "Action Required: Complete Probability Refresher"
  -> AI Mentor: "I noticed Statistics was tough! I've added a quick refresher."
```

### Journey 3: The Job Targeter (Sneha)
```
Opens PathFinder
  -> Uploads Resume + pastes Google Data Analyst JD
  -> System extracts: Resume skills (Python, Excel, basic SQL) vs. JD needs (Advanced SQL, Tableau, Statistics, A/B Testing)
  -> Gap: Advanced SQL, Tableau, Statistics, A/B Testing
  -> Focused 3-month plan generated targeting only the gaps
  -> Sneha completes SQL module, scores 90% -> "Accelerating timeline..."
  -> Sneha reaches goal -> "Ready! Upload another JD or set a new goal"
```

---

## 12. Main User Flows

### Flow 1: Onboarding to Path Generation
```
[User opens app]
    |
[Chat interface appears]
    |
[User describes goal in natural language]
    |
[LLM extracts structured profile (JSON)]
    |
[If incomplete -> follow-up questions (max 3)]
    |
[Profile shown for confirmation]
    |
[Skill-Gap Analysis runs]
    |
[Radar Chart + Gap Table displayed]
    |
[Recommendation Engine scores resources]
    |
[Prerequisite graph orders them]
    |
[Personalized roadmap rendered on dashboard]
```

### Flow 2: Learning to Adaptation
```
[User clicks "Start Module"]
    |
[User studies (external link)]
    |
[User marks: Complete | Skip | Struggling]
    |
[Assessment quiz (if available)]
    |
[Learner state updated]
    |
[Adaptation engine checks triggers]
    |
[If trigger met -> "Recalculating Route..." animation]
    |
[Path updated: modules inserted/removed/reordered]
    |
[NBA card updated]
    |
[AI Mentor explains the change]
```

### Flow 3: AI Mentor Interaction
```
[User opens chat]
    |
[User asks: "Why is Statistics before ML?"]
    |
[Mentor calls get_skill_gap() + gets prereq graph]
    |
[Mentor explains prerequisite dependency]
    |
[User asks: "Skip the probability module"]
    |
[Mentor calls skip_module() with confirmation prompt]
    |
[User confirms -> Path recalculated]
```

---

## 13. Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FR-01 | System shall accept natural-language goal descriptions and extract structured profiles | MVP |
| FR-02 | System shall store learner profile with skills, goals, time budget, and preferences | MVP |
| FR-03 | System shall compare learner skills against target role requirements to produce a gap report | MVP |
| FR-04 | System shall generate a prerequisite-ordered learning path from skill gaps | MVP |
| FR-05 | System shall score and rank learning resources using a multi-factor algorithm | MVP |
| FR-06 | System shall provide natural-language explanations for each recommendation | MVP |
| FR-07 | System shall allow learners to mark modules as Complete, Skip, or Struggling | MVP |
| FR-08 | System shall adapt the learning path when learner performance triggers recalculation rules | MVP |
| FR-09 | System shall display a Next Best Action based on current learner state | MVP |
| FR-10 | System shall render a dashboard with progress bar, timeline, radar chart, and NBA card | MVP |
| FR-11 | System shall provide an AI Mentor chatbot with access to learner context | Should Have |
| FR-12 | AI Mentor shall use tool-calling for read and state-changing actions (with confirmation) | Should Have |
| FR-13 | System shall accept Resume PDF upload and extract skills via text extraction + LLM | Should Have |
| FR-14 | System shall accept Job Description input and extract target skills via LLM | Should Have |
| FR-15 | System shall maintain a continuously updated learner state across sessions | MVP |

---

## 14. Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| NFR-01 | Path generation completes within 30 seconds of profile confirmation | Performance |
| NFR-02 | AI Mentor responds within 10 seconds | Performance |
| NFR-03 | UI is responsive across desktop and tablet screen sizes | Usability |
| NFR-04 | Application runs on a single machine for demo purposes | Deployment |
| NFR-05 | Code is modular: onboarding, engine, dashboard, mentor are separable components | Maintainability |
| NFR-06 | API keys and secrets are stored in environment variables, not hardcoded | Security |
| NFR-07 | System gracefully handles LLM API failures with fallback responses | Reliability |
| NFR-08 | All AI decisions are traceable — scoring factors are logged | Auditability |

---

## 15. AI-Specific Requirements

| ID | Requirement | Implementation |
|----|------------|----------------|
| AI-01 | **LLM for NLU**: Parse natural-language goals into structured JSON profiles | OpenAI / Gemini API with structured output (function calling or JSON mode) |
| AI-02 | **LLM for Explanation**: Generate human-readable recommendation explanations from scoring data | Prompt template grounded in actual scoring factors |
| AI-03 | **Embeddings for Retrieval**: Semantic search over learning resources | Sentence-transformers or OpenAI embeddings + ChromaDB |
| AI-04 | **Agentic AI for Mentor**: ReAct-style tool-calling agent with scoped functions | LangChain / LangGraph with defined tool set |
| AI-05 | **LLM for Resume/JD Parsing**: Extract skills from unstructured text | LLM with structured output + skill taxonomy matching |
| AI-06 | **No hallucinated sequencing**: Prerequisite ordering must use graph algorithms, not LLM generation | Topological sort on curated prerequisite DAG |
| AI-07 | **No hallucinated resources**: Resources come from a curated database, not LLM invention | Vector retrieval from seeded resource DB |

### What Uses AI vs. What Uses App Logic

| Component | Intelligence Source | Why |
|-----------|-------------------|-----|
| Onboarding and Profile Extraction | AI (LLM structured output) | Natural language understanding requires LLM |
| Resume and JD Processing | Hybrid (text extraction + LLM) | Structured parsing + LLM for ambiguous skills |
| Skill-Gap Detection | App Logic (array comparison) | Deterministic, no hallucination risk |
| Prerequisite Ordering | App Logic (topological sort) | Must be correct, never hallucinated |
| Resource Retrieval | AI (RAG / vector embeddings) | Semantic matching even with keyword mismatch |
| Recommendation Scoring | App Logic (weighted formula) | Transparent, explainable, reproducible |
| Recommendation Explanation | AI (LLM) | Natural language generation from scoring data |
| Adaptive Recalculation | App Logic (rule engine) | Deterministic trigger-response rules |
| AI Mentor | Agentic AI (LangChain ReAct) | Tool-calling with learner context |
| Learner State Updates | App Logic | Continuous state machine updates |

---

## 16. Personalization Strategy

PathFinder personalizes across **five dimensions**, each with a specific data source and mechanism:

| Dimension | Data Source | Mechanism | Example |
|-----------|-----------|-----------|---------|
| **Starting Point** | Self-assessed skills from onboarding | Skip known skills in the path | Python already known — skip Python module |
| **Sequencing** | Prerequisite graph + skill gaps | Topological sort from personal gap set | Statistics scheduled before ML because learner lacks it |
| **Difficulty** | Assessment scores + difficulty tolerance | Score-based difficulty adjustment | Low quiz score triggers easier prerequisite insertion |
| **Pacing** | Time budget + completion speed | Timeline compression/expansion | Fast completions compress the roadmap |
| **Format** | Stated preference + observed behaviour | Resource type weighting in scoring | Learner prefers videos — video resources scored higher |

**Key Principle:** Two learners with the same goal receive different paths because they have different starting skills, learning speeds, and struggle patterns. The system continuously diverges their paths based on individual signals.

---

## 17. Skill-Gap Detection Strategy

**Step 1 — Define the Target Skill Set:**
- Look up the target role (e.g., "ML Engineer") in the skill taxonomy
- Retrieve all required skills with expected proficiency levels (Beginner / Intermediate / Advanced)

**Step 2 — Map Current Skills:**
- From onboarding: self-assessed skills and proficiency
- From resume (if uploaded): extracted skills mapped to taxonomy
- Proficiency encoding: None=0, Beginner=1, Intermediate=2, Advanced=3

**Step 3 — Compute Gaps:**
```
For each required_skill in target_role:
    gap = required_proficiency - current_proficiency
    if gap > 0: add to gap_list with priority
```

**Step 4 — Prioritize Gaps:**
- Gaps in **prerequisite skills** are prioritized higher (they block downstream skills)
- Gaps with **higher severity** (gap=3 vs gap=1) are prioritized higher
- Priority = topological_depth_weight * 0.6 + gap_severity * 0.4

**Step 5 — Continuous Update:**
- After each assessment or module completion, re-run gap detection
- Mastery levels update based on performance, not just completion

---

## 18. Learning-Path Generation Strategy

**Input:** Prioritized skill gaps + prerequisite graph + recommended resources + time budget.

**Algorithm:**

```
1. Build a subgraph of the prerequisite DAG containing only the learner's gap skills
2. Prune skills the learner already knows (proficiency >= required)
3. Topological sort the subgraph to get a valid ordering
4. For each skill node in sorted order:
   a. Query the Recommendation Engine for the best resource
   b. Assign estimated duration from resource metadata
5. Accumulate durations against the weekly time budget to generate a week-by-week timeline
6. Insert milestones after key skill clusters (e.g., "Data Fundamentals Complete")
7. Calculate estimated completion date
8. If completion date > deadline: warn user, suggest increased hours
```

**MVP Simplification:** For 3-4 common roles, use hardcoded prerequisite sequences. The topological sort algorithm is built but the prerequisite data is manually curated.

**Recalculation Triggers:** Any trigger from the Adaptive Recalculation engine (Section 10, F9) causes Steps 1-7 to re-run with the updated learner state.

---

## 19. Recommendation Explanation Strategy

**Philosophy:** Every recommendation must be explainable. No black boxes.

**Three Levels of Explanation:**

### Level 1 — Inline Summary (Always Visible)
A one-line reason shown beneath each recommended resource:
> "Bridges your Statistics gap — matches your intermediate level"

### Level 2 — Detailed Breakdown (On Click: "Why This?")
A structured explanation showing the scoring factors:
> **Why this was chosen for you:**
> - Skill relevance: Covers Statistics (your #1 gap) — 92%
> - Difficulty: Intermediate level matches your current ability — 88%
> - Time: 4 hours fits your 10 hrs/week budget — 95%
> - Format: Video course matches your preference — 80%
> - Prerequisites: Requires Basic Math, which you have — 100%
> - Overall score: 91/100

### Level 3 — Contextual Mentor Explanation (On Ask)
When the user asks the AI Mentor "Why this course?", the mentor generates a conversational explanation:
> "I recommended this Statistics course because your goal of becoming an ML Engineer requires strong statistical foundations. Based on your onboarding, you rated yourself as a beginner in Statistics, but you need at least intermediate level. This particular course scored highest because it matches your difficulty level, fits your weekly time budget, and is a video format which you tend to prefer."

**Implementation:** Levels 1-2 are template-based (filled from scoring data). Level 3 uses the LLM with scoring data as context.

---

## 20. Progress Adaptation Strategy

**The Feedback Loop:**
```
Learner Action -> Signal Captured -> Learner State Updated -> Adaptation Rule Checked -> Path Modified -> NBA Updated -> Mentor Notified
```

**Adaptation Rules Engine:**

| Signal | Detection | Response | NBA Update |
|--------|-----------|----------|------------|
| Module completed with high score (>80%) | Assessment result | Bump skill mastery, check if next modules can be compressed | "Great work! Continue to: [Next]" |
| Module completed with low score (<50%) | Assessment result | Identify weak prerequisite, insert refresher | "Review recommended: [Refresher Topic]" |
| Module marked "Struggling" | Manual button | Insert prerequisite refresher, notify mentor | "Help: Complete [Easier Module] first" |
| Module marked "Skip (too easy)" | Manual button | Remove module, bump mastery, compress timeline | "Skipped! Continue: [Next Module]" |
| 3+ consecutive high scores | Pattern detection | Accelerate timeline, suggest harder content | "You're ahead of schedule! Try: [Advanced Topic]" |
| 2+ failures on same skill area | Pattern detection | Move backward in prerequisite graph | "Let's strengthen your foundation: [Fundamental Topic]" |
| No activity for 7+ days | Inactivity timer | Mentor sends gentle nudge, NBA shows easy re-entry point | "Welcome back! Pick up where you left off" |

**Reward Signal Update:**
After each adaptation, the reward score for the resource type, difficulty level, and format is updated in the learner state. This influences future Recommendation Engine scoring for this specific learner.

---

## 21. Dashboard Requirements

### Layout (Single Page)

```
+--------------------------------------------------+
|  HEADER: PathFinder Logo | Goal: "ML Engineer"   |
+--------------------------------------------------+
|                                                    |
|  [ NEXT BEST ACTION CARD ]        [ SKILL RADAR ] |
|  "Complete: Probability            (Spider Chart)  |
|   Refresher before Statistics"                     |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  LEARNING PATH TIMELINE                            |
|  [Done] -> [Done] -> [Active] -> [Locked] -> ...  |
|  Python    NumPy     Statistics   ML Basics         |
|  (skipped)                                         |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  PROGRESS         |  MILESTONES                    |
|  [========60%===] |  [x] Data Fundamentals         |
|  7/12 modules     |  [ ] ML Foundations             |
|                   |  [ ] Capstone                   |
|                                                    |
+--------------------------------------------------+
|  RECENT ACTIVITY                                   |
|  - Completed NumPy Basics (Score: 85%)             |
|  - Skipped Python Intro (already known)            |
+--------------------------------------------------+
|                              [AI Mentor Chat FAB]  |
+--------------------------------------------------+
```

### Component Specifications

| Component | Data Source | Interaction |
|-----------|-----------|-------------|
| NBA Card | NBA Engine output | Click to navigate to the recommended module |
| Skill Radar Chart | Learner state mastery levels | Hover for exact proficiency values |
| Learning Path Timeline | Path generation output | Click any module for details and "Why This?" |
| Progress Bar | Completion count / total modules | Passive display |
| Milestones | Path generation milestones | Visual unlock animation on completion |
| Recent Activity | Learner action log | Scrollable list |
| AI Mentor FAB | Opens mentor chat | Floating action button, always visible |

---

## 22. AI Mentor / Chatbot Requirements

### What Makes It Contextual (Not Generic)

The AI Mentor is **not** a general-purpose chatbot. It is a **contextual learning assistant** that:

1. **Knows the learner's full state** — goal, skills, gaps, progress, scores, struggle history
2. **Has tool access** — can query and modify the learner's path via defined functions
3. **References specifics** — says "Your Statistics score was 45%" not "You might want to review"
4. **Explains system decisions** — "I inserted a Probability refresher because your Statistics quiz revealed a gap in conditional probability"

### Persona
- Name: "PathFinder Mentor" (or a friendly alias chosen during onboarding)
- Tone: Encouraging, specific, actionable. Like a supportive senior student, not a corporate FAQ bot.
- Never vague: Always references specific modules, scores, and next steps.

### System Prompt Structure
```
You are the PathFinder AI Mentor. You help learners navigate their personalized learning path.

LEARNER CONTEXT:
- Goal: {goal}
- Current Skills: {skills_with_proficiency}
- Active Module: {current_module}
- Progress: {completed}/{total} modules ({percentage}%)
- Recent Scores: {last_3_scores}
- Skill Gaps Remaining: {gaps}
- NBA: {next_best_action}

AVAILABLE TOOLS:
- get_progress() — read-only
- get_skill_gap() — read-only
- get_recommendations() — read-only
- mark_module_complete() — requires user confirmation
- skip_module() — requires user confirmation
- trigger_recalculation() — requires user confirmation

RULES:
- Always reference the learner's specific data, never give generic advice
- Before any state-changing action, ask the learner to confirm
- If you don't know something, say so — don't hallucinate
```

### Example Interactions

**Contextual Help:**
> User: "Why is Statistics before ML?"
> Mentor: "Great question! ML algorithms like linear regression and gradient descent rely heavily on statistical concepts like probability distributions, hypothesis testing, and variance. Your current Statistics proficiency is Beginner, but ML requires at least Intermediate. That's why I've placed Statistics first in your path."

**Progress Query:**
> User: "How am I doing?"
> Mentor: "You've completed 5 out of 12 modules (42%). Your recent scores have been strong — 85% on NumPy and 78% on Data Cleaning. You're currently 1 week ahead of schedule! Your next milestone is 'Data Fundamentals Complete', which requires finishing the Pandas module."

**Action Request:**
> User: "Skip the SQL module"
> Mentor: "The SQL module covers database querying which is required for the Data Pipeline module later in your path. Are you sure you want to skip it? If you do, I'll adjust your path — but note that you may struggle with Data Pipeline without SQL foundations. Confirm skip? [Yes / No]"

---

## 23. MVP Features (What to Actually Build)

These are the features that **must** be demonstrable in the hackathon demo:

| # | Feature | Why It's MVP |
|---|---------|-------------|
| 1 | **Chat-based onboarding** that extracts a structured learner profile | Core entry point, required by problem statement |
| 2 | **Skill-gap analysis with radar chart** | Visual proof of intelligence, high demo impact |
| 3 | **Prerequisite-aware learning path** (hardcoded sequences for 3-4 roles) | Core differentiator, required by problem statement |
| 4 | **Multi-factor recommendation scoring** | Proves algorithmic AI, not just LLM prompts |
| 5 | **Explainable AI — "Why This?"** for every recommendation | Trust builder, high marks on AI implementation |
| 6 | **Adaptive recalculation** when learner clicks "Struggling" or "Skip" | The "wow" moment in the demo |
| 7 | **Next Best Action card** on dashboard | Eliminates choice paralysis, unique feature |
| 8 | **Dashboard** with progress bar, timeline, radar chart, NBA card | Required by problem statement |
| 9 | **Feedback-based learner state updates** | Proves the system learns and adapts |

### MVP Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) or Next.js |
| Backend | Python (FastAPI) |
| LLM | OpenAI GPT-4o-mini or Google Gemini API |
| Embeddings | sentence-transformers or OpenAI embeddings |
| Vector DB | ChromaDB (local, no infra needed) |
| Data Storage | JSON files or SQLite |
| Charts | Chart.js or Recharts (for radar chart) |
| Deployment | Local demo (localhost) |

---

## 24. Stretch Features (Build If Time Permits)

| Priority | Feature | Demo Impact | Effort |
|----------|---------|-------------|--------|
| S1 | **Resume + JD upload pipeline** | Very High — "Wow" onboarding | Medium |
| S2 | **AI Mentor with tool-calling** (LangChain ReAct agent) | Very High — proves agentic AI | Medium-High |
| S3 | **Full topological sort** (general prerequisite graph, not hardcoded) | Medium — proves algorithmic depth | Medium |
| S4 | **What-If Time Machine** (slider to adjust hours and see timeline shift) | Very High — visually stunning | Low-Medium |
| S5 | **RPG Skill Tree visualization** | High — gamification wow factor | Medium |
| S6 | **AI Skill Verification Interview** (quiz generated by AI to verify claimed skills) | Medium — proves depth | Medium |

**Recommendation:** After MVP, prioritize S1 (Resume/JD) and S4 (Time Machine) for maximum demo impact with manageable effort.

---

## 25. Innovation / Differentiation Ideas

| # | Innovation | Why It's Different | Judging Impact |
|---|-----------|-------------------|----------------|
| 1 | **"GPS for Learning" metaphor** — "Recalculating Route..." animation when path adapts | No other learning platform uses this mental model. Makes adaptation feel intuitive. | Innovation + UX |
| 2 | **Hybrid AI architecture** — LLM for understanding, algorithms for decisions | Avoids the "just a ChatGPT wrapper" problem. Shows genuine engineering. | AI Implementation |
| 3 | **Multi-factor explainable scoring** — every recommendation shows its math | Transparent AI, not a black box. Rare in learning platforms. | AI Implementation + Innovation |
| 4 | **Continuous learner state** — not just a profile, but an evolving behavioral model | Goes beyond "fill a form, get a list". The system actually learns about YOU. | Innovation + Feature Completeness |
| 5 | **Resume-to-JD pipeline** — learning path targeted at a specific job posting | Connects learning to employability, which is the #1 motivation for learners. | Problem Understanding + Innovation |
| 6 | **Next Best Action engine** — always one clear answer to "What do I do now?" | Solves choice paralysis, a real unsolved UX problem in learning. | Innovation + UX |
| 7 | **Agentic AI Mentor** — not just a chatbot, but a tool-calling agent with learner context | Proves understanding of modern AI agent patterns (ReAct, tool-calling). | AI Implementation + Innovation |
| 8 | **What-If Time Machine** — slide to see how commitment changes outcomes | Highly visual, emotionally engaging, never seen in learning tools. | Innovation + UX |

---

## 26. Success Metrics

### Demo Success (Hackathon Context)

| Metric | Target | How to Demonstrate |
|--------|--------|-------------------|
| Onboarding to roadmap in under 60 seconds | < 60s | Time the demo live |
| Skill gaps correctly identified and visualized | 100% of known gaps shown | Radar chart matches expected output |
| Path respects prerequisite ordering | 0 ordering violations | Walk through the timeline, verify no advanced topic before its prerequisite |
| Adaptation triggers correctly on "Struggling" | Path visibly changes | Click "Struggling" during demo, show recalculation |
| "Why This?" explanation is specific and accurate | References actual scoring factors | Click the button, show it's not generic text |
| NBA updates after each action | NBA changes after every interaction | Demonstrate 3 consecutive NBA changes |
| AI Mentor references specific learner data | 0 generic responses | Ask mentor a question, show it references actual scores/progress |

### Theoretical Production Metrics (For PRD Completeness)

| Metric | Target |
|--------|--------|
| Learner retention after 1 week | > 60% |
| Goal completion rate | > 40% |
| Adaptation trigger rate per learner per month | > 3 |
| Recommendation click-through rate | > 50% |

---

## 27. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **LLM API rate limits or downtime during demo** | Medium | Critical | Cache responses for demo scenarios; have a fallback with pre-computed results |
| 2 | **Onboarding extraction produces wrong profile** | Medium | High | Always show extracted profile for user confirmation; allow manual edits |
| 3 | **Prerequisite graph has missing edges** | Low | Medium | Curate 3-4 complete role paths thoroughly; flag missing prerequisites gracefully |
| 4 | **Adaptation feels gimmicky, not intelligent** | Medium | High | Ground adaptation in real scoring data; show the "why" alongside the "what" |
| 5 | **Scope creep — team tries to build everything** | High | Critical | Strictly follow MVP list; only move to stretch after MVP is demo-ready |
| 6 | **AI Mentor hallucinates or gives wrong advice** | Medium | High | Scope mentor to tool-calling only; never let it freestyle about courses not in the DB |
| 7 | **Demo takes too long, loses judges' attention** | Medium | High | Script a 3-5 minute demo journey; rehearse timing |
| 8 | **Resource database too small, recommendations feel thin** | Low | Medium | Seed 50+ resources across 3-4 roles; quality over quantity |
| 9 | **Chart rendering issues during live demo** | Low | Medium | Test on the demo machine; have screenshots as backup |
| 10 | **Team paralysis on tech decisions** | Medium | High | Lock tech stack early (React + FastAPI + OpenAI); no debating during build time |

---

## 28. Hackathon Judging Criteria Mapping

### Problem Understanding and Solution Design — 20%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| Clear problem articulation | PRD Section 3: Three specific compounding problems identified |
| Understanding of user needs | Three distinct personas with specific pain points |
| Thoughtful solution design | Hybrid AI architecture: LLM for understanding, algorithms for decisions |
| Scope awareness | Clear MVP vs. Stretch separation; non-goals explicitly stated |

**Demo Talking Points:** "We identified that the core problem isn't a lack of courses — it's a lack of intelligent sequencing. Learners don't need more options; they need the RIGHT next step. That's why PathFinder acts like a GPS: it recalculates your route as you learn."

---

### Functionality and Feature Completeness — 25%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| All problem statement requirements met | Checklist below |
| Features actually work end-to-end | Scripted demo journey covers full flow |
| Depth of implementation | Multi-factor scoring, not just "call an API" |

**Problem Statement Requirement Checklist:**

| Requirement | PathFinder Feature | Status |
|------------|-------------------|--------|
| Conversational interface for natural language goals | F1: Chat-based onboarding | MVP |
| Capture learner profile, interests, experience, objectives | F2: Learner Profile | MVP |
| Recommend relevant courses, projects, resources | F4: Multi-factor Recommendation Engine | MVP |
| Generate personalized learning paths with prerequisites and milestones | F6: Prerequisite-Aware Path + Milestones | MVP |
| Explain why recommendations were made | F5: XAI "Why This?" | MVP |
| Answer learner queries through AI assistant | F10: AI Mentor with tool-calling | Should Have |
| Adapt suggestions based on feedback and progress | F9: Adaptive Recalculation | MVP |
| Dashboard showing progress, skills, milestones, next actions | F11: Dashboard with all components | MVP |

---

### AI/ML Implementation — 20%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| Genuine AI/ML usage, not just API calls | Hybrid: LLM + embeddings + vector retrieval + algorithmic scoring + rule-based adaptation |
| Technical depth | Multi-factor scoring algorithm, prerequisite DAG with topological sort, continuous learner state |
| Appropriate AI choices | LLM where NLU is needed; algorithms where determinism is needed (no hallucinated paths) |
| Innovation in AI usage | Agentic AI Mentor with tool-calling, explainable scoring, reinforcement-style reward signals |

**Demo Talking Points:** "We deliberately chose NOT to use the LLM for sequencing or scoring. Prerequisite ordering uses topological sort — it can never hallucinate a bad sequence. Scoring uses a weighted multi-factor algorithm — it's transparent and reproducible. The LLM handles what it's best at: understanding natural language and explaining decisions."

---

### Innovation and Creativity — 15%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| Novel approach | GPS metaphor + adaptive recalculation (no other learning tool does this) |
| Creative features | What-If Time Machine, RPG Skill Tree, Resume-to-JD pipeline |
| Beyond the obvious | Next Best Action engine (solves choice paralysis, not just "here's your list") |
| "Wow" factor | "Recalculating Route..." animation is a rehearsed demo moment |

---

### User Experience and Interface — 10%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| Intuitive onboarding | Chat-based, not form-based; resume drag-and-drop |
| Clean, informative dashboard | Single-page dashboard with clear hierarchy |
| Visual data representation | Radar chart for skills, timeline for path, progress bar |
| Responsive and polished | Modern UI framework with smooth transitions and micro-animations |

---

### Performance and Code Quality — 10%

| What Judges Look For | How PathFinder Addresses It |
|---------------------|---------------------------|
| Clean, modular code | Separated components: onboarding, engine, dashboard, mentor |
| Appropriate technology choices | FastAPI (fast, async) + React (component-based) + ChromaDB (lightweight vector DB) |
| Error handling | Fallback responses for LLM failures, profile confirmation step, mentor confirmation for state changes |
| Performance | Path generation under 30 seconds, mentor response under 10 seconds |

---

## Appendix A: Data Requirements

| Data | Format | Size | Purpose |
|------|--------|------|---------|
| Skill Taxonomy | JSON | ~200 skills across 3-4 roles | Maps roles to required skills with proficiency levels |
| Prerequisite Graph | JSON (adjacency list) | ~100 edges | Defines skill dependencies for topological sort |
| Learning Resources | JSON | ~50-80 curated entries | Course/resource metadata: title, skills covered, difficulty, duration, type, URL |
| Learner Profile | JSON / SQLite | Per user | Stores and evolves learner state |

---

## Appendix B: Demo Script (3-5 Minute "Wow")

*Note: If the Resume/JD pipeline stretch goal isn't ready, the Hook falls back to MVP chat onboarding.*

1. **Hook (0:00-0:30):** "I want to apply for this Machine Learning role at Google." User pastes the Job Description and uploads their Resume. *(Fallback: "I know Python, want to become an ML Engineer in 6 months.")*
2. **Instant Profile and Gap (0:30-1:00):** System instantly parses both, showing a Radar Chart highlighting missing Statistics and ML skills.
3. **Roadmap (1:00-1:30):** A beautiful 6-month roadmap generates with milestones.
4. **Learning Start (1:30-2:00):** Learner clicks "Start" on Statistics. Explores the "Why This?" button — sees scoring breakdown.
5. **The Struggle (2:00-2:15):** Learner clicks "This is too difficult."
6. **The "Wow" Moment (2:15-2:45):** Screen shows "Recalculating Route..." animation. Timeline shifts. Probability Refresher inserted before Statistics.
7. **NBA Update (2:45-3:15):** Dashboard hero card flips from "Continue Statistics" to "Action Required: Complete Probability Refresher."
8. **AI Mentor (3:15-4:00):** Chat opens. Mentor says: "I noticed Statistics was tough! I've added a quick Probability refresher. Your Statistics quiz showed a gap in conditional probability — this module addresses exactly that."
9. **Close (4:00-4:30):** Show the updated radar chart. "PathFinder doesn't just give you a list — it gives you a path that learns as you learn."

---

## Appendix C: Feature Dependency Map

```
Conversational Onboarding
           |
           v
     Learner Profile ---------------+
           |                        |
           v                        v
     Skill-Gap Analysis <--- AI Mentor (Context)
           |                        ^
           v                        |
    Recommendation Engine           |
           |                        |
           v                        |
  Prerequisite Learning Path        |
           |                        |
           v                        |
   Dashboard (Progress) ------------+
           |
           v
   Adaptive Recalculation
           |
           v
  Next Best Action Engine
```

---

## Appendix D: Architecture (Web-Only)

```
Web Application (React / Next.js)
           |
      Backend API (FastAPI / Python)
           |
  Document Processing (PDF extraction / OCR)
           |
    Learner and Target Profile
           |
      Skill Gap Engine
           |
   Skill / Prerequisite Graph
           |
  Semantic Resource Retrieval (ChromaDB)
           |
   Recommendation Scoring (Multi-Factor Algorithm)
           |
   Personalized Roadmap and Milestones
           |
  Learning + Assessments + Behaviour
           |
  Learner State + Reward Update
           |
   Adaptive Recalculation
           |
  Next Best Action + AI Mentor
```

---

## Appendix E: Recommended MVP Feature Set (Final Summary)

**Build these 9 things. In this order. Stop only when all 9 work end-to-end.**

| Order | Feature | Owner Focus |
|-------|---------|------------|
| 1 | Skill Taxonomy + Prerequisite Graph + Resource DB (JSON files) | Data — must exist before anything else works |
| 2 | Chat-based onboarding with LLM profile extraction | Backend + Frontend |
| 3 | Skill-Gap Analysis engine | Backend (pure logic) |
| 4 | Prerequisite-aware path generation (hardcoded sequences) | Backend (pure logic) |
| 5 | Multi-factor recommendation scoring | Backend (pure logic) |
| 6 | Dashboard: progress bar + timeline + radar chart | Frontend |
| 7 | "Why This?" explainability on each recommendation | Backend (LLM) + Frontend |
| 8 | Progress tracking (Complete / Skip / Struggling buttons) | Frontend + Backend |
| 9 | Adaptive recalculation + NBA update on feedback | Backend + Frontend ("Recalculating Route..." moment) |

**After MVP is solid, add in order:** Resume/JD Pipeline, AI Mentor, What-If Time Machine.

---

*PathFinder: Stop guessing. Start learning. We'll recalculate the route.*
