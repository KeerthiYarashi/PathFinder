import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { AnimatePresence } from 'framer-motion'
import QuizModal from '../components/Assessment/QuizModal'
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts'
import { ShieldAlert, Compass, Target, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

function SkillsPage() {
  const navigate = useNavigate()
  const { 
    learnerId, 
    targetRole, 
    gaps, 
    isLoading, 
    fetchGaps, 
    generateTimeline,
    updateSkillLevel
  } = useLearnerStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState(null)

  // Fetch gaps on mount if we have a learner ID
  useEffect(() => {
    if (learnerId) {
      fetchGaps()
    }
  }, [learnerId, fetchGaps])

  // Redirect to Onboarding if no learner profile exists
  if (!learnerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No Learner Profile Found</h2>
          <p className="text-sm text-slate-400 max-w-sm">Please complete onboarding first so we can analyze your skills.</p>
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

  const handleGeneratePath = async () => {
    setIsGenerating(true)
    await generateTimeline()
    setIsGenerating(false)
    navigate('/path')
  }

  // Format Recharts data
  const chartData = gaps.map(g => ({
    subject: g.skill_name,
    'Current Level': g.current_level,
    'Required Level': g.target_level,
  }))

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      default:
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
    }
  }

  const theme = useLearnerStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Skill-Gap Analysis</h1>
          <p className="text-sm text-slate-400">
            Target Goal: <span className="text-indigo-400 font-bold">{targetRole}</span>
          </p>
        </div>
        <button
          onClick={handleGeneratePath}
          disabled={isLoading || isGenerating || gaps.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-800 disabled:cursor-not-allowed px-6 py-3.5 font-extrabold text-white shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Generating Dynamic Path...
            </>
          ) : (
            <>
              Generate Personalized Path
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Analyzing target role curriculum Gaps...</p>
        </div>
      ) : gaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 border border-slate-900 rounded-xl bg-slate-950/20">
          <AlertCircle className="h-10 w-10 text-slate-500" />
          <p className="text-sm text-slate-400">No skill gaps found. You have mastered everything required!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Radar Chart */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" />
              Skill Overlap Spider Chart
            </h3>
            
            <div className="w-full flex justify-center py-4 overflow-visible">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke={isDark ? '#1e293b' : '#cbd5e1'} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: isDark ? '#94a3b8' : '#1e293b', fontSize: 11, fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 3]} 
                    tick={{ fill: isDark ? '#475569' : '#64748b', fontSize: 9 }} 
                    axisLine={false} 
                  />
                  
                  {/* Current Level Radar (Indigo Accent) */}
                  <Radar 
                    name="Your Current Level" 
                    dataKey="Current Level" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.35} 
                  />
                  
                  {/* Target level Radar (Emerald Accent) */}
                  <Radar 
                    name="Target Level Required" 
                    dataKey="Required Level" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.15} 
                  />
                  
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '12px', 
                      color: isDark ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '11px', 
                      paddingTop: '20px', 
                      color: '#94a3b8' 
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-xs text-slate-500 text-center max-w-sm">
              Shaded purple represents your current profile. Overlap with green indicates targets already satisfied.
            </div>
          </div>

          {/* Right Column: Gap Details Table */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="text-md font-bold text-slate-200">Required Skills & Gap Analysis</h3>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                {gaps.length} Skill Gaps Identified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-xs font-semibold tracking-wider">
                    <th className="py-3 pr-4">Skill Title</th>
                    <th className="py-3 px-4 text-center">Current</th>
                    <th className="py-3 px-4 text-center">Required</th>
                    <th className="py-3 px-4 text-center">Gap Size</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50 text-sm">
                  {gaps.map((gap) => (
                    <tr key={gap.skill_id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 pr-4 font-medium text-slate-200">{gap.skill_name}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-400">
                        {gap.current_level} <span className="text-xs text-slate-600">/ 3</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-500">
                        {gap.target_level} <span className="text-xs text-emerald-900">/ 3</span>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-amber-500">
                        -{gap.gap_size}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize border ${getPriorityStyle(gap.priority)}`}>
                          {gap.priority}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {gap.gap_size > 0 ? (
                          <button
                            onClick={() => setActiveQuiz({ id: gap.skill_id, name: gap.skill_name })}
                            className="text-[10px] font-black text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-600/10 px-2.5 py-1 rounded transition-colors"
                          >
                            Assess Mastery
                          </button>
                        ) : (
                          <span className="text-[10px] font-extrabold text-emerald-500">Mastered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
              <Compass className="h-5 w-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-450 leading-relaxed">
                Clicking <span className="font-bold text-slate-300">Generate Personalized Path</span> will construct a sequenced timeline where high-priority skills are scheduled first, respecting your weekly time constraints.
              </p>
            </div>
          </div>

        </div>
      )}
      {/* Assessment Modal Overlay */}
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

export default SkillsPage