import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import { ToastProvider } from './components/Toast'

// Eagerly load Landing (critical path)
import Landing from './pages/Landing'

// Lazy load everything else
const VerticalLanding = lazy(() => import('./pages/VerticalLanding'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const CollectionLinks = lazy(() => import('./pages/CollectionLinks'))
const Settings = lazy(() => import('./pages/Settings'))
const Widget = lazy(() => import('./pages/Widget'))
const Analytics = lazy(() => import('./pages/Analytics'))
const NpsDashboard = lazy(() => import('./pages/NpsDashboard'))
const TestimonialForm = lazy(() => import('./pages/TestimonialForm'))
const WallOfLove = lazy(() => import('./pages/WallOfLove'))
const NpsForm = lazy(() => import('./pages/NpsForm'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const Legal = lazy(() => import('./pages/Legal'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <MessageSquare className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-3" />
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
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
            
            {/* Admin */}
            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  )
}

export default App
