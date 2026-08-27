import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, HelpCircle, BookOpen, Clock, BarChart3, Settings } from 'lucide-react'
import ExplanationModal from './ExplanationModal'

function ResourceDetailPanel({ module, onClose, onAction }) {
  const [showExplanation, setShowExplanation] = useState(false)

  const { resource } = module
  const difficulty = resource?.difficulty || 'normal'
  const timeHours = resource?.time_estimate_hours || 2.0
  const format = resource?.format || 'video'
  const provider = resource?.provider || 'Coursera'

  // Difficulty badge colors
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    }
  }

  // Format icon helper
  const getFormatLabel = (fmt) => {
    switch (fmt) {
      case 'video':
        return '🎥 Video Lecture'
      case 'article':
        return '📄 Article / Textbook'
      case 'project':
        return '💻 Hands-on Project'
      default:
        return '🔄 Mixed Content'
    }
  }

  return (
    <>
      {/* Panel Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Slide-over Panel Sheet */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between"
      >
        {/* Panel Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">Module Details</span>
              <h2 className="text-xl font-bold text-slate-100">{module.skill_name}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Recommended Resource Card */}
          {resource && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Recommended Resource</span>
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-3 text-left">
                  <h3 className="font-extrabold text-slate-200 leading-snug">{resource.title}</h3>
                  <p className="text-xs text-slate-500">Provider: <span className="font-bold text-slate-400">{provider}</span></p>
                  
                  {/* Start Course CTA */}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group mt-1"
                    >
                      Open Course Link
                      <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              {/* Metadata Badges list */}
              <div className="grid grid-cols-3 gap-2.5">
                
                {/* Duration */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide">Duration</span>
                  <span className="text-xs font-bold text-slate-250">{timeHours} Hrs</span>
                </div>
                
                {/* Difficulty */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide">Difficulty</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold capitalize border ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
                
                {/* Format */}
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide">Media</span>
                  <span className="text-[10px] font-bold text-slate-250 text-center truncate w-full">
                    {format === 'mixed' ? 'Mixed' : format}
                  </span>
                </div>

              </div>

              {/* Learning Format Detailed row */}
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl text-left text-xs text-slate-400">
                {getFormatLabel(format)}
              </div>

              {/* "Why This?" Explanation CTA */}
              <button
                onClick={() => setShowExplanation(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 py-3 text-xs font-extrabold text-indigo-400 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                Why was this recommended?
              </button>
            </div>
          )}

        </div>

        {/* Action Controls Section */}
        <div className="border-t border-slate-800 bg-slate-900 p-6 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            {/* Skip Option */}
            <button
              onClick={() => onAction('skip')}
              className="rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 py-3.5 text-xs font-extrabold text-slate-300 hover:text-white transition-colors"
            >
              Skip (Too Easy)
            </button>
            
            {/* Complete Option */}
            <button
              onClick={() => onAction('complete')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/10 transition-colors"
            >
              Mark Complete
            </button>
          </div>

          {/* Struggle option */}
          <button
            onClick={() => onAction('struggling')}
            className="w-full rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 py-3.5 text-xs font-extrabold text-amber-400 transition-colors"
          >
            I'm Struggling with this Module
          </button>
        </div>

      </motion.div>

      {/* Context-aware Explanation Modal Pop */}
      <AnimatePresence>
        {showExplanation && (
          <ExplanationModal 
            resource={resource} 
            onClose={() => setShowExplanation(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ResourceDetailPanel
