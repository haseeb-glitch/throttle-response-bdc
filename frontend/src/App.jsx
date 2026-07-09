import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LeadDetail from './pages/LeadDetail'
import Analytics from './pages/Analytics'
import Appointments from './pages/Appointments'
import Settings from './pages/Settings'
import Login from './pages/Login'
import AllLeads from './pages/AllLeads'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'

function isAuthenticated() {
  return localStorage.getItem('trbdc_auth') === 'true'
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      {/* Public routes - no login required */}
      <Route path="/login" element={<Login />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/lead/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><AllLeads /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/sms" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

export default App