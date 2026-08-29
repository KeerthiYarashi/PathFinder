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
      {/* Decorative ambient background glows */}
      {isDark ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-[40%] right-[-5%] h-[400px] w-[400px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-8%] left-[-5%] h-[550px] w-[550px] rounded-full bg-indigo-300/25 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-5%] right-[-5%] h-[550px] w-[550px] rounded-full bg-emerald-300/20 blur-[130px] pointer-events-none" />
          <div className="absolute top-[35%] right-[10%] h-[450px] w-[450px] rounded-full bg-purple-200/35 blur-[120px] pointer-events-none" />
          <div className="absolute top-[60%] left-[5%] h-[400px] w-[400px] rounded-full bg-amber-200/25 blur-[110px] pointer-events-none" />
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