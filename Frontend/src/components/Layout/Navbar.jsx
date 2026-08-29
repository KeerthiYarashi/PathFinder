import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLearnerStore } from '../../store/learnerStore'
import { Menu, X, Compass, LayoutDashboard, Target, Settings, LogOut, Sun, Moon } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const theme = useLearnerStore((state) => state.theme)
  const toggleTheme = useLearnerStore((state) => state.toggleTheme)
  const signOut = useLearnerStore((state) => state.signOut)
  const isDark = theme === 'dark'

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Path', path: '/path', icon: Compass },
    { name: 'Skills', path: '/skills', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 px-6 py-3.5 backdrop-blur-md ${
      isDark 
        ? 'border-slate-800 bg-slate-950/85 text-slate-100' 
        : 'border-indigo-100/80 bg-white/90 text-slate-800 shadow-sm shadow-indigo-500/5'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        <Link
          to="/"
          className={`flex items-center gap-2.5 text-xl font-black tracking-tight hover:opacity-90 transition-opacity ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            PathFinder
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? isDark 
                      ? 'text-indigo-400 font-bold' 
                      : 'text-indigo-600 font-bold bg-indigo-50/80 px-3 py-1.5 rounded-xl'
                    : isDark 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50 px-3 py-1.5 rounded-xl'
                }`}
              >
                <Icon className={`h-4 w-4 ${
                  active 
                    ? isDark ? 'text-indigo-400' : 'text-indigo-600' 
                    : isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                {link.name}
              </Link>
            )
          })}

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'border-slate-800 bg-slate-900 text-yellow-400 hover:bg-slate-800' 
                : 'border-indigo-100 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4 fill-yellow-400" /> : <Moon className="h-4 w-4 fill-indigo-600" />}
          </button>
          
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${
              isDark 
                ? 'text-slate-300 hover:text-red-400' 
                : 'text-slate-600 hover:text-red-600'
            }`}
          >
            <LogOut className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-lg p-2 transition-colors md:hidden ${
            isDark ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {/* Mobile Nav overlay */}
      {isOpen && (
        <div className={`absolute inset-x-0 top-full border-b p-6 backdrop-blur-lg md:hidden ${
          isDark 
            ? 'border-slate-800 bg-slate-950/95' 
            : 'border-slate-200 bg-white/95 shadow-lg'
        }`}>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                    active
                      ? isDark 
                        ? 'bg-indigo-600/10 text-indigo-400' 
                        : 'bg-indigo-500/10 text-indigo-600'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-900 hover:text-white' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    active 
                      ? isDark ? 'text-indigo-400' : 'text-indigo-600' 
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  {link.name}
                </Link>
              )
            })}
            
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all ${
                isDark 
                  ? 'text-slate-300 hover:bg-red-500/10 hover:text-red-400' 
                  : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <LogOut className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar