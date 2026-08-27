import { motion } from 'framer-motion'
import { X, Info, HelpCircle } from 'lucide-react'

function ExplanationModal({ resource, onClose }) {
  // Mock fit scores based on resource characteristics (or hardcoded/derived defaults)
  const semanticFit = 92
  const timeFit = resource.time_estimate_hours <= 2 ? 100 : resource.time_estimate_hours <= 5 ? 85 : 60
  const difficultyFit = resource.difficulty === 'low' ? 95 : resource.difficulty === 'normal' ? 88 : 70

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-50 space-y-6 text-left"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-indigo-400">
            <Info className="h-5 w-5" />
            <h3 className="text-md font-bold text-slate-100">Why This Recommendation?</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Natural Language Summary */}
        <div className="space-y-2 bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
          <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">AI Synopsis</span>
          <p className="text-xs text-slate-350 leading-relaxed">
            {resource.explanation || "This course is sequenced to bridge your active skill gaps by targeting critical concepts first."}
          </p>
        </div>

        {/* Scoring Weights */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Recommendation Match Weight</h4>
          
          {/* Semantic Fit */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Semantic Curricular Fit</span>
              <span className="text-indigo-400 font-bold">{semanticFit}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${semanticFit}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>

          {/* Time Fit */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Time Budget Alignment</span>
              <span className="text-emerald-400 font-bold">{timeFit}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${timeFit}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          {/* Difficulty Fit */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Difficulty Preference Score</span>
              <span className="text-amber-400 font-bold">{difficultyFit}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${difficultyFit}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-xs font-bold text-slate-200 transition-colors"
          >
            Dismiss Details
          </button>
          
          <button
            onClick={() => {
              onClose()
              // Focus AI mentor or notify
              alert("AI Mentor is context-aware. Click the Floating AI button in the corner to ask more questions!")
            }}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="h-4 w-4" />
            Ask Mentor
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ExplanationModal
