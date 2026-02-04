import { ReactNode, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, MessageCircle, Link as LinkIcon, Settings, Code, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/testimonials"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard/testimonials')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Testimonios</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/links"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard/links')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <LinkIcon className="h-5 w-5" />
                    <span className="font-medium">Enlaces</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/widget"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard/widget')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Code className="h-5 w-5" />
                    <span className="font-medium">Widget</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/settings"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard/settings')
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Configuración</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
