import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import { ToastProvider } from './components/Toast'
import CookieConsent from './components/CookieConsent'

// Eagerly load critical pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Testimonials from './pages/Testimonials'
import CollectionLinks from './pages/CollectionLinks'
import Settings from './pages/Settings'
import RequestTestimonial from './pages/RequestTestimonial'
import NpsDashboard from './pages/NpsDashboard'

// Lazy load less-used pages
const VerticalLanding = lazy(() => import('./pages/VerticalLanding'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Widget = lazy(() => import('./pages/Widget'))
const Analytics = lazy(() => import('./pages/Analytics'))
const TestimonialForm = lazy(() => import('./pages/TestimonialForm'))
const WallOfLove = lazy(() => import('./pages/WallOfLove'))
const NpsForm = lazy(() => import('./pages/NpsForm'))
const Legal = lazy(() => import('./pages/Legal'))
const Admin = lazy(() => import('./pages/Admin'))
const BlogList = lazy(() => import('./pages/blog/BlogList'))
const BlogArticle = lazy(() => import('./pages/blog/BlogArticle'))
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
            <Route path="/wall/:slug" element={<WallOfLove />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Blog */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            
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
            <Route path="/dashboard/request" element={<AuthGuard><RequestTestimonial /></AuthGuard>} />
            
            {/* Admin */}
            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </Router>
    </ToastProvider>
  )
}

export default App
