# PathFinder — User Flow & Feature Specification

---

## Part 1: Detailed User Flows

---

### Flow 1 — First-Time User Experience

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 1.1 | Opens PathFinder URL | Loads landing page with hero section, value prop, and "Start Learning" CTA | None | None | Landing page with tagline: "Your GPS for Learning" + animated path graphic | Page fails to load → show retry message | Click "Start Learning" |
| 1.2 | Clicks "Start Learning" | Navigates to onboarding chat screen | None | None | Chat interface with AI greeting message | Navigation failure → fallback redirect | Begin onboarding (Flow 2) |

**Design Notes:**
- Landing page must load in < 2 seconds
- Hero animation: a path being drawn dynamically (CSS animation)
- Single CTA button — no sign-up form, no auth wall (hackathon scope)
- Mobile-responsive layout

---

### Flow 2 — Onboarding Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 2.1 | Arrives at chat screen | Displays chat UI with AI greeting | LLM sends opening message: "Hi! I'm PathFinder. Tell me about your learning goal — what do you want to become?" | None | Chat bubble with greeting + input field | LLM API timeout → show static greeting fallback | User types goal |
| 2.2 | Types goal in natural language (e.g., "I know Python, want to become ML Engineer in 6 months, 10 hrs/week") | Sends message to backend | LLM extracts structured profile from input using JSON mode. If incomplete, generates a follow-up question. | User message text | AI response: either a follow-up question OR extracted profile summary for confirmation | LLM extraction fails → ask user to rephrase | If complete → 2.4. If incomplete → 2.3 |
| 2.3 | Answers follow-up question(s) (max 3 rounds) | Appends to conversation context, re-sends to LLM | LLM re-extracts with additional context | Accumulated conversation | Follow-up question or extracted profile | 3 rounds exhausted without complete profile → show manual form fallback | Profile extracted → 2.4 |
| 2.4 | Reviews extracted profile card (goal, skills, time budget, deadline, experience level) | Renders editable profile summary card | None | Extracted JSON profile | Profile card with editable fields + "Confirm" / "Edit" buttons | None | User confirms or edits |
| 2.5a | Clicks "Confirm" | Saves profile to backend, triggers skill-gap analysis | None | Confirmed profile JSON | Loading animation: "Analyzing your skills..." | Save fails → retry | Skill-Gap Analysis (Flow 6) |
| 2.5b | Clicks "Edit" on a field | Opens inline edit for that field | None | Current profile data | Editable field | None | Back to 2.4 after edit |

**Fallback Path (Should Have — Resume/JD Upload):**

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 2.R1 | Clicks "Upload Resume" or "Paste JD" tab | Shows drag-and-drop zone / text area | None | None | Upload area with file type hints (PDF) | None | User uploads/pastes |
| 2.R2 | Uploads Resume PDF / Pastes JD text | Extracts text from PDF (PyPDF2). Sends text to LLM. | LLM extracts current skills (from resume) and target skills (from JD) | PDF binary / JD text | "Processing your documents..." spinner | PDF parsing fails → "Could not read PDF. Try copy-pasting the content instead." | Profile card (2.4) |

**AI Prompt Design for Onboarding:**
```
System: You are PathFinder's onboarding assistant. Extract a learner profile from the conversation.
Output ONLY valid JSON: {
  "goal": "string",
  "target_role": "string",
  "current_skills": [{"name": "string", "level": "beginner|intermediate|advanced"}],
  "time_budget_hours_per_week": number,
  "deadline_months": number,
  "experience_level": "beginner|intermediate|advanced",
  "preferred_format": "video|article|project|mixed"
}
If any field cannot be determined, set it to null and ask ONE focused follow-up question.
```

---

### Flow 3 — Learner Profile Creation

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 3.1 | Confirms profile in Flow 2 | Creates learner record in storage (JSON/SQLite) | None | Confirmed profile JSON | Success toast: "Profile saved!" | Storage write fails → retry | Initialize learner state |
| 3.2 | None (automatic) | Initializes continuous learner state: all mastery levels set to current proficiency, empty assessment history, zero reward scores | None | Profile data | None (background) | None | Skill-Gap Analysis (Flow 6) |
| 3.3 | None (automatic) | Maps user's current_skills to skill taxonomy entries using fuzzy matching | None if exact match; LLM for fuzzy matching | Profile skills + Skill Taxonomy JSON | None (background) | Skill not found in taxonomy → flag as "unrecognized", still proceed | Continue to gap analysis |

**Data Model — Learner Profile:**
```json
{
  "id": "learner_001",
  "goal": "Become an ML Engineer",
  "target_role": "ml_engineer",
  "current_skills": [
    { "skill_id": "python", "name": "Python", "self_assessed_level": 2, "mastery_level": 2 }
  ],
  "time_budget_hours_per_week": 10,
  "deadline_months": 6,
  "experience_level": "intermediate",
  "preferred_format": "video",
  "learner_state": {
    "assessment_scores": [],
    "completion_history": [],
    "struggle_history": [],
    "skip_history": [],
    "reward_signals": {},
    "difficulty_tolerance": "normal"
  },
  "created_at": "2026-08-23T00:00:00Z",
  "updated_at": "2026-08-23T00:00:00Z"
}
```

---

### Flow 4 — Goal Input Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 4.1 | Types learning goal in chat (e.g., "I want to become a Data Scientist") | Sends to LLM for extraction | LLM identifies target_role, maps to closest role in skill taxonomy | User message + Skill Taxonomy | Extracted goal shown in chat: "Got it! Your goal: Data Scientist" | Role not in taxonomy → "I don't have a path for that specific role yet. Here are similar ones: [list]. Which one fits best?" | Confirm or clarify |
| 4.2 | Confirms goal or picks from suggested alternatives | Saves target_role to profile | None | Confirmed role ID | Goal locked in profile card | None | Continue onboarding (skills, time, etc.) |

**Supported Roles (MVP):**
- ML Engineer
- Web Developer (Full Stack)
- Data Analyst
- Data Scientist (shares path with ML Engineer + extras)

**Edge Case — Unsupported Goal:**
If the user types a goal not in the taxonomy (e.g., "I want to learn game design"), the system responds: "I don't have a curated path for Game Design yet, but I can help with these related roles: [Web Developer, Data Analyst, ML Engineer]. Would any of these work, or would you like me to try building a custom path?" (Custom path = LLM-generated, flagged as experimental.)

---

### Flow 5 — Skill Assessment Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 5.1 | States current skills in chat (e.g., "I know Python and basic SQL") | Parses skill mentions | LLM extracts skill names and estimates proficiency from context clues ("basic" = beginner, "experienced" = advanced) | User message | Chat response: "I see you know: Python (Intermediate), SQL (Beginner). Is that right?" | Ambiguous skill → LLM asks: "When you say 'programming', which languages?" | Confirm or correct |
| 5.2 | Confirms or corrects levels | Updates profile with confirmed skills and levels | None | Confirmed skill list | Updated profile card | None | Complete onboarding |
| 5.3 (Stretch) | Takes a quick skill verification quiz | Presents 3-5 MCQ questions per claimed skill | LLM generates questions based on claimed skill + level | Skill name + claimed level | Quiz UI with questions | LLM generates bad questions → fallback to self-assessment | Score determines actual mastery level |
| 5.4 (Stretch) | Submits quiz | Scores quiz, adjusts mastery level if score contradicts self-assessment | None (scoring is app logic) | Quiz answers + answer key | "Your Python knowledge checks out! But your SQL score (40%) suggests Beginner level. I've adjusted your profile." | None | Continue with adjusted profile |

---

### Flow 6 — Skill-Gap Analysis Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 6.1 | None (triggered after profile confirmation) | Looks up target role in Skill Taxonomy → gets required skills with proficiency levels | None | target_role + Skill Taxonomy JSON | Loading: "Analyzing your skill gaps..." | Role not found → fallback error | Compute gaps |
| 6.2 | None (automatic) | For each required skill: gap = required_level - current_level. Filters gaps > 0. Sorts by priority (topological depth * 0.6 + severity * 0.4). | None | Required skills + Current skills | None (processing) | None | Render results |
| 6.3 | Views Skill Gap screen | Renders Radar Chart (current vs. required) + Gap Table | None | Gap analysis results | Radar Chart + table: "You need Statistics (Intermediate) but you're at None — HIGH gap" | Chart rendering fails → show table only | "Generate My Path" button |
| 6.4 | Clicks "Generate My Learning Path" | Triggers path generation (Flow 7) | None | Gap results | Transition animation → path generation screen | None | Flow 7 |

**Radar Chart Data Format:**
```json
{
  "labels": ["Python", "Statistics", "Pandas", "ML Algorithms", "Data Viz"],
  "current": [2, 0, 0, 0, 1],
  "required": [2, 2, 2, 3, 2]
}
```

---

### Flow 7 — Learning-Path Generation Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 7.1 | None (triggered from Flow 6) | Builds prerequisite subgraph from gap skills. Prunes known skills. Runs topological sort. | None | Gap skills + Prerequisite Graph JSON | Loading: "Building your personalized roadmap..." with animated path drawing | Graph has cycles → error log, use fallback linear ordering | Assign resources |
| 7.2 | None (automatic) | For each skill in sorted order: queries Recommendation Engine (semantic retrieval + multi-factor scoring) to find best resource | Embeddings search via ChromaDB | Sorted skills + Resource DB + Learner profile | None (processing) | No matching resource → flag skill, use generic placeholder | Build timeline |
| 7.3 | None (automatic) | Accumulates durations against weekly budget. Assigns each module to a week. Inserts milestones after skill clusters. Calculates completion date. | None | Resource durations + time budget + deadline | None (processing) | Completion date > deadline → generate warning | Render roadmap |
| 7.4 | Views generated roadmap | Renders interactive timeline with modules, milestones, estimated dates, and status indicators | None | Complete path data | Visual timeline: "Week 1-2: Statistics Foundations → Week 3-4: Pandas & NumPy → ..." | None | Explore modules |
| 7.5 | Clicks on any module in the timeline | Opens module detail panel (resource title, description, duration, difficulty, type, link, "Why This?" button) | None | Module resource data | Module detail card | None | Start learning or ask "Why This?" |

**Timeline Warning (Edge Case):**
If the generated path exceeds the learner's deadline:
> "⚠️ At 10 hrs/week, this path will take ~8 months — 2 months longer than your 6-month goal. You can: (1) Increase weekly hours, (2) Skip some optional modules, or (3) Keep the extended timeline."

---

### Flow 8 — Recommendation Explanation Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 8.1 | Clicks "Why This?" on any recommended resource | Retrieves the scoring breakdown for that resource from the scoring log | None | Resource ID + scoring log | Scoring breakdown card (see below) | Scoring data missing → show generic: "Selected based on your skill gaps and preferences" | User reads or asks mentor |
| 8.2 | Views scoring breakdown | Renders multi-factor score visualization | None | Scoring factors | Bar chart or list showing each factor + score (see template below) | None | Close or ask AI Mentor |
| 8.3 (Optional) | Clicks "Ask Mentor" from explanation card | Opens AI Mentor chat with pre-filled context | LLM generates conversational explanation grounded in scoring data | Scoring data + learner context | Mentor chat with natural-language explanation | LLM fails → show the structured scoring data as fallback | Continue learning |

**Scoring Breakdown Card Template:**
```
╔══════════════════════════════════════╗
║  Why This Was Chosen For You         ║
╠══════════════════════════════════════╣
║                                      ║
║  📊 Skill Relevance: ████████░░ 92%  ║
║  Covers Statistics — your #1 gap     ║
║                                      ║
║  🎯 Difficulty Fit:  ███████░░░ 85%  ║
║  Intermediate matches your level     ║
║                                      ║
║  ⏱️ Time Fit:        █████████░ 95%  ║
║  4 hrs fits your 10 hrs/week budget  ║
║                                      ║
║  🎬 Format Match:    ████████░░ 80%  ║
║  Video course (your preference)      ║
║                                      ║
║  ✅ Prerequisites:   ██████████ 100% ║
║  Requires Basic Math — you have it   ║
║                                      ║
║  ══════════════════════════════════  ║
║  Overall Score: 91/100               ║
║                                      ║
║  [Ask Mentor]  [Got It]              ║
╚══════════════════════════════════════╝
```

---

### Flow 9 — Course/Resource Exploration Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 9.1 | Clicks on a module in the timeline | Opens module detail panel | None | Module metadata | Resource card: title, description, type (video/article/project), difficulty, duration, provider, external link, "Why This?" button | None | Explore or start |
| 9.2 | Clicks external link to resource | Opens resource URL in new tab | None | Resource URL | New browser tab with the course/resource | URL broken → show "Resource unavailable. Ask Mentor for alternatives." | User studies externally |
| 9.3 | Returns to PathFinder after studying | Dashboard is still showing current module as active | None | None | Module still marked "In Progress" | None | Mark completion (Flow 11) |
| 9.4 | Clicks "See Alternatives" (if available) | Shows next 2-3 ranked resources for the same skill from the Recommendation Engine | None | Scoring results (top 3) | List of alternative resources with scores | No alternatives → "This is the best match for your profile" | Pick alternative or stick with current |

---

### Flow 10 — Project Recommendation Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 10.1 | Reaches a milestone that includes a project | System highlights project module with distinct styling (star icon, "Capstone" badge) | None | Path data — module type = "project" | Project card with: title, description, skills applied, estimated duration, deliverable description | None | View project details |
| 10.2 | Clicks on project module | Opens project detail panel with requirements, skills tested, and expected deliverable | None | Project metadata | Detailed project card: "Build a Movie Recommendation System using Pandas + Scikit-learn. Expected time: 8 hours. Skills tested: Data Cleaning, ML Basics." | None | Start project |
| 10.3 | Clicks "Start Project" | Marks project as In Progress, starts timer | None | Module ID | Status updated, timer shown | None | Work on project |
| 10.4 | Clicks "Complete Project" | Marks project done, bumps mastery for all related skills, checks if milestone is unlocked | None | Module ID + related skills | Milestone unlock animation (if applicable) + mastery updates on radar chart | None | NBA updates |

**Project Recommendation Logic:**
Projects are inserted into the path after every major skill cluster (milestone). They are selected from the Resource DB where `type = "project"` and `skills_covered` overlaps with the completed cluster's skills.

---

### Flow 11 — Learning Progress Tracking Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 11.1 | Clicks "Complete" on a module | Updates module status to Done. Increments progress. Updates mastery for related skills. Logs completion timestamp. | None | Module ID | Progress bar updates. Module turns green on timeline. Toast: "Nice! 5/12 modules complete." | None | Check for assessment |
| 11.2a | Assessment available for module | Presents 3-5 quick quiz questions | LLM generates OR pre-built questions are fetched | Module skill + difficulty | Quiz UI | No assessment available → skip to 11.3 | Score assessment |
| 11.2b | Submits assessment answers | Scores quiz. Updates mastery based on score. Logs assessment result. | None | Answers + correct answers | Score display: "You scored 78%! Statistics mastery updated to Intermediate." | None | Check adaptation triggers (Flow 13) |
| 11.3 | Clicks "Skip (too easy)" on a module | Removes module from active path. Bumps mastery for that skill. Compresses timeline. Logs skip. | None | Module ID + related skill | Module grayed out on timeline. Toast: "Skipped! Timeline compressed." | None | NBA updates |
| 11.4 | Clicks "Struggling" on a module | Flags module. Triggers adaptive recalculation. Logs struggle. | None | Module ID | "Recalculating Route..." animation | None | Adaptive flow (Flow 13) |
| 11.5 | Views dashboard | Progress bar, timeline, radar chart all reflect current state | None | Learner state | Updated dashboard | None | Continue learning |

---

### Flow 12 — Feedback Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 12.1 | Clicks "Struggling" on active module | Captures struggle signal. Adds to struggle_history. Updates difficulty_tolerance. | None | Module ID | Confirmation: "Got it. Let me recalculate your path..." | None | Trigger adaptation |
| 12.2 | Clicks "Skip (too easy)" | Captures skip signal. Adds to skip_history. Bumps mastery. | None | Module ID | "Skipped! You clearly know this already." | None | Trigger adaptation |
| 12.3 | Completes assessment with score | Captures score. Updates mastery. Computes reward signal (+/- based on expected vs actual). | None | Score + expected range | Score shown + mastery update | None | Trigger adaptation |
| 12.4 | Changes goal via AI Mentor ("I want to switch to Web Dev") | Captures goal change. Saves new target_role. Preserves completed skills. | LLM processes goal change if via chat | New goal text | "Goal updated! Recalculating your entire path..." | None | Full path recalculation |
| 12.5 | Rates a resource (optional — thumbs up/down) | Updates reward signal for that resource type/difficulty/format | None | Resource ID + rating | "Thanks for the feedback!" | None | Reward influences future scoring |

---

### Flow 13 — Adaptive Recommendation Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 13.1 | Triggers adaptation (via struggle/skip/score/goal change) | Adaptation engine checks which rule applies (see table below) | None | Trigger type + learner state | "Recalculating Route..." animation (GPS-style) | None | Execute adaptation |
| 13.2 | None (automatic) | Executes the matched adaptation rule | None | Current path + learner state + prerequisite graph | None (processing) | No rule matches → no change, resume normal flow | Update path |
| 13.3 | None (automatic) | Regenerates affected portion of the path. Rescores resources for any new/changed modules. Recalculates timeline. | Embeddings search for new resources if modules inserted | Updated gap + Resource DB | None (processing) | No resource found for inserted module → use generic placeholder | Render changes |
| 13.4 | Views updated path | Timeline animation shows modules shifting, new modules sliding in, removed modules fading out | None | Updated path data | Animated timeline update + highlight on what changed | Animation fails → instant refresh (no animation) | NBA update |
| 13.5 | Reads updated NBA card | NBA card flips to new action based on adaptation | None | Adaptation result | NBA: "Action Required: Complete Probability Refresher before continuing Statistics" | None | Continue learning on new path |
| 13.6 | (If AI Mentor active) | Mentor proactively messages about the change | LLM generates contextual message about the adaptation | Adaptation details + learner context | Mentor: "I noticed Statistics was tough! I've added a Probability refresher — it should help with the concepts you struggled with." | LLM fails → static message: "Your path has been updated based on your feedback." | Continue |

**Adaptation Rules (Quick Reference):**

| Trigger | Rule | Path Change |
|---------|------|-------------|
| Struggling | Insert prerequisite refresher | New module added before current |
| Skip (too easy) | Remove + bump mastery | Module removed, timeline compressed |
| High score (>80%) | Compress/accelerate | Skip redundant next modules |
| Low score (<50%) | Insert refresher | Add easier module before next topic |
| Repeated failure (2+) | Go deeper in prerequisite graph | Insert fundamental module |
| Goal change | Full recalculation | Entire path regenerated |

---

### Flow 14 — AI Mentor / Chat Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 14.1 | Clicks floating AI Mentor chat button | Opens chat panel (slide-in from right or bottom sheet) | None | None | Chat panel with conversation history (if any) + input field | None | Type message |
| 14.2 | Types a question (e.g., "Why is Statistics before ML?") | Sends message to backend with full learner context | ReAct agent: Reason → decides to call `get_skill_gap()` → gets gap data → generates answer using gap + prereq info | User message + learner state + path data | Mentor response referencing specific data: "Statistics is before ML because ML algorithms require statistical concepts like probability distributions. Your current Statistics level is None, but ML needs Intermediate." | LLM timeout → "I'm having trouble thinking right now. Try again in a moment." | Continue conversation |
| 14.3 | Asks to perform an action ("Skip the SQL module") | Sends to agent | Agent calls `skip_module()` tool → but first generates confirmation prompt | Module data + path context | Mentor: "The SQL module feeds into Data Pipeline later. Skipping it may cause issues. Are you sure? [Confirm Skip / Keep It]" | None | User confirms or cancels |
| 14.4a | Clicks "Confirm Skip" | Executes skip_module(), updates path, triggers adaptation | None | Module ID | "Done! I've removed SQL and adjusted your timeline. Your new estimated completion: 5.5 months." | Adaptation fails → rollback, show error | Path updates |
| 14.4b | Clicks "Keep It" | No action taken | None | None | "No problem! SQL stays in your path." | None | Continue |
| 14.5 | Asks progress question ("How am I doing?") | Sends to agent | Agent calls `get_progress()` → formats response | Learner state | "You've completed 5/12 modules (42%). Your last 3 scores: 85%, 78%, 92%. You're 1 week ahead of schedule! Next milestone: Data Fundamentals." | None | Continue |
| 14.6 | Asks recommendation question ("What should I do next?") | Sends to agent | Agent calls `get_recommendations()` → returns NBA + reasoning | NBA data + scoring | "Your next best action is to complete the Pandas Basics course. It scored 94/100 for you because it directly addresses your #2 gap and fits your time budget." | None | Continue |

**Proactive Mentor Messages (System-Initiated):**

| Trigger | Mentor Message |
|---------|---------------|
| Adaptation triggered | "I noticed you're struggling with [topic]. I've adjusted your path — check out the new module I added!" |
| Milestone completed | "🎉 Congrats! You've completed the Data Fundamentals milestone! Next up: ML Foundations." |
| 3+ day inactivity | "Hey! Haven't seen you in a while. Your next module is [X] — it's only [Y] hours. Ready to continue?" |
| Ahead of schedule | "You're crushing it! You're 2 weeks ahead. Want me to suggest some advanced content?" |

---

### Flow 15 — Dashboard Flow

| Step | User Action | System Action | AI Action | Data Required | Output Shown | Possible Errors | Next Step |
|------|------------|---------------|-----------|---------------|-------------|-----------------|-----------|
| 15.1 | Navigates to Dashboard (default landing after onboarding) | Loads all dashboard components with current learner state | None | Full learner state + path data | Complete dashboard (see components below) | Any component fails → render others, show "Error loading [component]" in placeholder | Interact with components |
| 15.2 | Clicks NBA card | Navigates to the recommended module detail | None | NBA module data | Module detail panel | None | Start module |
| 15.3 | Hovers over Radar Chart skill | Shows exact proficiency values | None | Mastery data | Tooltip: "Statistics: 1.5/3 (Intermediate)" | None | Information only |
| 15.4 | Clicks a module on the timeline | Opens module detail panel | None | Module data | Module card with "Why This?", "Start", etc. | None | Explore module |
| 15.5 | Views milestones section | Shows milestone cards with lock/unlock status | None | Milestone data from path | Milestone cards: locked (gray), unlocked (glowing), completed (checkmark) | None | Motivation |
| 15.6 | Clicks AI Mentor FAB | Opens chat panel | None | None | Chat interface | None | Flow 14 |
| 15.7 | Views recent activity | Shows last 3-5 logged actions | None | Activity log | "Completed NumPy Basics (85%)", "Skipped Python Intro" | None | Information only |

---

## Part 2: Screen Specifications

---

### Screen 1 — Landing Page

| Property | Detail |
|----------|--------|
| **Screen Name** | Landing Page |
| **Purpose** | First impression. Communicate value prop. Single CTA to start. |
| **Components** | Hero section with tagline + animated path graphic, "Start Learning" button, 3 feature highlights (Personalized Paths, Adaptive AI, Explainable Recommendations), footer |
| **User Interactions** | Click "Start Learning" → navigate to Onboarding |
| **Data Displayed** | Static content only |
| **API/Backend Dependency** | None |

---

### Screen 2 — Onboarding Chat

| Property | Detail |
|----------|--------|
| **Screen Name** | Onboarding Chat |
| **Purpose** | Collect learner goal, skills, time budget, and preferences via natural language conversation |
| **Components** | Chat message list, text input field, send button, (optional) "Upload Resume" / "Paste JD" tabs, profile summary card (appears after extraction) |
| **User Interactions** | Type messages, confirm/edit extracted profile, upload files (stretch) |
| **Data Displayed** | AI messages, extracted profile card with editable fields |
| **API/Backend Dependency** | `POST /api/onboarding/chat` — sends message, receives AI response + extracted profile JSON. `POST /api/onboarding/upload` — sends PDF, receives extracted skills. |

---

### Screen 3 — Skill-Gap Analysis

| Property | Detail |
|----------|--------|
| **Screen Name** | Skill-Gap Analysis |
| **Purpose** | Show the learner exactly what they know vs. what they need, building anticipation for the roadmap |
| **Components** | Radar Chart (current vs. required), Gap Table (skill, current level, required level, severity badge), "Generate My Learning Path" CTA button |
| **User Interactions** | Hover radar chart for details, review gap table, click CTA to generate path |
| **Data Displayed** | Skills with current/required levels, gap severity (High/Medium/Low with color coding) |
| **API/Backend Dependency** | `GET /api/skill-gap/{learner_id}` — returns gap analysis results |

---

### Screen 4 — Learning Path / Roadmap

| Property | Detail |
|----------|--------|
| **Screen Name** | Learning Path |
| **Purpose** | Display the personalized, prerequisite-ordered roadmap with milestones and timeline |
| **Components** | Interactive timeline (horizontal or vertical), module cards on timeline (with status: Not Started / In Progress / Done / Skipped), milestone markers, estimated completion date, week labels, "Start First Module" CTA |
| **User Interactions** | Click any module → opens Module Detail panel, click milestone → see requirements, scroll/pan timeline |
| **Data Displayed** | Ordered modules with: title, duration, difficulty badge, type icon (video/article/project), status indicator, week assignment |
| **API/Backend Dependency** | `GET /api/learning-path/{learner_id}` — returns ordered path with modules + milestones |

---

### Screen 5 — Module Detail Panel

| Property | Detail |
|----------|--------|
| **Screen Name** | Module Detail (slide-over panel or modal) |
| **Purpose** | Show detailed information about a single module/resource and allow actions |
| **Components** | Resource title, description, provider, difficulty badge, duration, type icon, external link button, "Why This?" button, action buttons (Start / Complete / Skip / Struggling), "See Alternatives" link |
| **User Interactions** | Click "Start" → mark In Progress. Click "Complete" → mark Done + trigger assessment. Click "Skip" → remove module + adapt. Click "Struggling" → trigger adaptation. Click "Why This?" → show explanation card. Click external link → open resource. |
| **Data Displayed** | Full resource metadata + inline scoring summary |
| **API/Backend Dependency** | `GET /api/module/{module_id}` — resource details. `POST /api/module/{module_id}/action` — (start/complete/skip/struggling). `GET /api/module/{module_id}/explanation` — scoring breakdown. |

---

### Screen 6 — Explanation Card (Overlay)

| Property | Detail |
|----------|--------|
| **Screen Name** | "Why This?" Explanation |
| **Purpose** | Show transparent, multi-factor scoring breakdown for a recommendation |
| **Components** | Factor bars (skill relevance, difficulty fit, time fit, format match, prerequisites), percentage labels, overall score, one-line natural language summary, "Ask Mentor" button, "Got It" close button |
| **User Interactions** | Read breakdown, click "Ask Mentor" for conversational explanation, close |
| **Data Displayed** | Scoring factors with percentages, natural-language summary |
| **API/Backend Dependency** | `GET /api/module/{module_id}/explanation` — returns scoring factors + LLM-generated summary |

---

### Screen 7 — Assessment Quiz (Modal)

| Property | Detail |
|----------|--------|
| **Screen Name** | Quick Assessment |
| **Purpose** | Test understanding after module completion to drive adaptive recalculation |
| **Components** | 3-5 multiple-choice questions, progress indicator (1/5, 2/5...), submit button, score display after completion |
| **User Interactions** | Select answers, submit, view score |
| **Data Displayed** | Questions, options, final score, mastery update notification |
| **API/Backend Dependency** | `GET /api/assessment/{module_id}` — returns questions. `POST /api/assessment/{module_id}/submit` — submits answers, returns score + mastery update. |

---

### Screen 8 — Dashboard (Main Screen)

| Property | Detail |
|----------|--------|
| **Screen Name** | Dashboard |
| **Purpose** | Single-screen overview of the entire learning journey. Default view after onboarding. |
| **Components** | Next Best Action hero card, progress bar (% complete), learning path timeline (compact/scrollable), skill radar chart, milestones section, recent activity feed, floating AI Mentor chat button |
| **User Interactions** | Click NBA card → go to module. Click timeline module → open detail. Hover radar → see values. Click mentor FAB → open chat. |
| **Data Displayed** | NBA text, completion %, timeline with statuses, skill mastery levels, milestone lock states, last 3-5 activities |
| **API/Backend Dependency** | `GET /api/dashboard/{learner_id}` — returns all dashboard data (NBA, progress, path, mastery, milestones, activity). Alternatively, multiple endpoints composed on frontend. |

---

### Screen 9 — AI Mentor Chat Panel

| Property | Detail |
|----------|--------|
| **Screen Name** | AI Mentor Chat |
| **Purpose** | Contextual AI assistant that understands the learner's full state and can take scoped actions |
| **Components** | Chat message list (with rich formatting — bold, lists, code), text input, send button, typing indicator, action confirmation cards (for state-changing operations), context badge showing active module |
| **User Interactions** | Type questions/commands, confirm/deny actions, scroll history |
| **Data Displayed** | Conversation history, learner context badge, action confirmation prompts |
| **API/Backend Dependency** | `POST /api/mentor/chat` — sends message + learner context, returns agent response. WebSocket optional for streaming. |

---

### Screen 10 — Recalculation Overlay

| Property | Detail |
|----------|--------|
| **Screen Name** | "Recalculating Route..." Overlay |
| **Purpose** | The "wow" moment — visually shows the AI adapting the path in real-time |
| **Components** | Semi-transparent overlay, animated GPS-style "Recalculating Route..." text, path animation (nodes shifting, new nodes appearing), brief summary of what changed |
| **User Interactions** | Watch animation (auto-dismisses after 2-3 seconds), or click to dismiss early |
| **Data Displayed** | Animation + change summary: "Added: Probability Refresher. Moved: Statistics → Week 3." |
| **API/Backend Dependency** | Triggered by `POST /api/module/{id}/action` (struggle/skip) → backend returns updated path + diff |

---

## Part 3: Complete User Journey

### End-to-End Journey: Onboarding → First Milestone

```
PHASE 1: ONBOARDING (2-3 minutes)
═══════════════════════════════════
  User opens PathFinder
       │
       ▼
  Landing Page → clicks "Start Learning"
       │
       ▼
  Onboarding Chat opens
       │
       ▼
  User types: "I know Python, want to become ML Engineer, 10 hrs/week, 6 months"
       │
       ▼
  AI extracts profile → shows profile card for confirmation
       │
       ▼
  User confirms profile
       │
       ▼

PHASE 2: ANALYSIS & PATH GENERATION (30-60 seconds)
════════════════════════════════════════════════════
  Skill-Gap Analysis runs automatically
       │
       ▼
  Radar Chart + Gap Table displayed
  (Python: OK | Statistics: GAP | Pandas: GAP | ML: GAP)
       │
       ▼
  User clicks "Generate My Learning Path"
       │
       ▼
  Path generated: Statistics → Pandas → Scikit-learn → ML Project → Capstone
  (Python SKIPPED — already known)
       │
       ▼
  Dashboard loads with roadmap, NBA card, radar chart
       │
       ▼

PHASE 3: LEARNING & FIRST MODULE (user's pace)
═══════════════════════════════════════════════
  NBA card shows: "Start: Statistics Foundations"
       │
       ▼
  User clicks NBA → Module Detail opens
       │
       ▼
  User clicks "Why This?" → sees scoring: 92% skill relevance, 85% difficulty fit
       │
       ▼
  User clicks "Start" → opens external resource in new tab
       │
       ▼
  User studies... returns to PathFinder
       │
       ▼

PHASE 4: FIRST ADAPTATION (the "wow" moment)
═════════════════════════════════════════════
  User clicks "Struggling" on Statistics module
       │
       ▼
  ╔═══════════════════════════════╗
  ║   🗺️ Recalculating Route...   ║
  ╚═══════════════════════════════╝
       │
       ▼
  Probability Refresher module INSERTED before Statistics
  Timeline shifts — all modules pushed by 1 week
       │
       ▼
  NBA card flips: "Action Required: Complete Probability Refresher"
       │
       ▼
  AI Mentor pops up: "Statistics was tough! I've added a Probability
  refresher. It covers the concepts you'll need."
       │
       ▼

PHASE 5: RECOVERY & PROGRESS
═════════════════════════════
  User completes Probability Refresher → scores 88%
       │
       ▼
  Mastery updated. Module marked Done. Progress: 1/13 (now 13 modules)
       │
       ▼
  User continues Statistics → this time scores 75%
       │
       ▼
  Statistics mastery updated to Intermediate ✓
  Progress: 2/13
       │
       ▼

PHASE 6: FIRST MILESTONE 🎉
════════════════════════════
  User completes Pandas module → scores 82%
       │
       ▼
  ╔══════════════════════════════════════╗
  ║  🏆 MILESTONE UNLOCKED:              ║
  ║  "Data Fundamentals Complete"        ║
  ║  Skills: Statistics, Pandas, NumPy   ║
  ╚══════════════════════════════════════╝
       │
       ▼
  Radar chart shows visible growth in 3 skill areas
  Progress: 4/13 (31%)
       │
       ▼
  NBA: "Next Milestone: ML Foundations. Start with: Scikit-learn Basics"
       │
       ▼
  AI Mentor: "Amazing work! You've mastered the data fundamentals.
  Your next challenge is ML — and you're ready for it! 💪"
```

---

## Part 4: MVP vs. Optional Screens

### MVP Screens (Must Build)

| # | Screen | Why MVP |
|---|--------|---------|
| 1 | Landing Page | First impression for judges |
| 2 | Onboarding Chat | Core requirement — conversational goal input |
| 3 | Skill-Gap Analysis (Radar + Table) | Visual proof of intelligence |
| 4 | Learning Path / Roadmap | Core deliverable — the personalized path |
| 5 | Module Detail Panel | Needed to interact with modules |
| 6 | "Why This?" Explanation Card | Core differentiator — explainable AI |
| 7 | Dashboard | Required by problem statement |
| 8 | Recalculation Overlay | The "wow" demo moment |

**Total MVP Screens: 8**

### Should Have Screens

| # | Screen | Why Should Have |
|---|--------|----------------|
| 9 | AI Mentor Chat Panel | Proves agentic AI, high judging impact |
| 10 | Assessment Quiz Modal | Drives intelligent adaptation |

### Stretch Screens

| # | Screen | Demo Impact |
|---|--------|-------------|
| 11 | Resume/JD Upload Tab (in Onboarding) | Very High |
| 12 | What-If Time Machine (slider in Dashboard) | Very High |
| 13 | RPG Skill Tree (alternative path view) | High |

---

## Part 5: Navigation Structure

### Primary Navigation

```
┌──────────────────────────────────────────────┐
│  PathFinder    [Dashboard]  [My Path]  [Chat] │
└──────────────────────────────────────────────┘
```

| Nav Item | Screen | Notes |
|----------|--------|-------|
| Logo / Home | Dashboard | Default after onboarding |
| Dashboard | Dashboard | Main hub |
| My Path | Learning Path (full view) | Detailed roadmap timeline |
| Chat | AI Mentor (opens panel) | Floating button alternative |

### Screen Flow Map

```
Landing Page
    │
    ▼
Onboarding Chat ──(optional)──> Resume/JD Upload
    │
    ▼
Skill-Gap Analysis
    │
    ▼
Learning Path Generation
    │
    ▼
┌────────────────────────────────────────┐
│              DASHBOARD                  │
│  ┌─────────┐  ┌──────────┐  ┌───────┐ │
│  │   NBA   │  │  Radar   │  │ Path  │ │
│  │  Card   │  │  Chart   │  │ Mini  │ │
│  └────┬────┘  └──────────┘  └───┬───┘ │
│       │                         │      │
│       ▼                         ▼      │
│  Module Detail ◄────────── Full Path   │
│       │                                │
│       ├──> "Why This?" Card            │
│       ├──> Assessment Quiz             │
│       ├──> "Struggling" → Recalc       │
│       └──> "Skip" → Recalc            │
│                                        │
│              [AI Mentor FAB] ──────────┤
│                    │                   │
│                    ▼                   │
│              Mentor Chat Panel         │
└────────────────────────────────────────┘
```

### Navigation Rules

1. **Onboarding is one-way** — once profile is confirmed, user cannot go back to onboarding (but can edit profile in settings or via Mentor)
2. **Dashboard is the hub** — all roads lead back to Dashboard
3. **Module Detail is a panel/modal** — overlays on Dashboard or Path view, doesn't navigate away
4. **Mentor Chat is always accessible** — floating button visible on every screen after onboarding
5. **Recalculation Overlay is temporary** — auto-dismisses after 2-3 seconds, returns to Dashboard

---

## Part 6: API Endpoint Summary

| Method | Endpoint | Purpose | Screen |
|--------|----------|---------|--------|
| POST | `/api/onboarding/chat` | Process chat message, extract profile | Onboarding Chat |
| POST | `/api/onboarding/upload` | Process resume/JD upload | Onboarding Chat (stretch) |
| POST | `/api/learner` | Create learner profile | Onboarding |
| GET | `/api/learner/{id}` | Get learner profile + state | All screens |
| PUT | `/api/learner/{id}` | Update learner profile | Profile edit |
| GET | `/api/skill-gap/{learner_id}` | Run/get skill-gap analysis | Skill-Gap Analysis |
| GET | `/api/learning-path/{learner_id}` | Get/generate learning path | Learning Path, Dashboard |
| GET | `/api/module/{module_id}` | Get module details | Module Detail |
| GET | `/api/module/{module_id}/explanation` | Get recommendation explanation | Explanation Card |
| POST | `/api/module/{module_id}/action` | Submit action (start/complete/skip/struggling) | Module Detail |
| GET | `/api/assessment/{module_id}` | Get assessment questions | Assessment Quiz |
| POST | `/api/assessment/{module_id}/submit` | Submit answers, get score | Assessment Quiz |
| GET | `/api/dashboard/{learner_id}` | Get all dashboard data | Dashboard |
| POST | `/api/mentor/chat` | Send mentor message, get response | AI Mentor Chat |
| POST | `/api/path/recalculate/{learner_id}` | Force path recalculation | Adaptive flow |

---

*End of User Flow & Feature Specification*
