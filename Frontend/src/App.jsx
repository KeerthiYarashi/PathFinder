import { Routes, Route } from 'react-router-dom'

import AppLayout from './components/Layout/AppLayout'

import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/Onboarding/OnboardingPage'
import OnboardingUploadPage from './pages/Onboarding/OnboardingUploadPage'
import DashboardPage from './pages/DashboardPage'
import PathPage from './pages/PathPage'
import SkillsPage from './pages/SkillsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      {/* Pages without the main app navbar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/onboarding/upload"
        element={<OnboardingUploadPage />}
      />

      {/* Pages with Navbar + AppLayout */}
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />

      <Route
        path="/path"
        element={
          <AppLayout>
            <PathPage />
          </AppLayout>
        }
      />

      <Route
        path="/skills"
        element={
          <AppLayout>
            <SkillsPage />
          </AppLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />
    </Routes>
  )
}

export default App