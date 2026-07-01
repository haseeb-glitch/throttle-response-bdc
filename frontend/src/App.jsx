import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LeadDetail from './pages/LeadDetail'
import Analytics from './pages/Analytics'
import Appointments from './pages/Appointments'
import Settings from './pages/Settings'
import Login from './pages/Login'

function isAuthenticated() {
  return localStorage.getItem('trbdc_auth') === 'true'
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/lead/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/sms" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

export default App