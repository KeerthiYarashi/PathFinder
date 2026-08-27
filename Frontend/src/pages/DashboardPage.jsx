import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { AnimatePresence } from 'framer-motion'
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
  HelpCircle,
  TrendingUp,
  BookOpen,
  RefreshCw
} from 'lucide-react'
import ResourceDetailPanel from '../components/Timeline/ResourceDetailPanel'

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
    logModuleAction
  } = useLearnerStore()

  const [activeModule, setActiveModule] = useState(null)
  const [selectedDashboardModule, setSelectedDashboardModule] = useState(null)

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
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Welcome to PathFinder</h2>
          <p className="text-sm text-slate-400 max-w-sm">Complete our onboarding conversation to receive your personalized roadmap.</p>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 font-bold text-white transition-all"
        >
          Begin Onboarding Chat
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Find the Next Best Action (first active module in timeline)
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
      if (hasActive) {
        activeWeek = week
        nextBestAction = week.modules.find(m => m.status === 'active')
        currentWeekCompleted = week.modules.filter(m => m.status === 'completed').length
        currentWeekTotal = week.modules.length
      }
    }
  }

  // Overall Completion percentage
  const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Format chart data for skill growth
  // Use gaps and display remaining gaps
  const skillGrowthData = gaps.slice(0, 5).map(g => ({
    name: g.skill_name.length > 12 ? g.skill_name.substring(0, 12) + '..' : g.skill_name,
    'Your Level': g.current_level,
    'Target Level': g.target_level
  }))

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {learnerProfile?.name || 'Learner'}
        </h1>
        <p className="text-sm text-slate-450 mt-1">
          Your path is calibrated to: <span className="font-bold text-indigo-400">{targetRole}</span>
        </p>
      </div>

      {isLoading && !timeline ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading your learning metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* BENTO ROW 1 (FULL WIDTH HERO): NEXT BEST ACTION */}
          <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-900/20 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
            
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-455 border border-indigo-500/20 animate-pulse">
                <Play className="h-3 w-3 fill-indigo-455 text-indigo-455" />
                Next Best Action
              </span>
              
              {nextBestAction ? (
                <>
                  <h2 className="text-xl md:text-2xl font-black text-slate-100">{nextBestAction.skill_name}</h2>
                  <p className="text-sm text-slate-400">
                    Recommended Resource: <span className="text-slate-300 font-bold">{nextBestAction.resource.title}</span> • {nextBestAction.estimated_hours} hours estimated.
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Why: {nextBestAction.resource.explanation.substring(0, 120)}...
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl md:text-2xl font-black text-slate-100">All Modules Mastered!</h2>
                  <p className="text-sm text-slate-400">
                    Congratulations, you have completed all weekly milestones on your generated path. Check settings to reset.
                  </p>
                </>
              )}
            </div>

            {nextBestAction && (
              <button
                onClick={() => setSelectedDashboardModule(nextBestAction)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 w-full md:w-auto justify-center"
              >
                Resume Learning
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* BENTO ROW 2 (WIDGET 1): OVERALL PROGRESS */}
          <div className="bg-slate-900/30 border border-slate-900/85 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                Overall Progress
              </h3>
            </div>
            
            <div className="flex items-center gap-6 py-4">
              <div className="w-20 h-20 shrink-0">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  styles={buildStyles({
                    pathColor: '#6366f1',
                    textColor: '#f8fafc',
                    trailColor: '#1e293b',
                    textSize: '22px'
                  })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-extrabold text-slate-200">{completedModules}</span>
                <span className="text-xs text-slate-500 block">out of {totalModules} modules unlocked</span>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Adaptive Tracker Active
                </span>
              </div>
            </div>
            
            <Link to="/path" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View subway map roadmap <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* BENTO ROW 2 (WIDGET 2): CURRENT MILESTONE */}
          <div className="bg-slate-900/30 border border-slate-900/85 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-400" />
                Active Milestone
              </h3>
            </div>

            <div className="py-4 space-y-3">
              {activeWeek ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-250">Week {activeWeek.week_number} Milestone</span>
                    <span className="text-xs text-slate-500">{currentWeekCompleted} of {currentWeekTotal} done</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(currentWeekCompleted / currentWeekTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Focusing on foundational gaps this week.
                  </span>
                </>
              ) : (
                <div className="text-slate-500 text-sm italic py-4">No active weekly milestones.</div>
              )}
            </div>

            <Link to="/path" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View milestone detail <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* BENTO ROW 2 (WIDGET 3): LEARNING STREAK */}
          <div className="bg-slate-900/30 border border-slate-900/85 p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Learning Streak
              </h3>
            </div>

            <div className="flex items-center gap-5 py-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="h-6 w-6 fill-orange-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-200">5 Day Streak!</div>
                <span className="text-xs text-slate-500 block">Keep it up to solidify retention</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Dedicated 4.0 hrs this week</span>
            </div>
          </div>

          {/* BENTO ROW 3 (WIDGET 4 - SPAN 2): SKILL GROWTH */}
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900/85 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Skill Gap Reduction Progress
              </h3>
            </div>
            
            {skillGrowthData.length > 0 ? (
              <div className="w-full flex justify-center py-2">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={skillGrowthData}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                    <YAxis domain={[0, 3]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: 11 }}
                    />
                    <ChartLegend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar name="Your Level" dataKey="Your Level" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar name="Target Level" dataKey="Target Level" fill="#10b981" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-10 text-center">No skill gap history found.</div>
            )}
          </div>

          {/* BENTO ROW 3 (WIDGET 5): RECENT ACTIVITY FEED */}
          <div className="bg-slate-900/30 border border-slate-900/85 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Activity Log
              </h3>
            </div>

            <div className="flex-1 py-4 space-y-4 text-xs">
              
              {/* Activity item 1 */}
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                  <Compass className="h-3 w-3" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-350 font-semibold">Dynamic Learning Path generated</p>
                  <span className="text-[10px] text-slate-500">2 hours ago</span>
                </div>
              </div>
              
              {/* Activity item 2 */}
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-350 font-semibold">Mastered Probability Theory</p>
                  <span className="text-[10px] text-slate-500">2 hours ago</span>
                </div>
              </div>

              {/* Activity item 3 */}
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center shrink-0 text-slate-500">
                  <BookOpen className="h-3 w-3" />
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-slate-500 font-semibold">Onboarding profile created</p>
                  <span className="text-[10px] text-slate-600">Today</span>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-slate-550 border-t border-slate-900 pt-3 text-center">
              Logs active changes automatically
            </div>
          </div>

        </div>
      )}

      {/* Slide-over Recommendations Detail Panel */}
      <AnimatePresence>
        {selectedDashboardModule && (
          <ResourceDetailPanel 
            module={selectedDashboardModule} 
            onClose={() => setSelectedDashboardModule(null)} 
            onAction={async (actionType) => {
              const skillId = selectedDashboardModule.skill_id
              setSelectedDashboardModule(null)
              await logModuleAction(skillId, actionType)
              // Refresh page calculations
              window.location.reload()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardPage