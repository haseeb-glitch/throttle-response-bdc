import { Routes, Route } from 'react-router-dom'
import Dashboard    from './pages/Dashboard'
import LeadDetail   from './pages/LeadDetail'
import Analytics    from './pages/Analytics'
import Appointments from './pages/Appointments'
import Settings     from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/"             element={<Dashboard    />} />
      <Route path="/lead/:id"     element={<LeadDetail   />} />
      <Route path="/leads"        element={<Dashboard    />} />
      <Route path="/analytics"    element={<Analytics    />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings"     element={<Settings     />} />
      <Route path="/sms"          element={<Settings     />} />
    </Routes>
  )
}

export default App
