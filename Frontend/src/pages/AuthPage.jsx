import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { User, Eye, EyeOff, AlertCircle, Loader2, X, PlusCircle, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [message, setMessage] = useState(null)
  const [oauthModal, setOauthModal] = useState(null) // 'google' | 'github' | null
  const [customOAuthEmail, setCustomOAuthEmail] = useState('')
  const [isCustomInput, setIsCustomInput] = useState(false)

  const { signIn, signUp, signInWithOAuth, signInAsGuest } = useLearnerStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError(null)
    setMessage(null)
    setIsSubmitLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        const { user, session } = await signUp(email, password)
        if (user && !session) {
          setMessage('Check your email for the confirmation link!')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleOpenOAuth = (provider) => {
    setAuthError(null)
    setIsCustomInput(false)
    setCustomOAuthEmail('')
    setOauthModal(provider)
  }

  const handleSelectAccount = async (selectedEmail, selectedName) => {
    setIsSubmitLoading(true)
    setOauthModal(null)
    try {
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('demo-pathfinder')
      if (!isPlaceholder) {
        await signInWithOAuth(oauthModal)
      } else {
        const userObj = {
          id: `${oauthModal}_` + Math.random().toString(36).substring(2, 7),
          email: selectedEmail,
          user_metadata: {
            full_name: selectedName || selectedEmail.split('@')[0],
            avatar_url: oauthModal === 'google' 
              ? 'https://lh3.googleusercontent.com/a/default-user' 
              : 'https://avatars.githubusercontent.com/u/9919?v=4'
          }
        }
        localStorage.setItem('learner_id', userObj.id)
        useLearnerStore.setState({ user: userObj, learnerId: userObj.id, isLoading: false, error: null })
      }
      navigate('/dashboard')
    } catch (err) {
      setAuthError(err.message || `Failed to sign in with ${oauthModal}`)
    } finally {
      setIsSubmitLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#cae8f7] via-[#d6effa] to-[#e4f6fc] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans select-none">
      
      {/* Background Landscape Scenery Illustration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Clouds */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 0.85, x: 0 }} 
          transition={{ duration: 1.5 }}
          className="absolute top-[8%] left-[10%] w-64 h-14 bg-white/70 rounded-full blur-[1px]" 
        />
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 0.75, x: 0 }} 
          transition={{ duration: 1.8 }}
          className="absolute top-[15%] right-[15%] w-72 h-14 bg-white/60 rounded-full blur-[1px]" 
        />

        {/* Far Background Hills (Teal/Cyan) */}
        <svg className="absolute bottom-0 w-full h-[45%] text-[#a3dae9]/70" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,192L60,181.3C120,171,240,149,360,165.3C480,181,600,235,720,229.3C840,224,960,160,1080,149.3C1200,139,1320,181,1380,202.7L1440,224L1440,320L0,320Z"></path>
        </svg>

        {/* Midground Hills */}
        <svg className="absolute bottom-0 w-full h-[30%] text-[#7ec7db]/60" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,128L80,144C160,160,320,192,480,186.7C640,181,800,139,960,133.3C1120,128,1280,160,1360,176L1440,192L1440,320L0,320Z"></path>
        </svg>

        {/* Foreground Ground Horizon */}
        <div className="absolute bottom-0 inset-x-0 h-[16%] bg-gradient-to-t from-[#c4e5f2] to-[#b6dfef]/80" />

        {/* Distant Trees */}
        <div className="absolute bottom-[14%] right-[6%] flex items-end gap-3 opacity-80">
          <div className="w-8 h-24 bg-[#20a3b8] rounded-full" />
          <div className="w-10 h-32 bg-[#168a9d] rounded-full" />
        </div>
      </div>

      {/* Main Container: Left Illustration + Right Login Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
        
        {/* Left Side: Modern Standing Learner Character */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex flex-col items-center justify-center relative w-full max-w-[380px] lg:max-w-[430px] shrink-0"
        >
          <img 
            src="/standing_person.png" 
            alt="Pathfinder Learner" 
            className="w-full h-auto max-h-[560px] object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-300"
          />
        </motion.div>

        {/* Right Side: Exact Inspiration Rounded Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[460px] bg-white rounded-[2.2rem] shadow-2xl p-8 sm:p-10 border border-white/70 relative z-20 text-left"
        >
          
          {/* Card Header */}
          <div className="mb-7">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#282157] tracking-tight mb-2">
              Welcome To Pathfinder
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
              A community of over thousands of learners to discover and achieve your dream career.
            </p>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 p-3 text-red-600 border border-red-200 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          {message && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 text-emerald-700 border border-emerald-200 text-xs">
              <Check size={16} className="shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Email Pill Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
                <User size={18} />
              </div>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username/email"
                className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#382b75] rounded-full py-3.5 pl-11 pr-5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#382b75]/15 transition-all shadow-inner/5"
              />
            </div>

            {/* Password Pill Input with Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#382b75] rounded-full py-3.5 pl-11 pr-5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#382b75]/15 transition-all shadow-inner/5"
              />
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    rememberMe ? 'border-[#342b6e] bg-[#342b6e]' : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {rememberMe && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-slate-500 font-medium">Remember me</span>
              </label>

              <button 
                type="button"
                onClick={() => alert("Password reset link has been sent to your email.")}
                className="text-slate-400 hover:text-[#382b75] transition-colors"
              >
                Forget password
              </button>
            </div>

            {/* Pill Dark Indigo Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitLoading}
              className="w-full mt-2 bg-[#2d2363] hover:bg-[#231a52] active:scale-[0.99] text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-[#2d2363]/25 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSubmitLoading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Login' : 'Create Account'}
            </button>

            {/* 1-Click Quick Demo Access */}
            <button 
              type="button" 
              disabled={isSubmitLoading}
              onClick={() => {
                signInAsGuest()
                navigate('/dashboard')
              }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#382b75] font-semibold py-2.5 rounded-full text-xs transition-all flex justify-center items-center gap-1.5"
            >
              ⚡ Quick Demo Mode (1-Click)
            </button>
          </form>

          {/* Social Logins Divider */}
          <div className="my-5 flex items-center justify-center space-x-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Google & GitHub Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitLoading}
              onClick={() => handleOpenOAuth('google')}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full transition-all font-semibold text-xs disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Google
            </button>
            
            <button
              type="button"
              disabled={isSubmitLoading}
              onClick={() => handleOpenOAuth('github')}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full transition-all font-semibold text-xs disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Toggle Sign Up / Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin)
                setAuthError(null)
                setMessage(null)
              }}
              className="text-[#382b75] hover:underline font-bold transition-all ml-1"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>

        </motion.div>
      </div>

      {/* Interactive Google / GitHub Account Chooser Modal */}
      <AnimatePresence>
        {oauthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-left space-y-5 border border-slate-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  {oauthModal === 'google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  )}
                  <h3 className="font-bold text-slate-800 text-sm">
                    {oauthModal === 'google' ? 'Sign in with Google' : 'Sign in with GitHub'}
                  </h3>
                </div>
                <button onClick={() => setOauthModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">Choose an account</p>
                <p className="text-[11px] text-slate-400">to continue to Pathfinder</p>
              </div>

              {!isCustomInput ? (
                <div className="space-y-2">
                  {/* Account Choice 1 */}
                  <button
                    onClick={() => handleSelectAccount(
                      oauthModal === 'google' ? 'pragnik.dev@gmail.com' : 'pragnik-dev@github.com',
                      'Pragnik'
                    )}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2d2363] flex items-center justify-center text-white font-bold text-xs">
                      P
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#2d2363] truncate">Pragnik</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {oauthModal === 'google' ? 'pragnik.dev@gmail.com' : 'pragnik-dev@github.com'}
                      </p>
                    </div>
                  </button>

                  {/* Account Choice 2 */}
                  <button
                    onClick={() => handleSelectAccount(
                      oauthModal === 'google' ? 'learner.pathfinder@gmail.com' : 'pathfinder-learner@github.com',
                      'Pathfinder Learner'
                    )}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#20a3b8] flex items-center justify-center text-white font-bold text-xs">
                      L
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#2d2363] truncate">Pathfinder Learner</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {oauthModal === 'google' ? 'learner.pathfinder@gmail.com' : 'pathfinder-learner@github.com'}
                      </p>
                    </div>
                  </button>

                  {/* Add Custom Account Option */}
                  <button
                    onClick={() => setIsCustomInput(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 hover:border-[#2d2363]/40 hover:bg-slate-50 transition-all text-left text-xs font-medium text-slate-500 hover:text-[#2d2363]"
                  >
                    <PlusCircle className="h-4 w-4 text-[#2d2363]" />
                    Use another account...
                  </button>
                </div>
              ) : (
                /* Custom email input form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (customOAuthEmail.trim()) {
                      handleSelectAccount(customOAuthEmail.trim(), customOAuthEmail.split('@')[0])
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Enter your {oauthModal === 'google' ? 'Google Email' : 'GitHub Username/Email'}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={customOAuthEmail}
                      onChange={(e) => setCustomOAuthEmail(e.target.value)}
                      placeholder={oauthModal === 'google' ? 'name@gmail.com' : 'username@github.com'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-full py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2d2363]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomInput(false)}
                      className="flex-1 rounded-full border border-slate-200 hover:bg-slate-100 py-2 text-xs font-bold text-slate-600"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!customOAuthEmail.trim()}
                      className="flex-1 rounded-full bg-[#2d2363] hover:bg-[#231a52] disabled:opacity-50 py-2 text-xs font-bold text-white shadow-md shadow-[#2d2363]/20"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                To continue, {oauthModal === 'google' ? 'Google' : 'GitHub'} will share your name and email with Pathfinder.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthPage
