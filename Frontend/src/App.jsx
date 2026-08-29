import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useLearnerStore } from './store/learnerStore'
import { Loader2 } from 'lucide-react'

import AppLayout from './components/Layout/AppLayout'

import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/Onboarding/OnboardingPage'
import OnboardingUploadPage from './pages/Onboarding/OnboardingUploadPage'
import DashboardPage from './pages/DashboardPage'
import PathPage from './pages/PathPage'
import SkillsPage from './pages/SkillsPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'

function ProtectedRoute({ children }) {
  const { user, isAuthLoading } = useLearnerStore()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const initializeAuth = useLearnerStore((state) => state.initializeAuth)

  useEffect(() => {
    const cleanup = initializeAuth()
    return () => {
      if (cleanup) cleanup()
    }
  }, [initializeAuth])

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />

      {/* Protected Flow */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/onboarding/upload"
        element={
          <ProtectedRoute>
            <OnboardingUploadPage />
          </ProtectedRoute>
        }
      />

      {/* Pages with Navbar + AppLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/path"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PathPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SkillsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App