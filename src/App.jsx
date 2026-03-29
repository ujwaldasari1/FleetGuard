import { Routes, Route, Navigate } from 'react-router-dom'
import { useRole } from './context/RoleContext'
import Layout from './components/Layout'
import RoleSelector from './pages/RoleSelector'
import Dashboard from './pages/Dashboard'
import Drivers from './pages/Drivers'
import Certifications from './pages/Certifications'
import Incidents from './pages/Incidents'

function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useRole()
  if (!role) return <Navigate to="/" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/drivers" replace />
  return children
}

export default function App() {
  const { role } = useRole()

  if (!role) {
    return (
      <Routes>
        <Route path="*" element={<RoleSelector />} />
      </Routes>
    )
  }

  const defaultPath = role === 'Driver' ? '/drivers' : '/dashboard'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultPath} replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Safety Manager']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/incidents" element={<Incidents />} />
      </Route>
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  )
}
