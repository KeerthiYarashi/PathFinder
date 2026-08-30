import { Link } from 'react-router-dom'
import { useLearnerStore } from '../../store/learnerStore'
import { Compass, Code, MessageCircle, Briefcase, Mail, Heart, ArrowUpRight } from 'lucide-react'

function Footer() {
  const theme = useLearnerStore((state) => state.theme)
  const isDark = theme === 'dark'

  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Learning Path', path: '/path' },
        { name: 'Skills Map', path: '/skills' },
        { name: 'Settings', path: '/settings' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', path: '#', external: true },
        { name: 'API Reference', path: '#', external: true },
        { name: 'Community', path: '#', external: true },
        { name: 'Blog', path: '#', external: true },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '#' },
        { name: 'Careers', path: '#' },
        { name: 'Privacy Policy', path: '#' },
        { name: 'Terms of Service', path: '#' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Code, href: '#', label: 'GitHub' },
    { icon: MessageCircle, href: '#', label: 'Twitter' },
    { icon: Briefcase, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:support@pathfinder.dev', label: 'Email' },
  ]

  return (
    <footer
      className={`relative border-t transition-colors duration-300 ${
        isDark
          ? 'border-slate-800/60 bg-slate-950/90'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-lg font-bold tracking-wide transition-opacity hover:opacity-80 ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            >
              <Compass className="h-5 w-5 text-indigo-500" />
              <span>PathFinder</span>
            </Link>
            <p
              className={`mt-3 max-w-xs text-sm leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              The AI-powered learning GPS that eliminates choice paralysis and
              adapts to your journey in real-time.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-500/5'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {column.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.path}
                        className={`group inline-flex items-center gap-1 text-sm transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-400 hover:text-indigo-400'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                      >
                        {link.name}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className={`text-sm transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-400 hover:text-indigo-400'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className={`flex flex-col items-center justify-between gap-4 border-t py-6 sm:flex-row ${
            isDark ? 'border-slate-800/60' : 'border-slate-200'
          }`}
        >
          <p
            className={`text-xs ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            © {currentYear} PathFinder Inc. All rights reserved.
          </p>
          <p
            className={`inline-flex items-center gap-1 text-xs ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Built with{' '}
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />{' '}
            for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
