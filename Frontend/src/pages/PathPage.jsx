import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Compass, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  Trophy, 
  RefreshCw, 
  ArrowRight, 
  ShieldAlert, 
  ChevronRight,
  Info,
  Star
} from 'lucide-react'

// Sub-components will be imported from separate files in Step 7.
// For now, inline simplified versions so Step 6 compiles and works immediately.
import ResourceDetailPanel from '../components/Timeline/ResourceDetailPanel'
import QuizModal from '../components/Assessment/QuizModal'

function PathPage() {
  const navigate = useNavigate()
  const { 
    learnerId, 
    targetRole, 
    timeline, 
    isLoading, 
    isRecalculating,
    generateTimeline,
    logModuleAction,
    updateSkillLevel
  } = useLearnerStore()

  const [selectedModule, setSelectedModule] = useState(null)
  const [activeQuiz, setActiveQuiz] = useState(null)

  // Fetch / generate timeline on mount
  useEffect(() => {
    if (learnerId && !timeline) {
      generateTimeline()
    }
  }, [learnerId, timeline, generateTimeline])

  if (!learnerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No Path Generated</h2>
          <p className="text-sm text-slate-400 max-w-sm">Please complete onboarding first so we can map your learning route.</p>
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 font-bold text-white transition-all"
        >
          Go to Onboarding
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Calculate stats
  const totalModules = timeline ? timeline.weeks.reduce((sum, w) => sum + w.modules.length, 0) : 0
  const completedModules = timeline ? timeline.weeks.reduce((sum, w) => sum + w.modules.filter(m => m.status === 'completed').length, 0) : 0
  const pathFinished = totalModules > 0 && completedModules === totalModules

  // Helpers to render node states
  const getNodeStyles = (status, format) => {
    if (format === 'project') {
      return {
        ring: status === 'completed'
          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-450'
          : status === 'active'
            ? 'border-amber-500 bg-amber-950/60 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
            : 'border-slate-800 bg-slate-900 text-slate-505',
        line: 'bg-slate-800',
        icon: Star
      }
    }

    switch (status) {
      case 'completed':
        return {
          ring: 'border-emerald-500 bg-emerald-950/40 text-emerald-400',
          line: 'bg-emerald-500',
          icon: CheckCircle2
        }
      case 'active':
        return {
          ring: 'border-indigo-500 bg-indigo-950/60 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] animate-pulse',
          line: 'bg-slate-800',
          icon: PlayCircle
        }
      default: // locked
        return {
          ring: 'border-slate-800 bg-slate-900 text-slate-500',
          line: 'bg-slate-800',
          icon: Lock
        }
    }
  }

  return (
    <div className="relative space-y-8">
      {/* Header Summary */}
      <div className="border-b border-slate-900 pb-5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your Personalized Learning Path</h1>
            <p className="text-sm text-slate-450 mt-1">
              Curriculum engineered for: <span className="text-indigo-400 font-bold">{targetRole}</span>
            </p>
          </div>
          
          {timeline && (
            <div className="flex gap-4">
              <div className="bg-slate-900/30 border border-slate-900 px-4 py-2 rounded-xl text-center">
                <span className="block text-slate-500 text-[10px] font-bold tracking-wider uppercase">Completion</span>
                <span className="text-sm font-extrabold text-slate-200">
                  {completedModules} <span className="text-xs text-slate-550">/ {totalModules} Modules</span>
                </span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 px-4 py-2 rounded-xl text-center">
                <span className="block text-slate-500 text-[10px] font-bold tracking-wider uppercase">Duration</span>
                <span className="text-sm font-extrabold text-slate-200">{timeline.total_weeks} Weeks</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && !timeline ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Assembling modules and mapping prerequisites...</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto pb-20">
          
          {/* THE SUBWAY TIMELINE CONTAINER */}
          <div className="relative pl-6 sm:pl-10 space-y-12">
            
            {/* Subway Rail Line */}
            <div className="absolute left-[29px] sm:left-[37px] top-6 bottom-6 w-1 bg-slate-900 pointer-events-none" />

            {/* Weeks Loops */}
            {timeline?.weeks.map((week, wIdx) => (
              <div key={week.week_number} className="space-y-6">
                
                {/* Milestone horizontal divider */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="h-[2px] w-4 bg-slate-900" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-0.5 border border-slate-900 rounded-md">
                    Week {week.week_number} • Phase Milestone
                  </span>
                  <div className="h-[2px] flex-1 bg-slate-900" />
                </div>

                {/* Modules in this week */}
                <div className="space-y-6">
                  {week.modules.map((mod) => {
                    const isProject = mod.resource?.format === 'project'
                    const nodeStyle = getNodeStyles(mod.status, mod.resource?.format)
                    const NodeIcon = nodeStyle.icon
                    const isActiveCard = mod.status === 'active'

                    return (
                      <div key={mod.skill_id} className="relative flex items-start group">
                        
                        {/* Subway Dot Indicator */}
                        <div className={`absolute left-0 top-[2px] -translate-x-[45%] z-20 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${nodeStyle.ring}`}>
                          <NodeIcon className="h-3.5 w-3.5" />
                        </div>

                        {/* Subway Card Body */}
                        <div 
                          onClick={() => mod.status !== 'locked' && setSelectedModule(mod)}
                          className={`ml-10 flex-1 border rounded-2xl p-5 text-left cursor-pointer transition-all duration-200 ${
                            isProject
                              ? mod.status === 'completed'
                                ? 'border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:scale-[1.005]'
                                : mod.status === 'active'
                                  ? 'border-amber-500/50 bg-amber-950/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-[1.005]'
                                  : 'border-slate-900/40 bg-slate-900/5 opacity-50 cursor-not-allowed'
                              : isActiveCard
                                ? 'border-indigo-500/50 hover:bg-slate-900/40 hover:scale-[1.005]'
                                : mod.status === 'completed'
                                  ? 'border-slate-900 hover:border-slate-800 bg-slate-950/20 opacity-80'
                                  : 'border-slate-950/80 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                  mod.status === 'completed'
                                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                    : isActiveCard
                                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'
                                      : 'bg-slate-900 text-slate-550 border-slate-800'
                                }`}>
                                  {mod.status}
                                </span>
                                <span className="text-xs text-slate-500">• {mod.estimated_hours} Hours</span>
                              </div>
                              {isProject && (
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-max mb-1">
                                  <Star className="h-2.5 w-2.5 fill-amber-500" />
                                  Capstone Project
                                </div>
                              )}
                              <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{mod.skill_name}</h3>
                              {mod.resource && (
                                <p className="text-xs text-slate-400 line-clamp-1">{mod.resource.title}</p>
                              )}
                            </div>
                            {mod.status !== 'locked' && (
                              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-2 transition-transform" />
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>

              </div>
            ))}

            {/* FINAL trophies locked / unlocked node */}
            <div className="relative flex items-center z-10 pt-4">
              <div className={`absolute left-0 -translate-x-[45%] z-20 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                pathFinished 
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-450 shadow-[0_0_15px_rgba(234,179,8,0.25)]' 
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}>
                <Trophy className="h-4 w-4" />
              </div>
              <div className="ml-10 text-left">
                <h4 className={`text-sm font-extrabold ${pathFinished ? 'text-yellow-450' : 'text-slate-500'}`}>
                  Goal Accomplishment
                </h4>
                <p className="text-xs text-slate-500">Unlocks trophy after mastering all path modules.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Slide-over Recommendations Detail Panel */}
      <AnimatePresence>
        {selectedModule && (
          <ResourceDetailPanel 
            module={selectedModule} 
            onClose={() => setSelectedModule(null)} 
            onTakeQuiz={(mod) => {
              setSelectedModule(null)
              setActiveQuiz({ id: mod.skill_id, name: mod.skill_name })
            }}
            onAction={async (actionType) => {
              const skillId = selectedModule.skill_id
              setSelectedModule(null)
              await logModuleAction(skillId, actionType)
            }}
          />
        )}
      </AnimatePresence>

      {/* Quiz Modal Overlay */}
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

      {/* Recalculating Overlay Route Animation (Metaphor) */}
      <AnimatePresence>
        {isRecalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-850 rounded-2xl p-8 max-w-sm text-center shadow-2xl space-y-4"
            >
              <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-md font-bold text-slate-100">Recalculating Route...</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  AI is updating node sequences to align prerequisites with your current skill responses.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PathPage