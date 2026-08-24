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
| **Screen Name** | Landing Page (`/`) |
| **Purpose** | First impression. Communicate core value proposition ("Your GPS for Learning"). Single CTA to start. Zero friction, no auth wall. |
| **Page & Layout Structure** | Full-viewport fluid layout (`w-full min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between`).<br>• *Header / Navigation:* Sticky top bar (`h-16 border-b border-slate-200 dark:border-slate-800 px-6 lg:px-12 flex items-center justify-between backdrop-blur-md`).<br>• *Hero Section:* Split layout (`min-h-[85vh] max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12`).<br>• *Trust Bar:* Minimal horizontal strip (`py-4 bg-slate-100 dark:bg-slate-800/50 border-y text-center`).<br>• *Feature Pillars:* 3-column responsive grid (`py-20 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8`).<br>• *How It Works Strip:* 3-step numbered horizontal process flow (`py-16 max-w-5xl mx-auto px-6 text-center`).<br>• *Footer:* 2-row footer with project credits and secondary CTA echo. |
| **Visual Hierarchy** | 1. Animated Hero Path Graphic (Tangled path straightening into a clean route).<br>2. Main H1 Headline: "Your GPS for Learning" with gradient text.<br>3. Primary CTA Button: High-contrast `indigo-600` solid button with elevation.<br>4. Supporting Sub-copy: 3-line value proposition resolving learner pain points.<br>5. 3 Feature Cards & Process Steps: Elevated white containers with category icons. |
| **Information Hierarchy** | 1. Eyebrow Category Label: "AI-Powered Learning Companion".<br>2. Main H1 Headline: "Your GPS for Learning".<br>3. Supporting Copy: "Tell PathFinder your goal and current skills. We'll build a personalized, prerequisite-aware roadmap — and recalculate it every time you learn, struggle, or grow."<br>4. Trust Strip: "✓ Personalized in < 60 seconds • ✓ No sign-up required • ✓ 0% Redundant Content".<br>5. 3 Differentiators: Starts Where You Are, Sequences What You Need, Recalculates As You Grow.<br>6. 3-Step Process: Step 1 (Goal) → Step 2 (Gaps) → Step 3 (Path). |
| **Components** | Brand logo, Hero headline & subtext, Animated SVG path visual, Primary "Start Learning" CTA, Trust bar, 3 Feature cards with category icons, 3-Step process strip, Footer with secondary CTA echo. |
| **Primary CTA** | **"Start Learning — It's Free →"** (`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-indigo-500/25 transition-all`). Sub-label: *"No account required"*. Navigates to `/onboarding`. |
| **Secondary Actions** | Header ghost CTA (`border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-5 py-2 rounded-lg text-sm`), Footer text link, Feature card hover inspection. |
| **Component Behavior & Interaction States** | • *Animated Path Visual:* 4-stage choreography (0–1.2s tangled curves draw → 1.2–1.8s chaotic lines fade and clean indigo path draws → 1.8–2.4s milestone nodes fade in → 2.4s+ settling pulse).<br>• *Button States:* Default solid indigo; Hover translates arrow +4px right (`translate-x-1`); Focus ring `ring-4 ring-indigo-500/30`; Active `scale-[0.98]`; Loading spinner + *"Opening PathFinder..."* during route push. |
| **Loading / Error / Empty States** | • *Loading:* Instant static HTML shell (<2s target); staggered fade-up entry animation.<br>• *Error:* Static SVG graphic of settled clean roadmap displays if animation script fails. |
| **Responsive Behavior** | • *Desktop (≥1024px):* Split 55% text / 45% animation layout; 3-column feature grid.<br>• *Tablet (768px–1023px):* Stacked hero with centered text; 2-column + 1 full-width card.<br>• *Mobile (<768px):* 100% width stacked layout; compact horizontal SVG animation (100% × 220px); primary CTA expands to full width (`w-full`). |
| **Accessibility Considerations** | Skip link `<a href="#main-content">Skip to main content</a>`; Semantic landmarks (`<header role="banner">`, `<main id="main-content">`, `<footer role="contentinfo">`); `<h1>` for headline, `<h2>` for features, `<h3>` for steps; `prefers-reduced-motion` renders settled path immediately without animation; all text contrasts ≥ 4.5:1. |
| **Data Displayed** | Static marketing and value proposition content. |
| **API/Backend Dependency** | None. |

---

### Screen 2 — Onboarding Chat

| Property | Detail |
|----------|--------|
| **Screen Name** | Onboarding Chat (`/onboarding`) |
| **Purpose** | Collect learner goal, skills, time budget, and preferences via natural language conversation. Extract structured profile using LLM JSON mode. |
| **Page & Layout Structure** | Centered chat application frame (`max-w-3xl mx-auto h-[100dvh] flex flex-col justify-between py-4 px-4`).<br>• *Header & Progression:* Fixed top bar with logo, Step Stepper (`Step 1 of 3: Learner Profile`), and `[↺ Start Over]` button.<br>• *Conversation Viewport:* Flex-1 scrollable vertical feed (`overflow-y-auto space-y-4 pr-2`) with system greeting, message history, progressive extraction pill tracker, and inline profile summary card.<br>• *Suggestion Chips Tray:* Horizontally scrollable strip above input bar.<br>• *Composer Bar & Switcher:* Sticky bottom container with auto-expanding textarea, send button, and tab switcher (`[💬 Chat] / [📄 Upload Resume/JD]`). |
| **Visual Hierarchy** | 1. Latest AI Assistant Prompt (Unread bubble with PathFinder GPS avatar).<br>2. Extracted Profile Summary Card (Elevated white container with green validation checkmarks).<br>3. Primary Confirmation CTA Button (`bg-indigo-600`).<br>4. Text Composer & Starter Suggestion Chips. |
| **Information Hierarchy** | 1. Step Progress Status (Step 1 of 3: Goal & Baseline Skills).<br>2. Assistant Guidance Prompts.<br>3. User Natural Language Response.<br>4. Progressive Captured Attributes Pills (e.g., `[🎯 Goal: ML Engineer ✓] [⏱️ 10 hrs/wk ✓]`).<br>5. Structured Profile Summary Card (Target Role, Current Skills with levels, Weekly Hours, Target Deadline, Format Preference).<br>6. Submission Confirmation Trigger. |
| **Components** | Chat message bubbles (AI left / User right), Typing indicator with multi-stage status text, Progressive extraction attribute pill tracker, Extracted Profile Summary Card with inline micro-editors, Starter suggestion chips, Textarea composer with auto-expand, Send button, "Upload Resume / Paste JD" tab switcher. |
| **Primary CTA** | **"Confirm & Analyze Skill Gaps →"** (`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors text-base`). Enabled once profile JSON is valid. Navigates to `/skills`. |
| **Secondary Actions** | Inline `[Edit]` buttons on profile card fields (opens micro-selectors: dropdown for role, slider for hours, tag input for skills), Tab switch to "Upload Resume / Paste JD" (Screen 11 fallback), Starter suggestion chips: `[ "I know Python, want to become an ML Engineer in 6 months" ]`, `[↺ Start Over]` button. |
| **Component Behavior & Interaction States** | • *Assistant Bubbles:* `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 max-w-[85%]`.<br>• *User Bubbles:* `bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] ml-auto`.<br>• *Typing Indicator:* 3 pulsating dots with multi-stage status text (0–1.5s: "Analyzing goal...", 1.5–3s: "Matching taxonomy...", 3s+: "Structuring profile...").<br>• *Composer:* Auto-expands from 1 line (44px) up to 4 lines (120px). |
| **Loading / Error / Empty States** | • *Loading:* Typing indicator active; composer placeholder reads *"PathFinder is structuring your profile..."*; input disabled during API call.<br>• *Error / Ambiguous Input:* AI replies contextually: *"Programming is broad! Would you like to focus on Web Development, ML Engineering, or Data Analytics?"* with 3 quick buttons.<br>• *Fallback (>3 turns):* Chat collapses into pre-filled manual fallback form. |
| **Responsive Behavior** | • *Mobile (<768px):* 100% viewport width and dynamic height (`h-[100dvh]`); header docks to top; composer bar pins directly above virtual keyboard; active message auto-scrolls into view on focus. |
| **Accessibility Considerations** | Chat feed has `role="log"` and `aria-live="polite"`; focus shifts to Profile Card on render; inline edit controls use standard `<select>`, `<input type="range">`, `<button>` with explicit `<label>` tags; `Enter` sends message, `Shift+Enter` inserts new line, `Escape` cancels inline edits. |
| **Data Displayed** | AI guidance messages, user conversation history, real-time extracted attributes, and editable structured profile JSON card. |
| **API/Backend Dependency** | `POST /api/onboarding/chat` — sends message, receives AI response + extracted profile JSON.<br>`POST /api/onboarding/upload` — sends PDF resume / JD text, receives extracted skills.<br>`POST /api/learner` — persists confirmed profile and initializes continuous learner state. |

---

### Screen 3 — Skill-Gap Analysis

| Property | Detail |
|----------|--------|
| **Screen Name** | Skill-Gap Analysis (`/skills`) |
| **Purpose** | Show the learner exactly what they know vs. what they need. Build trust and anticipation for the personalized roadmap using visual radar analytics and prioritized gap tables. |
| **Page & Layout Structure** | Max-width dashboard wrapper (`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8`).<br>• *Header:* Full-width target role banner with step breadcrumb (`Step 2 of 3: Skill-Gap Analysis`).<br>• *Content Grid (2-Column Desktop):* Left Column (50%): Interactive Radar / Spider Chart Card (`min-h-[500px] flex flex-col justify-between`). Right Column (50%): Prioritized Skill-Gap Data Table Card.<br>• *Sticky Action Dock:* Full-width bottom bar (`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t py-4 px-8 flex justify-between items-center`). |
| **Visual Hierarchy** | 1. Radar Chart Overlapping Polygons: High contrast between Current Skills (filled `indigo-600/25` with solid stroke) and Required Benchmark (dashed `emerald-500` outline).<br>2. Gap Severity Badges: Color-coded table badges (High [Amber/Red], Moderate [Yellow], Met [Emerald]).<br>3. Primary Action Button: Glowing "Generate My Learning Path" CTA in bottom dock. |
| **Information Hierarchy** | 1. Target Role Header: *"Your Skill-Gap Analysis for Machine Learning Engineer"*.<br>2. Chart Legend: Solid Indigo (Current Skills) vs. Dashed Green (Target Benchmark).<br>3. 5–8 Axis Radar Spider Chart (Proficiency scale 0 to 3: None, Beginner, Intermediate, Advanced).<br>4. Itemized Gap Table: Skill Name, Current Level, Required Level, Gap Delta, Severity Priority.<br>5. Summary Readout: *"3 Critical Gaps Detected (Est. Path Duration: 24 Weeks at 10 hrs/wk)"*. |
| **Components** | Two-layer Radar/Spider Chart (Current Skills vs. Required Benchmark), Chart Legend and decoding callout, Interactive chart tooltips with prerequisite links, Prioritized Gap Data Table with severity badges, Filter chips (`All`, `Critical`, `Moderate`, `Mastered`), Sticky action dock with primary CTA. |
| **Primary CTA** | **"Generate My Learning Path →"** (`bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all text-base flex items-center gap-2`). Sub-label: *"Sequences 5 gap modules • Prunes 2 known skills"*. Triggers Flow 7. |
| **Secondary Actions** | Hover/tap on Radar Chart vertex highlights corresponding table row; filter table chips by severity; tooltip inspection of individual skill definitions; "Edit Target Role" back link. |
| **Component Behavior & Interaction States** | • *Radar Chart:* Concentric rings represent Level 0 (None), Level 1 (Beginner), Level 2 (Intermediate), Level 3 (Advanced). Hovering any vertex expands point and displays tooltip with net level gap and prerequisite dependencies.<br>• *Table Rows:* Hovering tints background (`bg-slate-50 dark:bg-slate-700/50`) and highlights connecting radar axis. |
| **Loading / Error / Empty States** | • *Loading:* Pulsing circular skeleton in radar container and table placeholder rows with text: *"Comparing your skills against 1,200+ role benchmarks..."*.<br>• *Error (Rendering Failure):* Layout gracefully falls back to full-width enhanced Data Table with visual level bars without blocking path generation.<br>• *Empty State (Zero Gaps):* Status card: *"Benchmark Reached! You meet all requirements for this role. [Select Another Goal] or [Proceed to Path]"*. |
| **Responsive Behavior** | • *Mobile (<1024px):* Replaces vertical stack with Segmented Control Tab Toggle: `[ 📊 Radar View ]` / `[ 📋 Gap Table ]` to prevent excessive scrolling. Sticky action dock pins to bottom of mobile viewport. |
| **Accessibility Considerations** | Gap Table serves as semantic equivalent of graphic (`role="table"`, `<caption class="sr-only">Skill gap breakdown</caption>`); severity badges include text labels (`HIGH GAP`, `MODERATE`, `MET`) alongside color coding; `aria-hidden="true"` on Canvas/SVG chart; table markup fully navigable via keyboard. |
| **Data Displayed** | Skills with current proficiency levels (0–3), target proficiency levels (1–3), gap delta, topological priority weight, and severity classification. |
| **API/Backend Dependency** | `GET /api/skill-gap/{learner_id}` — returns calculated skill-gap results and prerequisite priorities. |

---

### Screen 4 — Learning Path / Roadmap

| Property | Detail |
|----------|--------|
| **Screen Name** | Learning Path (`/path`) |
| **Purpose** | Display the personalized, prerequisite-ordered roadmap with milestones, weekly schedules, and time allocations. Allow module exploration and track progress visually. |
| **Page & Layout Structure** | Max-width roadmap layout (`max-w-5xl mx-auto py-8 px-4 sm:px-6`).<br>• *Roadmap Header Banner:* Sticky summary card displaying Goal Name, Weekly Study Budget, Estimated Completion Date, and `[ Jump to Current Module ↓ ]` anchor.<br>• *Progress & Skipped Ribbon:* Overall progress percentage bar (e.g., 42%) and pill tags showing pruned competencies (e.g., `[✓ Skipped: Python Basics]`).<br>• *Subway Timeline Canvas:* Vertical rail positioned left/center with phase divider milestone cards and module nodes. |
| **Visual Hierarchy** | 1. Current Active Module Node: Elevated white card with `border-2 border-indigo-600`, glowing breathing halo, and "ACTIVE NOW" badge.<br>2. Milestone Phase Dividers: Full-width dark gradient banners (`from-slate-900 to-indigo-950 text-white`) marking major competency gates.<br>3. Completed Nodes: Dimmed surfaces with solid `emerald-500` checkmark rings.<br>4. Locked Future Nodes: Muted gray surfaces with padlock `🔒` icons. |
| **Information Hierarchy** | 1. Roadmap Goal & Pace Status: *"ML Engineer — 10 hrs/week • Target Completion: Feb 2027"*.<br>2. Skipped Skills Ribbon (Visual proof of non-redundancy).<br>3. Phase Gates (Phase 1: Data Fundamentals → Phase 2: Core ML → Phase 3: Deployment).<br>4. Weekly Schedule Blocks (e.g., *Week 1–2*, *Week 3–4*) with hour allocation readouts.<br>5. Module Cards: Title, Provider, Duration, Difficulty, Target Skill, and "Why This?" XAI score trigger.<br>6. Capstone Destination Node. |
| **Components** | Vertical multi-state subway rail, Module node cards with status indicators (*Not Started*, *Active*, *Done*, *Skipped*, *Refresher*), Weekly schedule block labels, Milestone Phase Gate cards with unlocked skill tags and Capstone badges, Floating "Jump to Current Module" button, Deadline overflow warning alert. |
| **Primary CTA** | **"Resume: [Active Module Title] →"** (`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-colors`). Pinned in sticky header banner. Opens Screen 5 (Module Detail). |
| **Secondary Actions** | Click any individual module card to open Slide-over Detail Panel; click "Why This?" pill button on any node to open Screen 6 (Explanation Modal); click floating `[ 🎯 Jump to Current Module ↓ ]` button to auto-scroll; milestone checkpoint inspection. |
| **Component Behavior & Interaction States** | • *Subway Rail Track:* Solid `emerald-500` stroke for completed past; gradient `emerald-500` → `indigo-600` terminating at active node; neutral dashed stroke (`slate-300 dark:slate-700`) for future locked nodes.<br>• *Module Cards:* Active card has `ring-2 ring-indigo-600` and breathing pulse; Completed has checkmark; Locked has padlock with tooltip *"Complete previous module to unlock"*; Hover applies subtle lift (`scale-[1.01]`, `shadow-md`). |
| **Loading / Error / Empty States** | • *Loading:* Shimmering vertical track with cascading skeleton cards.<br>• *Error:* Alert banner: *"Unable to sequence prerequisite graph. [Retry Calculation] or [Load Standard Sequence]"*.<br>• *Deadline Warning:* Amber alert if timeline exceeds goal: *"⚠️ At 10 hrs/wk, this path will take 2 extra weeks. [Adjust Hours] [Dismiss]"*. |
| **Responsive Behavior** | • *Mobile (<768px):* Vertical rail docks 16px from left edge. Completed and locked nodes render in **compact single-line collapsed accordions**; only Active Module card is expanded by default. Floating "Jump to Current" bar docks above bottom nav. |
| **Accessibility Considerations** | Semantic ordered list (`<ol>`, `<li>`); active module tagged with `aria-current="step"`; locked nodes marked with `aria-disabled="true"` with explanatory tooltip announced on focus; keyboard `Tab` cycles through interactive nodes; `Enter` opens detail drawer. |
| **Data Displayed** | Ordered module sequence, weekly schedule assignments, milestone phase gates, resource durations, difficulty ratings, format icons, and overall timeline completion date. |
| **API/Backend Dependency** | `GET /api/learning-path/{learner_id}` — returns ordered path with module nodes, milestone clusters, and estimated schedule. |

---

### Screen 5 — Module Detail Panel

| Property | Detail |
|----------|--------|
| **Screen Name** | Module Detail Panel (Slide-over Drawer / Bottom Sheet) |
| **Purpose** | Show granular information about a specific resource, explain why it was placed in the path, allow external study launch, and capture user feedback signals (*Start*, *Complete*, *Skip*, *Struggling*). |
| **Page & Layout Structure** | Slide-over right drawer on desktop (`fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col justify-between border-l border-slate-200 dark:border-slate-700`).<br>• *Backdrop:* Dimmed overlay (`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40`).<br>• *3-Zone Layout:* Sticky Header (provider icon, status pill, close button) → Scrollable Body (title, 4-tile metadata grid, description, learning checklist, inline XAI teaser, collapsible alternatives) → Sticky Footer (primary launch button and feedback action row). |
| **Visual Hierarchy** | 1. Primary Launch Button: Full-width "Start Course" CTA (`bg-indigo-600`).<br>2. Module Title & Provider Badge: Prominent H1 with Coursera/DeepLearning.AI verification tag.<br>3. Adaptive Feedback Controls: Distinct action row with color-coded buttons (*Complete* [Emerald], *Struggling* [Amber], *Skip* [Slate]).<br>4. XAI Teaser Card: Prominent match percentage card (Score: 94/100). |
| **Information Hierarchy** | 1. Module Status & Provider Header.<br>2. Title & Target Competency.<br>3. 4-Tile Metadata Grid: Duration (hours), Difficulty Level, Format (Video/Article/Project), Skill Area.<br>4. Short Description & "What You Will Learn" bullet checklist.<br>5. Inline "Why PathFinder Selected This" Summary Card.<br>6. Primary External Study Link.<br>7. Adaptive Action Buttons (Complete, Struggle, Skip).<br>8. Collapsible "See Alternatives" List (2–3 ranked replacement resources). |
| **Components** | Slide-over drawer container, Provider badge, 4-Tile metadata grid, Learning objectives checklist, Inline XAI teaser card, External launch button, Return-from-Study re-engagement banner, Feedback action buttons (*Complete*, *Struggling*, *Skip*), "Why This?" modal trigger, Collapsible alternative recommendations section. |
| **Primary CTA** | **"Start Course on [Provider] ↗"** (or `"Resume Course ↗"`). `w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all text-base flex items-center justify-center gap-2`. Sets status to `In Progress` and opens external URL in new browser tab. |
| **Secondary Actions** | **`[ ✓ Mark Complete ]`** (`emerald-600` button) → updates status, launches Screen 7 (Assessment Quiz); **`[ ⚠️ I'm Struggling ]`** (`amber-500` button) → triggers Screen 10 (Recalculating Route Overlay); **`[ ⊘ Skip Module ]`** (`slate-500` ghost button) → prompts confirmation, prunes module; **`[ Why This? ]`** → opens Screen 6 (Explanation Modal); **`[ See Alternatives ]`** → expands top 3 alternate courses with 1-click swap. |
| **Component Behavior & Interaction States** | • *Study Return Loop:* When user returns to PathFinder after studying, drawer surfaces a re-engagement banner: *"👋 Welcome back! Did you finish this course? [Yes, Mark Complete & Take Quiz →]"*.<br>• *Drawer Animation:* Slides in from right edge in 250ms via CSS transitions.<br>• *Feedback Tooltips:* Hovering "Struggling" explains *"Inserts an easier prerequisite refresher into your path."*. |
| **Loading / Error / Empty States** | • *Loading:* Shimmer skeletons for description and metadata tiles while loading.<br>• *Error (Broken URL):* Warning alert *"External resource unavailable"* with instant button to swap with top alternative. |
| **Responsive Behavior** | • *Mobile (<768px):* Drawer converts into a touch-friendly **Bottom Sheet** (`max-h-[88vh] rounded-t-3xl`) with native drag handle and pinned footer buttons. |
| **Accessibility Considerations** | Focus trap enabled while open; `Escape` key closes drawer and returns focus to triggering node; container marked with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="module-drawer-title"`; external link includes accessible warning `<span class="sr-only">(opens in a new tab)</span>`. |
| **Data Displayed** | Full resource metadata (title, provider, duration, difficulty, format, description, syllabus checklist), match score, and alternative recommendations. |
| **API/Backend Dependency** | `GET /api/module/{module_id}` — resource details.<br>`POST /api/module/{module_id}/action` — submits action (*start*, *complete*, *skip*, *struggling*).<br>`GET /api/module/{module_id}/explanation` — scoring breakdown. |

---

### Screen 6 — "Why This?" Explanation Card

| Property | Detail |
|----------|--------|
| **Screen Name** | "Why This?" Explanation Card (Modal Overlay) |
| **Purpose** | Show transparent, multi-factor scoring breakdown for a recommendation. Eliminate AI black-box mistrust by exposing deterministic scoring weights and providing an AI Mentor escalation bridge. |
| **Page & Layout Structure** | Centered modal dialog (`max-w-xl w-full bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 border border-slate-200 dark:border-slate-700`).<br>• *Backdrop:* Dark blurred overlay (`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40`).<br>• *3-Section Architecture:* Modal Header (title, target resource, close button) → Overall Match & Rationale (radial Donut Score Ring e.g. 94%, synthesized rationale quote) → 5-Factor Scoring Breakdown (vertical stack of 5 weighted progress bars) → Footer Action Row (Ask Mentor shortcut, Got It button). |
| **Visual Hierarchy** | 1. Overall Match Score Ring: Bold circular radial progress ring (e.g., `94% Match`).<br>2. Top Contributing Factor Bars: High-contrast factor progress bars with color-coded thresholds.<br>3. Natural Language Rationale Bubble: Italicized explanation card.<br>4. Footer Action Controls: Primary "Got It" button. |
| **Information Hierarchy** | 1. Header: *"Why PathFinder Chose This Resource"*.<br>2. Overall Match Score (e.g., 94/100).<br>3. Natural Language Summary (synthesized from deterministic scoring weights).<br>4. 5-Factor Scoring Breakdown:<br>   • *Skill-Gap Relevance (30% Weight)* — e.g., 95% (Emerald)<br>   • *Prerequisite Readiness (20% Weight)* — e.g., 100% (Emerald)<br>   • *Difficulty Fit (15% Weight)* — e.g., 88% (Indigo)<br>   • *Time Budget Fit (15% Weight)* — e.g., 92% (Indigo)<br>   • *Format Match (10% Weight)* — e.g., 80% (Indigo)<br>5. Escalation & Dismiss Triggers. |
| **Components** | Modal dialog container, Overall Match Score Donut Ring, Synthesized natural language explanation quote card, 5 Weighted Factor Progress Bars with labels and percentage badges, Dynamic color-coded thresholds, "Ask Mentor" shortcut link, Primary "Got It" button. |
| **Primary CTA** | **"Got It ✓"** (`bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors`). Dismisses modal. |
| **Secondary Actions** | Click `[ 💬 Ask Mentor to Explain More ]` text link (pre-populates context into Screen 9); click `[✕]` close button or press `Escape`. |
| **Component Behavior & Interaction States** | • *Factor Progress Bars:* Animate from 0% to target value over 600ms on mount.<br>• *Dynamic Thresholds:* $\ge 90\%$ (Emerald - Optimal), $75\%–89\%$ (Indigo - Good), $50\%–74\%$ (Amber - Compromise), $<50\%$ (Rose - Poor). |
| **Loading / Error / Empty States** | • *Loading:* Opens immediately with animated shimmering placeholder bars.<br>• *Error (Missing Scoring Logs):* Fallback card: *"Selected by topological sequence engine based on your goal: ML Engineer."* with functional `[ Got It ]` button. |
| **Responsive Behavior** | • *Mobile (<768px):* Modal adapts to 92% width; factor titles, weight badges, and percentage scores stack *above* the progress bar to prevent text truncation. |
| **Accessibility Considerations** | Standard `<dialog>` element with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="xai-modal-title"`; each factor bar uses accessible HTML5 `<progress>` with `aria-label="Skill-Gap Relevance: 95%"`; focus trapped inside dialog while active; `Escape` key dismisses modal. |
| **Data Displayed** | Overall match percentage, 5 deterministic scoring factor weights and scores, natural-language explanation summary. |
| **API/Backend Dependency** | `GET /api/module/{module_id}/explanation` — returns multi-factor scoring logs + LLM-synthesized summary. |

---

### Screen 7 — Assessment Quiz (Modal)

| Property | Detail |
|----------|--------|
| **Screen Name** | Quick Assessment Quiz (Modal) |
| **Purpose** | Test understanding after module completion to drive adaptive recalculation. Evaluate actual concept retention, validate mastery gains, and trigger route adaptations if gaps are detected. |
| **Page & Layout Structure** | Centered distraction-free modal dialog (`max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 border border-slate-200 dark:border-slate-700`).<br>• *Backdrop:* Strict backdrop lock (`bg-slate-900/70 backdrop-blur-md`) preventing accidental click-away dismissal.<br>• *3-Zone Layout:* Quiz Header (topic title, Step Counter `Question 2 of 4`, linear progress bar, exit button) → Active Question Container (prompt text, 4 selectable option cards) → Footer Controls (Skip link, primary Submit button). |
| **Visual Hierarchy** | 1. Active Question Text: Clear typography (`text-lg font-semibold text-slate-900 dark:text-white`).<br>2. Selectable Option Cards: Large interactive cards with single-select radio styling.<br>3. Primary Submit CTA: `bg-indigo-600` button in sticky footer.<br>4. Step Progress Bar: Linear indicator at top of modal. |
| **Information Hierarchy** | 1. Module Verification Context (e.g., *Concept Verification: Statistics Foundations*).<br>2. Question Progress Index (e.g., *Question 2 of 4 • 50%*).<br>3. Question Prompt Text.<br>4. 4 Multiple-Choice Options.<br>5. (Post-Quiz Results View): Final Score Percentage → Skill Mastery Level Delta → Roadmap Impact. |
| **Components** | Modal dialog container, Step counter, Linear progress bar, Question prompt, 4 Radio-style option cards, Primary "Submit / Next" CTA, "Skip Assessment" link, Post-quiz Results & Mastery Card with score percentage and mastery promotion toast. |
| **Primary CTA** | **During Quiz:** `Submit Answer →` / `Next Question →`<br>**On Results View:** `Continue Learning Path →` (`bg-indigo-600`, commits score, updates mastery on radar chart, and shifts focus to next NBA). |
| **Secondary Actions** | `[ Skip Assessment ]` text link (proceeds with standard completion without mastery bonus); radio option keyboard selection (`1–4` / `Arrow Keys`). |
| **Component Behavior & Interaction States** | • *Option Cards:* Default has subtle border; Selected has `border-2 border-indigo-600 bg-indigo-50/60 text-indigo-950`.<br>• *Score Branching:*<br>  - Score $\ge 80\%$: High mastery bump to Level 2 + fast-track alert.<br>  - Score $50\%–79\%$: Standard mastery promotion to Level 2 + unlocks next module.<br>  - Score $< 50\%$: Foundational gap detected + auto-launches Screen 10 (refresher insertion). |
| **Loading / Error / Empty States** | • *Loading:* Shimmer skeleton while fetching question set.<br>• *Empty State (Zero Questions):* Instant notification: *"No quiz configured for this module. Mastery automatically updated!"* → bypasses modal.<br>• *Error State:* Network failure shows *"Could not submit quiz results"* with preserved answers and `[ Retry ]` button. |
| **Responsive Behavior** | • *Mobile (<768px):* Large touch targets (min 52px height per option card); sticky bottom footer keeps submit button accessible above keyboard. |
| **Accessibility Considerations** | Questions and options wrapped inside semantic `<fieldset>` and `<legend>`; native `<input type="radio">` controls ensuring screen reader and keyboard accessibility; results card uses `aria-live="assertive"` to announce score and mastery level promotions. |
| **Data Displayed** | 3–5 multiple-choice questions, options, step index, final percentage score, and skill mastery level delta. |
| **API/Backend Dependency** | `GET /api/assessment/{module_id}` — returns generated or pre-built questions.<br>`POST /api/assessment/{module_id}/submit` — submits answers, returns score + mastery updates. |

---

### Screen 8 — Dashboard (Main Screen)

| Property | Detail |
|----------|--------|
| **Screen Name** | Dashboard (`/dashboard`) |
| **Purpose** | Single-screen overview of the entire learning journey. Default hub after onboarding. Eliminate choice paralysis by elevating the single Next Best Action (NBA) and visualizing real-time momentum. |
| **Page & Layout Structure** | Fluid responsive grid (`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6`).<br>• *Header:* Learner greeting bar with name, target role pill, and weekly hours tracker.<br>• *12-Column Bento-Box Architecture:*<br>  - Hero Row (Span 12, min-h-[160px]): Next Best Action (NBA) Card.<br>  - Widget Row 1: Overall Progress Circular Ring (Span 5) + Milestone Tracker Card (Span 7).<br>  - Widget Row 2: Skill Growth Mini Radar Card (Span 6) + Effort & Streak Card (Span 6).<br>  - Activity Row (Span 12): Recent Activity Feed.<br>• *Persistent Bottom-Right FAB:* Floating AI Mentor button (`fixed bottom-6 right-6 z-40`). |
| **Visual Hierarchy** | 1. Hero NBA Card: Full-width elevated card with dynamic gradient and high-contrast CTA button.<br>2. Circular Progress Ring: Large 140px Donut Ring showing overall completion percentage.<br>3. Mini Skill Growth Radar: Visual spider polygon showing capability expansion.<br>4. Milestone & Streak Cards: Clean white/slate containers with progress bars and badges. |
| **Information Hierarchy** | 1. Top Priority Action: Single Next Best Action (Module Name, One-line Reason, Duration, Direct CTA).<br>2. High-Level Progress: Total roadmap percentage, modules completed count, and active milestone phase.<br>3. Skill Mastery Growth: Baseline vs. current skill polygon.<br>4. Effort & Momentum: 4-day streak 🔥 and weekly hours logged vs. budget.<br>5. Activity Log: Last 3–5 completed/skipped actions. |
| **Components** | 12-Column Bento Grid, 4-State Dynamic NBA Hero Card, Circular Progress Donut Ring component, Milestone Phase checklist with lock states, Mini Skill Growth Radar Chart, Effort & Streak log, Recent Activity stream, Persistent AI Mentor FAB with proactive nudge toast. |
| **Primary CTA** | **"Start Now: [Active Module Title] →"** (Inside NBA Hero Card). `bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-base`. Opens active module in Screen 5. |
| **Secondary Actions** | Deep-link from Mini Radar to `/skills`; deep-link from Milestone card to `/path`; click AI Mentor FAB to launch assistant; inspect historical activity feed items. |
| **Component Behavior & Interaction States** | • *4-State Dynamic NBA Engine:*<br>  - State 1 (Standard): Indigo gradient (`from-indigo-600 to-indigo-800`), "Continue Module" CTA.<br>  - State 2 (Adaptive Recovery): Amber-indigo gradient (`from-amber-600 to-indigo-900`), "Start Refresher" CTA.<br>  - State 3 (Milestone Celebration): Emerald-teal gradient (`from-emerald-600 to-teal-900`), "Launch Next Phase" CTA.<br>  - State 4 (Re-entry / Inactive): Slate-indigo gradient (`from-slate-800 to-indigo-900`), "Pick Up Where You Left Off" CTA.<br>• *FAB Proactive Nudge:* Floating speech bubble expands above FAB when system events occur (*"Great job on Statistics! You're 1 week ahead! 💪"*), auto-collapsing to unread badge counter. |
| **Loading / Error / Empty States** | • *Loading:* Bento skeleton layout with shimmering placeholders across all 5 widgets.<br>• *Day-1 Empty State:* NBA reads *"Welcome Priya! Start Module #1: Statistics Foundations"*; Progress ring at 0%; Activity reads *"Learning path initialized."*.<br>• *Localized Widget Error:* If one widget fails to load, only that card displays a retry state while NBA card remains fully operational. |
| **Responsive Behavior** | • *Mobile (<768px):* Bento grid stacks linearly in strict decision-making order: **NBA Hero → Progress & Streak → Milestone Card → Mini Radar → Recent Activity**. |
| **Accessibility Considerations** | Semantic landmarks: `<main role="main">`, `<aside role="complementary">` for activity feed; heading hierarchy: `<h1>Dashboard</h1>`, `<h2>Next Best Action</h2>`, `<h2>Progress Overview</h2>`; contrast ratio on NBA text strictly $\ge 4.5:1$ on all 4 gradient states. |
| **Data Displayed** | Next Best Action recommendation, completion percentage, milestone lock status, skill growth polygon, weekly time investment, last 3–5 logged activities. |
| **API/Backend Dependency** | `GET /api/dashboard/{learner_id}` — returns composite dashboard payload (NBA, progress, path summary, mastery levels, milestones, activity stream). |

---

### Screen 9 — AI Mentor Chat Panel

| Property | Detail |
|----------|--------|
| **Screen Name** | AI Mentor Chat Panel (Popover / Bottom Sheet) |
| **Purpose** | Contextual AI learning assistant that understands the learner's full state (active module, scores, gaps, path) and executes scoped actions (explaining concepts, skipping modules, recalculating paths) with user confirmation. |
| **Page & Layout Structure** | Floating slide-over popover anchored bottom-right (`fixed bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col justify-between border border-slate-200 dark:border-slate-700 overflow-hidden`).<br>• *4-Zone Layout:* Header & Context Tag (mentor avatar, title, live context memory pill `[ 📌 Context: Scikit-Learn Module ]`, window controls) → Chat Stream (Markdown bubbles, Action Confirmation Cards) → Dynamic Suggestion Chips Tray → Composer Area (textarea, send button). |
| **Visual Hierarchy** | 1. Live Context Memory Badge: Prominent pill tag in header showing active module.<br>2. Action Confirmation Cards: High-contrast embedded cards for state mutations.<br>3. Assistant Message Bubbles: Elevated slate bubbles with rich text formatting.<br>4. Dynamic Suggestion Chips: Tappable quick-prompt pills. |
| **Information Hierarchy** | 1. Assistant Greeting Grounded in Live Progress Data.<br>2. Contextual Responses (Explaining prerequisites, recommending next steps).<br>3. Transparent Agent Tool Action Bubbles (e.g., `⚙️ Checking your DAG...`).<br>4. Interactive Action Confirmation Prompts.<br>5. Quick-Reply Suggestions. |
| **Components** | Floating popover container, Header with active context badge, Scrollable chat message stream with Markdown and code rendering, Agent tool status bubbles, Interactive Action Confirmation Cards, Dynamic suggestion chips tray, Auto-growing textarea composer, Send button. |
| **Primary CTA** | **"Send Message"** (Circular arrow button / Enter key). `bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors`. Submits query to LangGraph agent. |
| **Secondary Actions** | Click dynamic suggestion chips: `[ "Why this module?" ]` · `[ "I need a refresher" ]` · `[ "How much time left?" ]`; click `[ Confirm & Remove Module ]` or `[ Keep in My Path ]` on action confirmation cards; minimize popover. |
| **Component Behavior & Interaction States** | • *Action Confirmation Cards:* State-changing tool calls (e.g., `skip_module()`, `trigger_recalculation()`) render an interactive card in the feed requiring an explicit button click before executing.<br>• *Context Synchronization:* Context pill tag updates dynamically when user navigates between screens in background. |
| **Loading / Error / Empty States** | • *Loading / Thinking:* 3-dot typing bubble with dynamic subtext (*"Analyzing prerequisite graph..."*).<br>• *Error / Timeout:* Fallback bubble: *"I'm having a brief connection issue. Your current Next Best Action is Scikit-Learn. [Retry Question]"*. |
| **Responsive Behavior** | • *Mobile (<768px):* Expands to a **92vh Touch Bottom Sheet**; automatically scrolls active message upward when virtual keyboard opens. |
| **Accessibility Considerations** | Chat stream tagged with `role="log"` and `aria-live="polite"`; focus shifts automatically to input field upon opening; `Escape` key closes panel and restores focus to FAB; confirmation cards include explicit focus trap to prevent accidental execution. |
| **Data Displayed** | Conversation history, active context memory pill, tool execution status traces, interactive action confirmation prompts. |
| **API/Backend Dependency** | `POST /api/mentor/chat` — sends message + learner context (active module, scores, gaps, path), returns LangGraph agent response and tool traces. |

---

### Screen 10 — Recalculation Overlay

| Property | Detail |
|----------|--------|
| **Screen Name** | "Recalculating Route..." Overlay |
| **Purpose** | The "wow" moment — visually shows the AI adapting the path in real-time. Reinforces the "GPS for Learning" metaphor when a learner struggles, skips, fails a quiz, or changes goals. |
| **Page & Layout Structure** | Full-screen backdrop overlay (`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4`).<br>• *Elevated Adaptation Card:* Centered dark container (`max-w-lg w-full bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl text-center space-y-6`).<br>• *Visual Display:* Pulsing GPS radar animation and shifting route nodes graphic.<br>• *Route Diff Changelog Card:* Elevated inner box (`bg-slate-800/90 rounded-2xl p-4 text-left space-y-2 border border-slate-700`).<br>• *Footer Actions:* Primary "View Updated Roadmap" CTA with circular 3-second auto-dismiss countdown timer. |
| **Visual Hierarchy** | 1. Animated GPS Radar Graphic: Glowing ripple wave animation.<br>2. Headline Banner: Bold *"🗺️ Recalculating Route..."*.<br>3. Semantic Diff Changelog: Color-coded bullet points (`+ Added` in green, `➔ Shifted` in amber).<br>4. Auto-Dismiss Progress Ring: Circular countdown timer. |
| **Information Hierarchy** | 1. Recalculation Trigger Acknowledgment (e.g., *"We noticed you struggled with Statistics Foundations"*).<br>2. Dynamic Route Diff Changelog:<br>   • `🟢 + ADDED: Probability Refresher (2 Hours)` (Inserted before Statistics)<br>   • `🟡 ➔ SHIFTED: Statistics Foundations moved to Week 3` (Timeline +1 Week)<br>   • `🔵 🎯 NBA UPDATED: Start Probability Refresher`<br>3. Auto-Dismiss Timer / Continue Trigger. |
| **Components** | Full-screen frosted backdrop, Elevated adaptation card, Animated GPS radar ripples, Shifting route nodes graphic, Semantic Route Diff Changelog Card, Circular 3-second auto-dismiss timer, "Pause & Read Changes" control. |
| **Primary CTA** | **"View Updated Roadmap →"** (or auto-dismisses in 3s ⭕). `w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-colors`. Clears overlay and transitions to updated path. |
| **Secondary Actions** | Click `[ Pause & Read Changes ]` or hover mouse over diff card to pause auto-dismiss timer; tap backdrop or press `Escape` to dismiss immediately. |
| **Component Behavior & Interaction States** | • *5-Stage Animation Timeline:* 0–0.6s radar waves expand → 0.6–1.4s route nodes visually shift and green refresher node drops in → 1.4–2.4s diff changelog card fades in with staggered bullets → 2.4–3.0s countdown ring completes revolution → 3.0s overlay fades out; newly inserted node displays **accent glow pulse** (`ring-4 ring-amber-500/40`) for 3 seconds on Dashboard. |
| **Loading / Error / Empty States** | • *Loading:* The overlay itself is an active animated loading transition.<br>• *Error (Recalculation Failure):* Displays *"Route unchanged. Retaining current sequence."* and auto-dismisses after 2s. |
| **Responsive Behavior** | • *Mobile (<768px):* Dialog takes 92% of viewport; tapping anywhere on screen clears overlay immediately. |
| **Accessibility Considerations** | `role="status"` with `aria-live="assertive"`; screen reader speech script: *"Learning route recalculated. Probability and Distributions Refresher module has been added before Statistics Foundations. Target completion adjusted by one week."*; `prefers-reduced-motion` disables ripple animations and node movement, displaying static checkmark with diff list directly. |
| **Data Displayed** | Animated GPS graphic, route recalculation status, itemized diff changelog (added/removed/shifted modules), updated completion date, and new Next Best Action. |
| **API/Backend Dependency** | Triggered by `POST /api/module/{id}/action` (struggle/skip), `POST /api/assessment/{id}/submit` (score <50%), or `POST /api/path/recalculate/{learner_id}` → returns updated path JSON + diff list. |

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
