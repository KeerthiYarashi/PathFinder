import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Compass, Zap, Target, ArrowRight } from 'lucide-react'

function LandingPage() {
  // SVG path morph states
  const tangledPath = "M 20 120 C 80 20, 120 220, 200 120 C 280 20, 320 220, 400 120 C 480 20, 520 220, 600 120"
  const straightPath = "M 20 120 C 100 120, 150 120, 200 120 C 300 120, 350 120, 400 120 C 500 120, 550 120, 600 120"

  const features = [
    {
      icon: Compass,
      title: "GPS for Learning",
      description: "When you struggle or skip, the path dynamically recalculates the route. Real-time adaptation, no static roadmaps.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      icon: Zap,
      title: "Explainable AI Suggestions",
      description: "No black-box recommendations. Every resource, course, and project has a clear, data-driven 'Why This?' explanation.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      icon: Target,
      title: "Interactive Skill-Gap Maps",
      description: "Compare your current capability directly against industry-standard roles using radar charts. Identify and bridge gaps instantly.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    }
  ]

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 sm:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400 tracking-wide">
          <Compass className="h-6 w-6 text-indigo-500" />
          <span>PathFinder</span>
        </Link>
        <Link 
          to="/onboarding"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Learning
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 z-10">
        
        {/* Left Column: Text Content */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-3 w-3" />
              Dynamic Skill Pathfinding
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Eliminate Choice Paralysis. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
              Master Your Next Skill.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            The premium, AI-driven learning platform that serves as a GPS for your learning. We maps out exactly what you need to study, explaining every recommendation, and adapting instantly when you struggle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
          >
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.97] transition-all group"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 px-6 py-4 font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              Demo Sandbox
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Visual Animation */}
        <div className="flex-1 w-full flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[620px] aspect-[4/3] bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-2xl flex flex-col justify-between"
          >
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <span className="text-sm font-semibold text-slate-400">Adaptive Path Metaphor</span>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-800" />
                <span className="w-3 h-3 rounded-full bg-slate-800" />
                <span className="w-3 h-3 rounded-full bg-slate-800" />
              </div>
            </div>

            <div className="relative flex-1 w-full flex items-center justify-center py-8 overflow-visible">
              <svg 
                viewBox="0 0 620 240" 
                className="w-full h-full overflow-visible"
              >
                {/* Background Grid Line */}
                <line x1="20" y1="120" x2="600" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />

                {/* Morphing Path */}
                <motion.path
                  d={tangledPath}
                  animate={{
                    d: [tangledPath, straightPath, tangledPath],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse"
                  }}
                  fill="transparent"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Nodes on Path */}
                {/* Node 1 */}
                <motion.circle
                  cx="200"
                  cy="120"
                  r="10"
                  className="fill-indigo-600 stroke-indigo-500"
                  strokeWidth="3"
                  animate={{
                    cy: [120, 120, 120],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Node 2 */}
                <motion.circle
                  cx="400"
                  cy="120"
                  r="10"
                  className="fill-emerald-500 stroke-emerald-500"
                  strokeWidth="3"
                  animate={{
                    cy: [120, 120, 120],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />

                {/* Linear gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Status Labels overlays */}
              <motion.div
                animate={{ opacity: [1, 0, 1], y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-12 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-bold text-amber-400"
              >
                Struggling? Recalculating...
              </motion.div>
              
              <motion.div
                animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 right-20 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400"
              >
                Route Optimized!
              </motion.div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-800/80">
              <span>Goal: ML Engineer</span>
              <span>Timeline: 12 Weeks</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-950 border-t border-slate-900 py-16 px-6 sm:px-12 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Built to Eliminate Choice Paralysis</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Traditional learning is a maze of directories. PathFinder is a single dashboard focused entirely on your next best action.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-slate-900/30 border border-slate-900/80 p-6 rounded-2xl flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 sm:px-12 py-8 text-center text-xs text-slate-550 z-10 flex flex-col sm:flex-row justify-between gap-4 max-w-7xl w-full mx-auto">
        <span className="text-slate-500">© 2026 PathFinder Inc. All rights reserved.</span>
        <div className="flex gap-6 justify-center text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage