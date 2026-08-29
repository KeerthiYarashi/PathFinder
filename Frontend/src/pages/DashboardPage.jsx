import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { 
  ResponsiveContainer, 
  BarChart, 
  XAxis, 
  YAxis, 
  Bar, 
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'recharts'
import { 
  Compass, 
  Flame, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Award, 
  Activity, 
  Play, 
  CheckCircle,
  TrendingUp, 
  BookOpen, 
  RefreshCw,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import ResourceDetailPanel from '../components/Timeline/ResourceDetailPanel'
import QuizModal from '../components/Assessment/QuizModal'

function DashboardPage() {
  const navigate = useNavigate()
  const { 
    learnerId, 
    learnerProfile,
    targetRole, 
    timeline, 
    gaps, 
    isLoading,
    generateTimeline,
    fetchGaps,
    logModuleAction,
    updateSkillLevel,
    theme
  } = useLearnerStore()

  const isDark = theme === 'dark'

  const [selectedDashboardModule, setSelectedDashboardModule] = useState(null)
  const [activeQuiz, setActiveQuiz] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    if (learnerId) {
      if (!timeline) generateTimeline()
      if (gaps.length === 0) fetchGaps()
    }
  }, [learnerId, timeline, gaps, generateTimeline, fetchGaps])

  if (!learnerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Welcome to Pathfinder</h2>
          <p className="text-sm text-slate-500 max-w-sm">Complete our quick onboarding setup to receive your AI-calibrated learning curriculum.</p>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-600/25 transition-all"
        >
          Begin Onboarding
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Telemetry computation
  let nextBestAction = null
  let activeWeek = null
  let totalModules = 0
  let completedModules = 0
  let currentWeekCompleted = 0
  let currentWeekTotal = 0

  if (timeline) {
    for (const week of timeline.weeks) {
      totalModules += week.modules.length
      completedModules += week.modules.filter(m => m.status === 'completed').length

      const hasActive = week.modules.some(m => m.status === 'active')
      if (hasActive && !activeWeek) {
        activeWeek = week
        nextBestAction = week.modules.find(m => m.status === 'active')
        currentWeekCompleted = week.modules.filter(m => m.status === 'completed').length
        currentWeekTotal = week.modules.length
      }
    }
  }

  // If all active completed, fallback to first available
  if (!nextBestAction && timeline?.weeks?.[0]?.modules?.[0]) {
    nextBestAction = timeline.weeks[0].modules[0]
  }

  const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Format chart data for skill growth
  const skillGrowthData = gaps.slice(0, 6).map(g => ({
    name: g.skill_name.length > 11 ? g.skill_name.substring(0, 11) + '..' : g.skill_name,
    'Your Level': g.current_level,
    'Target Level': g.target_level
  }))

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      
      {/* Top Welcome & Goal Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-8 w-60 h-60 rounded-full bg-purple-400/15 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>AI Learning Telemetry Active</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome back, {learnerProfile?.name || 'Learner'} 👋
            </h1>
            
            <p className="text-sm text-indigo-100/90 font-medium leading-relaxed">
              Calibrated goal: <span className="font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/25">{targetRole}</span>
              {' '}• Estimated {learnerProfile?.time_budget_hours || 10} hrs/week commitment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md px-5 py-3 text-xs font-extrabold text-white transition-all shadow-sm"
            >
              <Target className="h-4 w-4" />
              Assess Gaps
            </Link>
            
            <Link
              to="/path"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-3 text-xs font-black transition-all shadow-lg shadow-black/10"
            >
              <Compass className="h-4 w-4 text-indigo-600" />
              View Roadmap
            </Link>
          </div>
        </div>
      </div>

      {isLoading && !timeline ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Synthesizing personalized learning telemetry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* BENTO ROW 1 (FULL WIDTH HERO): NEXT BEST ACTION */}
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl p-7 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/40">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />
            
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                  <Play className="h-3 w-3 fill-indigo-600 dark:fill-indigo-400" />
                  Recommended Next Best Action
                </span>
                
                {nextBestAction?.resource?.difficulty && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    {nextBestAction.resource.difficulty} difficulty
                  </span>
                )}
              </div>
              
              {nextBestAction ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {nextBestAction.skill_name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Recommended Resource: <span className="text-indigo-600 dark:text-indigo-300 font-bold">{nextBestAction.resource?.title || 'Foundational Resource'}</span> • {nextBestAction.estimated_hours || 3.0} hours estimated
                  </p>
                  {nextBestAction.resource?.explanation && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                      AI Rationale: "{nextBestAction.resource.explanation.substring(0, 140)}..."
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">All Modules Mastered!</h2>
                  <p className="text-sm text-slate-500">
                    Congratulations! You have satisfied all prerequisites for {targetRole}.
                  </p>
                </>
              )}
            </div>

            {nextBestAction && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setActiveQuiz({ id: nextBestAction.skill_id, name: nextBestAction.skill_name })}
                  className="rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-indigo-200 dark:border-indigo-500/30 px-5 py-3.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Assess Mastery
                </button>

                <button
                  onClick={() => setSelectedDashboardModule(nextBestAction)}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Resume Learning
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* BENTO ROW 2 (WIDGET 1): OVERALL PROGRESS */}
          <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-500" />
                Overall Completion
              </h3>
            </div>
            
            <div className="flex items-center gap-6 py-4">
              <div className="w-20 h-20 shrink-0">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  styles={buildStyles({
                    pathColor: '#4f46e5',
                    textColor: isDark ? '#f8fafc' : '#0f172a',
                    trailColor: isDark ? '#1e293b' : '#e2e8f0',
                    textSize: '22px'
                  })}
                />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {completedModules} <span className="text-sm font-semibold text-slate-400">/ {totalModules}</span>
                </div>
                <span className="text-xs text-slate-500 block">roadmap modules cleared</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 inline-block">
                  Calibrated for {targetRole}
                </span>
              </div>
            </div>
            
            <Link to="/path" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5">
              Explore Subway Map <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* BENTO ROW 2 (WIDGET 2): CURRENT MILESTONE */}
          <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-500" />
                Active Milestone
              </h3>
            </div>

            <div className="py-3 space-y-3">
              {activeWeek ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">Week {activeWeek.week_number} Core Modules</span>
                    <span className="text-slate-500 font-bold">{currentWeekCompleted} of {currentWeekTotal} done</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${currentWeekTotal > 0 ? (currentWeekCompleted / currentWeekTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Closing high-priority prerequisite skill gaps.
                  </span>
                </>
              ) : (
                <div className="text-slate-400 text-xs italic py-4">All weekly milestones completed.</div>
              )}
            </div>

            <Link to="/path" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5">
              View Milestone Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* BENTO ROW 2 (WIDGET 3): LEARNING STREAK */}
          <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Learning Velocity
              </h3>
            </div>

            <div className="flex items-center gap-5 py-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Flame className="h-7 w-7 fill-orange-500 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-black text-slate-900 dark:text-white">5 Day Streak 🔥</div>
                <span className="text-xs text-slate-500 block font-medium">Daily consistency boosts retention by +40%</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Dedicated <strong>4.5 hrs</strong> this week</span>
            </div>
          </div>

          {/* BENTO ROW 3 (WIDGET 4 - SPAN 2): SKILL GROWTH TELEMETRY */}
          <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Skill Gap Mastery vs Target Requirement
              </h3>
              
              <Link to="/skills" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Full Gap Matrix →
              </Link>
            </div>
            
            {skillGrowthData.length > 0 ? (
              <div className="w-full flex justify-center py-2">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={skillGrowthData}>
                    <XAxis dataKey="name" tick={{ fill: isDark ? '#94a3b8' : '#334155', fontSize: 11, fontWeight: 600 }} axisLine={false} />
                    <YAxis domain={[0, 3]} tick={{ fill: isDark ? '#94a3b8' : '#334155', fontSize: 10 }} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                        borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                        borderRadius: '12px', 
                        color: isDark ? '#f8fafc' : '#0f172a', 
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        fontSize: '11px' 
                      }}
                    />
                    <ChartLegend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar name="Your Level" dataKey="Your Level" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar name="Target Level" dataKey="Target Level" fill="#10b981" fillOpacity={0.65} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-10 text-center font-medium">No skill gap history found.</div>
            )}
          </div>

          {/* BENTO ROW 3 (WIDGET 5): ACTIVITY LOG */}
          <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                Learning Activity Stream
              </h3>
            </div>

            <div className="flex-1 py-3 space-y-3.5 text-xs">
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-800 dark:text-slate-200 font-bold">Dynamic Path Calibrated</p>
                  <span className="text-[10px] text-slate-400">Target role: {targetRole}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-800 dark:text-slate-200 font-bold">Interactive Quizzes Connected</p>
                  <span className="text-[10px] text-slate-400">Adaptive scoring across 6 domains</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-800 dark:text-slate-200 font-bold">AI Study Mentor Active</p>
                  <span className="text-[10px] text-slate-400">Ready to assist 24/7</span>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-center font-medium">
              Synchronized automatically
            </div>
          </div>

        </div>
      )}

      {/* QUICK SKILL MASTERY ASSESSMENT SECTION */}
      {gaps.length > 0 && (
        <div className="rounded-3xl p-7 bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Quick Skill Assessments ({targetRole})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Take a quick quiz on key required skills to immediately adapt your learning modules.
              </p>
            </div>
            <Link to="/skills" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All {gaps.length} Skills →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gaps.slice(0, 4).map((g) => (
              <div 
                key={g.skill_id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    Priority {g.priority || 'high'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {g.skill_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Current: Level {g.current_level} / Target: Level {g.target_level}
                  </p>
                </div>

                <button
                  onClick={() => setActiveQuiz({ id: g.skill_id, name: g.skill_name })}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Take Quiz
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Recommendations Detail Panel */}
      <AnimatePresence>
        {selectedDashboardModule && (
          <ResourceDetailPanel 
            module={selectedDashboardModule} 
            onClose={() => setSelectedDashboardModule(null)} 
            onTakeQuiz={(mod) => {
              setSelectedDashboardModule(null)
              setActiveQuiz({ id: mod.skill_id, name: mod.skill_name })
            }}
            onAction={async (actionType) => {
              const skillId = selectedDashboardModule.skill_id
              setSelectedDashboardModule(null)
              await logModuleAction(skillId, actionType)
              window.location.reload()
            }}
          />
        )}
      </AnimatePresence>

      {/* Interactive Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <QuizModal
            skillId={activeQuiz.id}
            skillName={activeQuiz.name}
            onClose={() => setActiveQuiz(null)}
            onComplete={(scorePct) => {
              updateSkillLevel(activeQuiz.id, scorePct)
              setActiveQuiz(null)
            }}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

export default DashboardPage