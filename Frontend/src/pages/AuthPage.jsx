import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLearnerStore } from '../store/learnerStore'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [message, setMessage] = useState(null)

  const { signIn, signUp, signInWithOAuth } = useLearnerStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError(null)
    setMessage(null)
    setIsSubmitLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        // If login successful, state will update and ProtectedRoute will handle redirect,
        // but we can also manually navigate to dashboard.
        navigate('/dashboard')
      } else {
        const { user, session } = await signUp(email, password)
        // Handle Email Confirmation check
        if (user && !session) {
          setMessage('Check your email for the confirmation link!')
        } else {
          // No email confirmation required
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    setAuthError(null)
    setIsSubmitLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setAuthError(err.message || `Failed to sign in with ${provider}`)
      setIsSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans text-slate-200">
      <div className="w-full max-w-md bg-slate-900/60 p-8 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            PathFinder AI
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to start learning.'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/10 p-3 text-red-500 border border-red-500/20 text-sm">
            <AlertCircle size={18} />
            <p>{authError}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20 text-sm">
            <AlertCircle size={18} />
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitLoading && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">or continue with</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isSubmitLoading}
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Google
          </button>
          
          <button
            type="button"
            disabled={isSubmitLoading}
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            GitHub
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin)
              setAuthError(null)
              setMessage(null)
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AuthPage
