import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import VerticalLanding from './pages/VerticalLanding'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Testimonials from './pages/Testimonials'
import CollectionLinks from './pages/CollectionLinks'
import Settings from './pages/Settings'
import Widget from './pages/Widget'
import Analytics from './pages/Analytics'
import TestimonialForm from './pages/TestimonialForm'
import WallOfLove from './pages/WallOfLove'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/para/:vertical" element={<VerticalLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/t/:slug" element={<TestimonialForm />} />
        <Route path="/wall/:slug" element={<WallOfLove />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/dashboard/testimonials" element={<AuthGuard><Testimonials /></AuthGuard>} />
        <Route path="/dashboard/links" element={<AuthGuard><CollectionLinks /></AuthGuard>} />
        <Route path="/dashboard/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="/dashboard/widget" element={<AuthGuard><Widget /></AuthGuard>} />
        <Route path="/dashboard/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
      </Routes>
    </Router>
  )
}

export default App
