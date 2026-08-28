import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLearnerStore } from '../../store/learnerStore'
import { Menu, X, Compass, LayoutDashboard, Target, Settings } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const theme = useLearnerStore((state) => state.theme)
  const isDark = theme === 'dark'

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Path', path: '/path', icon: Compass },
    { name: 'Skills', path: '/skills', icon: Target },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 px-6 py-4 backdrop-blur-md ${
      isDark 
        ? 'border-slate-800 bg-slate-950/85 text-slate-100' 
        : 'border-slate-200 bg-white/85 text-slate-800 shadow-sm'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        <Link
          to="/"
          className={`flex items-center gap-2 text-xl font-bold tracking-wide hover:opacity-90 transition-opacity ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`}
        >
          <Compass className="h-6 w-6 text-indigo-500 animate-spin-slow" />
          <span>PathFinder</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden gap-8 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? isDark 
                      ? 'text-indigo-400 font-semibold' 
                      : 'text-indigo-600 font-semibold'
                    : isDark 
                      ? 'text-slate-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
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
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar