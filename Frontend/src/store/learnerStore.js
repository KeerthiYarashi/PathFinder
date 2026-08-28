import { create } from 'zustand'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock Fallbacks for Standalone Frontend Execution
const MOCK_GAPS = [
  { skill_id: "ml_basics", skill_name: "Machine Learning Fundamentals", current_level: 0, target_level: 3, gap_size: 3, priority: "high" },
  { skill_id: "python_pandas", skill_name: "Pandas Data Manipulation", current_level: 1, target_level: 3, gap_size: 2, priority: "medium" },
  { skill_id: "dl_neural_networks", skill_name: "Deep Learning & Neural Nets", current_level: 0, target_level: 2, gap_size: 2, priority: "medium" },
  { skill_id: "math_probability", skill_name: "Probability Theory", current_level: 1, target_level: 2, gap_size: 1, priority: "low" }
]

const MOCK_TIMELINE = {
  learner_id: "demo-learner-id",
  target_role: "Machine Learning Engineer",
  total_weeks: 4,
  weeks: [
    {
      week_number: 1,
      total_hours: 4.0,
      modules: [
        {
          skill_id: "math_probability",
          skill_name: "Probability Theory",
          estimated_hours: 2.0,
          status: "completed", // "completed", "active", "locked"
          resource: {
            id: "res_prob_1",
            title: "Khan Academy - Probability & Combinatorics Essentials",
            time_estimate_hours: 2.0,
            difficulty: "normal",
            url: "https://www.khanacademy.org",
            provider: "Khan Academy",
            format: "video",
            explanation: "Builds the mathematical foundational logic required to understand statistical estimators and machine learning cost functions."
          }
        },
        {
          skill_id: "python_pandas",
          skill_name: "Pandas Data Manipulation",
          estimated_hours: 2.0,
          status: "active",
          resource: {
            id: "res_pandas_1",
            title: "Kaggle - Practical Data Manipulation with Pandas",
            time_estimate_hours: 2.0,
            difficulty: "normal",
            url: "https://www.kaggle.com/learn/pandas",
            provider: "Kaggle",
            format: "article",
            explanation: "Pandas is the industry standard for cleaning, slicing, and structuring tabular datasets before feeding them to models."
          }
        }
      ]
    },
    {
      week_number: 2,
      total_hours: 3.0,
      modules: [
        {
          skill_id: "ml_basics",
          skill_name: "Machine Learning Fundamentals",
          estimated_hours: 3.0,
          status: "locked",
          resource: {
            id: "res_ml_1",
            title: "Coursera - Supervised Machine Learning (Andrew Ng)",
            time_estimate_hours: 3.0,
            difficulty: "normal",
            url: "https://www.coursera.org",
            provider: "DeepLearning.AI",
            format: "mixed",
            explanation: "Core concepts of regression, classification, cost functions, and gradient descent. Essential prerequisite for advanced neural networks."
          }
        }
      ]
    },
    {
      week_number: 3,
      total_hours: 2.0,
      modules: [
        {
          skill_id: "dl_neural_networks",
          skill_name: "Deep Learning & Neural Nets",
          estimated_hours: 2.0,
          status: "locked",
          resource: {
            id: "res_dl_1",
            title: "3Blue1Brown - Visualizing Deep Learning Foundations",
            time_estimate_hours: 2.0,
            difficulty: "normal",
            url: "https://www.youtube.com",
            provider: "3Blue1Brown",
            format: "video",
            explanation: "Provides the critical geometric and algebraic intuition behind backpropagation, weights, activation functions, and training dynamics."
          }
        }
      ]
    },
    {
      week_number: 4,
      total_hours: 5.0,
      modules: [
        {
          skill_id: "capstone_project",
          skill_name: "Capstone: Predictive Model Deployment",
          estimated_hours: 5.0,
          status: "locked",
          resource: {
            id: "res_capstone_1",
            title: "PathFinder Capstone Project: End-to-End Prediction Pipeline",
            time_estimate_hours: 5.0,
            difficulty: "high",
            url: "https://github.com",
            provider: "Self-Guided Capstone",
            format: "project",
            explanation: "Integrates everything you learned about data manipulation, cost function optimization, neural network selection, and final container deployment."
          }
        }
      ]
    }
  ]
}

export const useLearnerStore = create((set, get) => ({
  learnerId: localStorage.getItem('learner_id') || null,
  learnerProfile: (() => {
    try {
      const p = localStorage.getItem('learner_profile')
      return p ? JSON.parse(p) : null
    } catch {
      return null
    }
  })(),
  targetRole: "Machine Learning Engineer",
  gaps: [],
  timeline: null,
  
  theme: localStorage.getItem('theme') || 'dark',
  isLoading: false,
  isRecalculating: false,
  error: null,

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', nextTheme)
    set({ theme: nextTheme })
  },

  setLearnerId: (id) => {
    localStorage.setItem('learner_id', id)
    set({ learnerId: id })
  },

  updateSkillLevel: (skillId) => {
    const currentGaps = get().gaps
    const updatedGaps = currentGaps.map(g => {
      if (g.skill_id === skillId) {
        const nextLevel = Math.min(g.target_level, g.current_level + 1)
        const gapSize = Math.max(0, g.target_level - nextLevel)
        return {
          ...g,
          current_level: nextLevel,
          gap_size: gapSize,
          priority: gapSize === 0 ? 'none' : gapSize >= 3 ? 'high' : gapSize >= 2 ? 'medium' : 'low'
        }
      }
      return g
    })
    set({ gaps: updatedGaps })
  },

  // Step 4: Create a profile on onboarding completion
  createProfile: async (name, timeBudget, format, difficulty) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/learners/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          time_budget_hours: Number(timeBudget),
          preferred_format: format,
          difficulty_tolerance: difficulty
        })
      })
      if (!response.ok) throw new Error('Failed to create learner profile')
      const data = await response.json()
      
      localStorage.setItem('learner_id', data.id)
      set({ 
        learnerId: data.id, 
        learnerProfile: data,
        isLoading: false 
      })
      return data.id
    } catch (err) {
      console.warn('Backend offline, using local demo profile.', err)
      const fakeId = 'demo-learner-uuid-' + Math.random().toString(36).substring(2, 7)
      localStorage.setItem('learner_id', fakeId)
      set({
        learnerId: fakeId,
        learnerProfile: {
          name,
          time_budget_hours: Number(timeBudget),
          preferred_format: format,
          difficulty_tolerance: difficulty,
          id: fakeId,
          created_at: new Date().toISOString()
        },
        isLoading: false
      })
      return fakeId
    }
  },

  // Step 5: Fetch Gaps from API
  fetchGaps: async () => {
    const { learnerId } = get()
    if (!learnerId) return
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/paths/gaps/${learnerId}`)
      if (!response.ok) throw new Error('Failed to fetch skill gaps')
      const data = await response.json()
      
      // Update target role if returned
      const cleanRole = data.target_role === 'role_ml_engineer' ? 'Machine Learning Engineer' : 'Data Analyst'
      set({ 
        gaps: data.gaps, 
        targetRole: cleanRole,
        isLoading: false 
      })
    } catch (err) {
      console.warn('Backend offline, using fallback skill gap data.')
      set({ 
        gaps: MOCK_GAPS,
        targetRole: "Machine Learning Engineer",
        isLoading: false 
      })
    }
  },

  // Step 6: Generate Path Timeline
  generateTimeline: async () => {
    const { learnerId } = get()
    if (!learnerId) return
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE}/paths/generate/${learnerId}`)
      if (!response.ok) throw new Error('Failed to generate learning path')
      const data = await response.json()
      
      // Inject fallback local status values if they don't exist
      const enrichedWeeks = data.weeks.map((week, wIdx) => ({
        ...week,
        modules: week.modules.map((mod, mIdx) => {
          let status = 'locked'
          if (wIdx === 0 && mIdx === 0) status = 'active'
          else if (wIdx === 0 && mIdx > 0) status = 'locked'
          
          return {
            ...mod,
            status,
            resource: {
              ...mod.resource,
              provider: mod.resource.provider || 'Coursera',
              format: mod.resource.format || 'video',
              explanation: mod.resource.explanation || `This course is targeted to bridge your ${mod.skill_name} gap.`
            }
          }
        })
      }))

      set({ 
        timeline: { ...data, weeks: enrichedWeeks },
        isLoading: false 
      })
    } catch (err) {
      console.warn('Backend offline, using fallback timeline.')
      // Fetch current profile to match parameters
      set({ 
        timeline: MOCK_TIMELINE,
        isLoading: false 
      })
    }
  },

  // Step 7: Log action complete, skip, struggling
  logModuleAction: async (skillId, actionType) => {
    const { learnerId, generateTimeline, timeline } = get()
    if (!learnerId) return
    set({ isRecalculating: true })
    
    try {
      const response = await fetch(`${API_BASE}/modules/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId,
          skill_id: skillId,
          action_type: actionType
        })
      })
      if (!response.ok) throw new Error('Failed to submit action')
      const data = await response.json()

      // If backend reports recalculation is needed, re-fetch timeline
      if (data.requires_recalculation) {
        await generateTimeline()
      } else {
        // Handle skip or local update without complete re-fetch
        if (timeline) {
          const updatedWeeks = timeline.weeks.map(week => ({
            ...week,
            modules: week.modules.map(mod => {
              if (mod.skill_id === skillId) {
                return { ...mod, status: actionType === 'complete' ? 'completed' : 'locked' }
              }
              return mod
            })
          }))
          set({ timeline: { ...timeline, weeks: updatedWeeks } })
        }
      }
    } catch (err) {
      console.warn('Backend offline, running local mock state update.')
      // Mock local update logic
      if (timeline) {
        let updatedWeeks = [...timeline.weeks]
        
        if (actionType === 'complete') {
          // Mark completed, make next module active
          let marked = false
          updatedWeeks = timeline.weeks.map(week => ({
            ...week,
            modules: week.modules.map(mod => {
              if (mod.skill_id === skillId) {
                return { ...mod, status: 'completed' }
              }
              if (!marked && mod.status === 'locked') {
                marked = true
                return { ...mod, status: 'active' }
              }
              return mod
            })
          }))
        } else if (actionType === 'struggling') {
          // Simulate recalculation: downgrade prerequisites. In mock, we inject a mock refresher module
          const refresherSkillId = `${skillId}_refresher`
          const alreadyHasRefresher = timeline.weeks.some(w => w.modules.some(m => m.skill_id === refresherSkillId))
          
          if (!alreadyHasRefresher) {
            // Inject a refresher module inside the active week
            updatedWeeks = timeline.weeks.map((week, idx) => {
              const hasActive = week.modules.some(m => m.skill_id === skillId)
              if (hasActive) {
                return {
                  ...week,
                  modules: [
                    {
                      skill_id: refresherSkillId,
                      skill_name: `Refresher: Fundamentals of ${timeline.weeks.find(w => w.modules.some(m => m.skill_id === skillId)).modules.find(m => m.skill_id === skillId).skill_name}`,
                      estimated_hours: 1.0,
                      status: 'active',
                      resource: {
                        id: `res_ref_${skillId}`,
                        title: `Quick Diagnostics: ${timeline.weeks.find(w => w.modules.some(m => m.skill_id === skillId)).modules.find(m => m.skill_id === skillId).skill_name} Refresher`,
                        time_estimate_hours: 1.0,
                        difficulty: 'low',
                        url: 'https://www.wikipedia.org',
                        provider: 'PathFinder AI',
                        format: 'article',
                        explanation: "Since you indicated you are struggling, the system has recalculating your route to provide a quick prerequisite refresher."
                      }
                    },
                    ...week.modules.map(m => m.skill_id === skillId ? { ...m, status: 'locked' } : m)
                  ]
                }
              }
              return week
            })
          }
        } else if (actionType === 'skip') {
          // Mark completed and active next
          let marked = false
          updatedWeeks = timeline.weeks.map(week => ({
            ...week,
            modules: week.modules.map(mod => {
              if (mod.skill_id === skillId) {
                return { ...mod, status: 'completed' }
              }
              if (!marked && mod.status === 'locked') {
                marked = true
                return { ...mod, status: 'active' }
              }
              return mod
            })
          }))
        }
        
        // Wait 1.2s to show recalculating overlay
        await new Promise(r => setTimeout(r, 1200))
        set({ timeline: { ...timeline, weeks: updatedWeeks } })
      }
    } finally {
      set({ isRecalculating: false })
    }
  },

  clearStore: () => {
    localStorage.removeItem('learner_id')
    set({
      learnerId: null,
      learnerProfile: null,
      gaps: [],
      timeline: null,
      error: null
    })
  }
}))
