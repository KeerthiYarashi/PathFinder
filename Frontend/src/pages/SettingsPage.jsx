import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { 
  Sun, 
  Moon, 
  Trash2, 
  User, 
  Sliders, 
  Check, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

function SettingsPage() {
  const navigate = useNavigate()
  const { 
    learnerId, 
    learnerProfile, 
    clearStore, 
    createProfile,
    theme,
    toggleTheme
  } = useLearnerStore()

  // Local settings states
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Local profile states (pre-populated from store if exists)
  const [name, setName] = useState(learnerProfile?.name || 'Learner')
  const [timeBudget, setTimeBudget] = useState(learnerProfile?.time_budget_hours || 10)
  const [format, setFormat] = useState(learnerProfile?.preferred_format || 'mixed')
  const [difficulty, setDifficulty] = useState(learnerProfile?.difficulty_tolerance || 'normal')

  const handleSaveProfile = async () => {
    setSaveSuccess(true)
    await createProfile(name, timeBudget, format, difficulty)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleResetPath = () => {
    clearStore()
    setShowConfirmReset(false)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-left">
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-450 mt-1">Manage themes, profiles, and study preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: THEME SETUP */}
        <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            Theme Preferences
          </h3>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-slate-200">Light / Dark Appearance</span>
              <p className="text-xs text-slate-500">Toggle between slate light mode and deep navy dark mode.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-350 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400" />
                  Dark Active
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  Light Active
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2: EDIT PROFILE */}
        {learnerId && (
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              Configure Study Profile
            </h3>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-405">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Time Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-405">Weekly Time Commitment</label>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{timeBudget} Hours</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={timeBudget}
                onChange={(e) => setTimeBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Format pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-405">Learning Material Types</label>
              <div className="flex gap-2">
                {['mixed', 'video', 'article', 'project'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold capitalize transition-all ${
                      format === f
                        ? 'border-indigo-500/50 bg-indigo-600/10 text-indigo-400'
                        : 'border-slate-850 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-405">Comfort Threshold</label>
              <div className="flex gap-2">
                {['low', 'normal', 'high'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold capitalize transition-all ${
                      difficulty === d
                        ? 'border-indigo-500/50 bg-indigo-600/10 text-indigo-400'
                        : 'border-slate-850 bg-slate-950 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 font-bold text-white text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-450" />
                    Saved Preferences!
                  </>
                ) : (
                  "Update Profile Details"
                )}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: DANGER ZONE PATH RESET */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Danger Zone
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="space-y-0.5 max-w-sm">
              <span className="text-sm font-semibold text-slate-200">Reset Generated Path</span>
              <p className="text-xs text-slate-500">
                Permanently wipes your learning timeline, skills mastery data, and profile settings.
              </p>
            </div>
            
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-red-600/10 transition-colors shrink-0"
              >
                Reset Learning Path
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPath}
                  className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-white flex items-center gap-1 shadow-lg shadow-red-600/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Confirm Wipe
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default SettingsPage