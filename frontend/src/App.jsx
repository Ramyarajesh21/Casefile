import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CaseLibraryPage from './pages/CaseLibraryPage'
import CaseDetailPage from './pages/CaseDetailPage'
import HomePage from './pages/HomePage'
import InvestigationPage from './pages/InvestigationPage'
import CrimeScenePage from './pages/CrimeScenePage'
import CluesPage from './pages/CluesPage'
import EvidencePage from './pages/EvidencePage'
import WitnessesPage from './pages/WitnessesPage'
import SuspectsPage from './pages/SuspectsPage'
import TimelinePage from './pages/TimelinePage'
import DeductionPage from './pages/DeductionPage'
import AccusationPage from './pages/AccusationPage'
import ResultPage from './pages/ResultPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth()
  if (authLoading) {
    return <div className="auth-session-loading" role="status">Restoring session...</div>
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
        <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout><DashboardPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute>
              <MainLayout><CaseLibraryPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute>
              <MainLayout><CaseDetailPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigation/:caseId"
          element={
            <ProtectedRoute>
              <MainLayout><InvestigationPage /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/investigation/:caseId/scene" element={<ProtectedRoute><MainLayout><CrimeScenePage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/clues" element={<ProtectedRoute><MainLayout><CluesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/evidence" element={<ProtectedRoute><MainLayout><EvidencePage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/witnesses" element={<ProtectedRoute><MainLayout><WitnessesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/suspects" element={<ProtectedRoute><MainLayout><SuspectsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/timeline" element={<ProtectedRoute><MainLayout><TimelinePage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/deduction" element={<ProtectedRoute><MainLayout><DeductionPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/accusation" element={<ProtectedRoute><MainLayout><AccusationPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigation/:caseId/result" element={<ProtectedRoute><MainLayout><ResultPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
