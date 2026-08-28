import { useEffect } from 'react'
import { useLearnerStore } from '../../store/learnerStore'
import Navbar from './Navbar'
import AIMentorFAB from '../Mentor/AIMentorFAB'

function AppLayout({ children }) {
  const theme = useLearnerStore((state) => state.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme-sandbox')
    } else {
      document.documentElement.classList.remove('light-theme-sandbox')
    }
  }, [theme])

  return (
    <div className={`relative min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200' 
        : 'bg-slate-50 text-slate-900 selection:bg-indigo-500/10 selection:text-indigo-800'
    }`}>
      {/* Decorative ambient background glows - only in dark mode for premium look */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-900/5 blur-[100px] pointer-events-none" />
        </>
      )}

      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating AI Study Mentor chatbot */}
      <AIMentorFAB />
    </div>
  )
}

export default AppLayout