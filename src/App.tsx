import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import VerticalLanding from './pages/VerticalLanding'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Testimonials from './pages/Testimonials'
import CollectionLinks from './pages/CollectionLinks'
import Settings from './pages/Settings'
import Widget from './pages/Widget'
import Analytics from './pages/Analytics'
import NpsDashboard from './pages/NpsDashboard'
import TestimonialForm from './pages/TestimonialForm'
import WallOfLove from './pages/WallOfLove'
import NpsForm from './pages/NpsForm'
import ComparisonPage from './pages/ComparisonPage'
import Legal from './pages/Legal'
import NotFound from './pages/NotFound'
import AuthGuard from './components/AuthGuard'
import { ToastProvider } from './components/Toast'

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/para/:vertical" element={<VerticalLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/t/:slug" element={<TestimonialForm />} />
          <Route path="/nps/:slug" element={<NpsForm />} />
          <Route path="/vs" element={<ComparisonPage />} />
          <Route path="/vs/:competitor" element={<ComparisonPage />} />
          <Route path="/wall/:slug" element={<WallOfLove />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Legal pages */}
          <Route path="/legal" element={<Legal />} />
          <Route path="/legal/:page" element={<Legal />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/dashboard/testimonials" element={<AuthGuard><Testimonials /></AuthGuard>} />
          <Route path="/dashboard/links" element={<AuthGuard><CollectionLinks /></AuthGuard>} />
          <Route path="/dashboard/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          <Route path="/dashboard/widget" element={<AuthGuard><Widget /></AuthGuard>} />
          <Route path="/dashboard/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/dashboard/nps" element={<AuthGuard><NpsDashboard /></AuthGuard>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
