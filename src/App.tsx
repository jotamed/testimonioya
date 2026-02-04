import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Testimonials from './pages/Testimonials'
import CollectionLinks from './pages/CollectionLinks'
import Settings from './pages/Settings'
import Widget from './pages/Widget'
import TestimonialForm from './pages/TestimonialForm'
import WallOfLove from './pages/WallOfLove'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/testimonials" element={<Testimonials />} />
        <Route path="/dashboard/links" element={<CollectionLinks />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/widget" element={<Widget />} />
        <Route path="/t/:slug" element={<TestimonialForm />} />
        <Route path="/wall/:slug" element={<WallOfLove />} />
      </Routes>
    </Router>
  )
}

export default App
