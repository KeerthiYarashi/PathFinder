# PathFinder — Frontend/UI Specification & Architecture

---

## 1. UX Principles & Design System

### 1.1 Core UX Principles
1.  **Eliminate Choice Paralysis:** The user should never have to ask "What do I do next?". The UI must always elevate the single Next Best Action (NBA).
2.  **Explainability builds Trust:** AI recommendations can feel like a black box. Every recommendation must have a clear, data-driven "Why This?" explanation.
3.  **GPS for Learning (Adaptation):** When a user struggles or skips, the UI should visually communicate that the system is "Recalculating the Route", reinforcing that the path is dynamic, not static.
4.  **Distinctive AI, not a Chat Wrapper:** The UI should look like a premium learning platform, not a generic ChatGPT clone. Chat is used for input (Onboarding) and context (AI Mentor), but the core experience relies on rich visual components (Timelines, Radar Charts, Progress Bars).

### 1.2 Design System Tokens (Tailwind CSS)
*   **Primary Action Color:** Electric Indigo (`indigo-600`) — used for the Next Best Action, primary buttons, and path progress.
*   **Secondary/Accent Color:** Emerald Green (`emerald-500`) — used for completions, unlocked milestones, and positive feedback.
*   **Warning/Struggle Color:** Amber (`amber-500`) — used for "Struggling" states, warnings, and missing prerequisites.
*   **Background:** Off-white/slate (`slate-50`) for light mode, deep navy (`slate-900`) for dark mode.
*   **Card Backgrounds:** Pure white (`white`) or elevated dark (`slate-800`) with subtle drop shadows (`shadow-sm` default, `shadow-md` on hover).
*   **Typography:** 'Inter' or 'Plus Jakarta Sans' for clean, highly legible, student-friendly sans-serif reading.

---

## 2. Screen Specifications

### 1. Landing Page
*   **Layout:** Full-width hero section, followed by 3-column feature highlights, and a footer.
*   **Components:** Hero Headline, Subheadline, Primary CTA Button ("Start Learning").
*   **Visuals:** An animated SVG graphic showing a messy, tangled path transforming into a straight, clear roadmap (communicating the "GPS" metaphor).
*   **Mobile:** Stacked layout, centered text.

### 2. Onboarding (Chat-Based) & 4. Goal Setup
*   **Layout:** Centered chat interface taking up 60% width on desktop. Not a full-screen chat; contained within a clean app frame.
*   **Components:** Message bubbles (AI left, User right), Text Input + Send Button, "Upload Resume/JD" toggle tab.
*   **Loading States:** Pulsing typing indicator for AI.
*   **Error States:** "I missed that. Could you try rephrasing?"
*   **Mobile:** Full-screen chat layout (similar to iMessage).

### 3. Learner Profile
*   **Layout:** Single column, card-based overlay or dedicated settings view.
*   **Components:** Editable fields for Goal, Target Role, Time Budget (slider component), Preferred Format (pill toggles).
*   **Empty States:** N/A (cannot reach this screen without completing onboarding).

### 5. Skill Assessment (Dynamic Quiz)
*   **Layout:** Modal overlay or focused distraction-free view.
*   **Components:** Progress bar (e.g., Question 2 of 3), Large Question Text, Radio Button options, "Submit" button.
*   **Loading States:** Skeleton loaders while the LLM generates questions.
*   **Success State:** Confetti animation + "Mastery Updated!" toast.

### 6. Skill-Gap Analysis
*   **Layout:** 2-column layout on desktop. Left: Visuals. Right: Details.
*   **Charts:** Large **Radar Chart** (Spider chart) overlapping Current Skills vs. Required Skills.
*   **Components:** Gap Table listing specific skills and gap severity (High/Medium/Low badges). Large "Generate Personalized Path" button.
*   **Mobile:** Radar chart stacks on top of the Gap Table.

### 7. Personalized Learning Path (The Core Screen)
*   **Layout:** A vertical, scrolling timeline (like a subway map).
*   **Visual Flow (Top to Bottom):**
    1.  **Goal Header:** "Path to ML Engineer"
    2.  **Current Skills:** Pill tags showing what was skipped.
    3.  **The Timeline:** Nodes connected by a vertical line.
    4.  **Nodes:** Modules, Projects, Assessments.
    5.  **Milestones:** Distinctive horizontal dividers breaking the timeline into phases.
    6.  **Goal Completion:** A final, locked trophy/badge at the bottom.
*   **Cards:** Module Cards on the timeline.
    *   *Not Started:* Grayed out.
    *   *Active:* Highlighted with Primary Color border.
    *   *Completed:* Green checkmark.
*   **Navigation:** Click a card to open the **Course/Resource Details** side panel.
*   **Loading State:** "Recalculating Route..." overlay (pulsing animation on top of the timeline).

### 8. Course/Resource Recommendations (Details Panel)
*   **Layout:** Slide-over panel (right side) or bottom sheet (mobile).
*   **Components:** 
    *   Title, Provider, External Link Button ("Start Course").
    *   Metadata badges (Duration, Difficulty, Format).
    *   Action Buttons: "Mark Complete", "Skip (Too Easy)", "I'm Struggling".
    *   "Why This?" button linking to the explanation.
*   **Error States:** "Resource link unavailable."

### 9. Project Recommendations
*   **Layout:** Distinctive styling within the Timeline (e.g., wider card, star icon) or a dedicated tab.
*   **Components:** Project Brief card, "Skills Applied" pill tags, "Upload/Link Deliverable" button.

### 10. Progress Dashboard
*   **Layout:** Grid-based (Bento-box style) layout.
*   **Components:**
    *   **Hero (Top Full Width):** Next Best Action Card (Large typography, primary CTA).
    *   **Widget 1 (Top Left):** Overall Progress (Circular progress ring + percentage).
    *   **Widget 2 (Top Right):** Current Milestone tracking.
    *   **Widget 3 (Bottom Left):** Skill-Gap Reduction (Mini radar chart or bar chart showing growth).
    *   **Widget 4 (Bottom Right):** Learning Streak / Time spent this week.
    *   **Recent Activity:** A small feed of completed/skipped items.
*   **Empty States:** "You haven't started any modules yet. Click your Next Best Action!"

### 11. Milestones
*   **Layout:** Horizontal scrolling carousel or a dedicated list view.
*   **Cards:** Milestone Cards.
    *   *Locked:* Gray, lock icon, lists required skills.
    *   *Unlocked/Completed:* Vibrant, glowing border, celebratory icon.

### 12. AI Mentor
*   **Layout:** Floating Action Button (FAB) in the bottom right corner opening a chat popover.
*   **Components:** Context-aware header (e.g., "Ask about: Pandas Module"), message feed, suggested quick-reply chips ("Why am I learning this?", "I need a refresher").
*   **Mobile:** Opens as a full-screen bottom sheet.

### 13. Recommendation Explanation ("Why This?")
*   **Layout:** Modal dialog triggered from a resource card.
*   **Components:**
    *   A natural language summary at the top.
    *   **Scoring Breakdown:** Horizontal progress bars showing factor weights (Semantic Fit: 90%, Time Fit: 100%, Difficulty Fit: 80%).
    *   "Ask Mentor for more details" button.

### 14. Settings
*   **Layout:** Standard list layout.
*   **Components:** Toggles for Dark/Light mode, link to edit Learner Profile, "Reset Path" danger button.

---

## 3. Page & Component Hierarchy

### 3.1 Page Hierarchy (React Router / Next.js App Router)
```text
/ (Landing Page)
├── /onboarding
│   └── /onboarding/upload (Resume/JD Stretch Goal)
├── /dashboard (Main Hub)
├── /path (Timeline View)
├── /skills (Gap Analysis View)
└── /settings
```

### 3.2 Component Hierarchy (Key Areas)
```text
DashboardPage
├── NBACard (Next Best Action)
├── ProgressWidget
│   └── CircularProgressBar
├── SkillGrowthWidget
│   └── RadarChart
├── MilestoneWidget
└── AI_Mentor_FAB
    └── ChatPopover

PathPage
├── PathHeader (Goal & Stats)
├── Timeline
│   ├── MilestoneDivider
│   └── ModuleCard
│       ├── StatusIcon
│       ├── MetadataBadges
│       └── "Why This?" Button
└── ResourceDetailPanel (Slide-over)
    ├── ExplanationModal
    └── ActionButtons (Start, Complete, Skip, Struggle)
```

---

## 4. Recommended Charts & Libraries

To build this quickly and professionally in a React/Next.js environment:

| Requirement | Recommended Library | Why |
| :--- | :--- | :--- |
| **Radar Chart (Skill Gaps)** | `Recharts` (`<RadarChart>`) | Excellent React integration, highly customizable, responsive. |
| **Circular Progress (Dashboard)** | `react-circular-progressbar` | Extremely lightweight, easy to animate. |
| **Timeline (Learning Path)** | Custom Tailwind CSS | Timelines are often overcomplicated by libraries. A custom flex-col with border-left is faster and matches the design system perfectly. |
| **Animations / "Recalculating"** | `Framer Motion` | Industry standard for React animations. Essential for the "wow" moment when the path shifts. |
| **State Management** | `Zustand` | Perfect for holding the Learner State, Path State, and Chat History across the dashboard without Redux boilerplate. |
| **Component Primitives** | `Radix UI` or `shadcn/ui` | Headless accessible components for Modals, Slide-overs, and Dropdowns. Prevents wasting time on basic UI logic. |

---

## 5. Frontend Implementation Order

To ensure the frontend doesn't block the backend (and vice versa), implement in this order:

### Phase 1: The Shell & Routing (Day 1)
1.  Initialize Next.js + Tailwind + shadcn/ui.
2.  Set up the page routing structure (`/`, `/onboarding`, `/dashboard`, `/path`).
3.  Build the Navigation bar and responsive layout shell.

### Phase 2: Onboarding & Visuals (Day 1-2)
4.  Build the **Onboarding Chat Interface**. (Mock the backend LLM response initially to unblock UI work).
5.  Build the **Skill-Gap Analysis Page** using `Recharts` for the Radar Chart.

### Phase 3: The Core Value Proposition (Day 2)
6.  Build the **Timeline Component** (The Learning Path). Ensure it handles different module states (locked, active, done).
7.  Build the **Resource Detail Slide-over Panel**.
8.  Implement the **"Why This?" Explanation Modal** with the factor scoring bars.

### Phase 4: The Dashboard & Interactions (Day 2-3)
9.  Build the **Dashboard Bento-box Layout** (NBA Card, Progress Rings).
10. Wire up the **Action Buttons** (Complete, Skip, Struggling) to the backend API.
11. Implement the **"Recalculating Route..." Animation** using Framer Motion (triggered when "Struggling" or "Skip" is clicked).

### Phase 5: Polish & AI Integration (Day 3)
12. Integrate the **AI Mentor FAB and Chat Popover**.
13. Apply final design system polish (Dark mode support, hover states, loading skeletons).
14. End-to-end testing of the UX flows.
