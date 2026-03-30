import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Submissions from './pages/Submissions'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import OperatorLayout from './components/OperatorLayout'
import OperatorOverview from './pages/operator/OperatorOverview'
import OperatorCampaigns from './pages/operator/OperatorCampaigns'
import CreateCampaign from './pages/operator/CreateCampaign'
import ReviewSubmissions from './pages/operator/ReviewSubmissions'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── CREATOR ROUTES ── */}
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ── OPERATOR ROUTES ── */}
          <Route path="/operator" element={<PrivateRoute><OperatorLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/operator/overview" replace />} />
            <Route path="overview" element={<OperatorOverview />} />
            <Route path="campaigns" element={<OperatorCampaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="create" element={<CreateCampaign />} />
            <Route path="review" element={<ReviewSubmissions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
