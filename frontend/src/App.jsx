import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LeadDetail from './pages/LeadDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/lead/:id" element={<LeadDetail />} />
    </Routes>
  )
}

export default App
