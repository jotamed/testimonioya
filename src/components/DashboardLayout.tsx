import { ReactNode, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, MessageCircle, Link as LinkIcon, Settings, Code, LogOut, ChevronDown, Plus, Building2, BarChart3, Target, Send, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useBusinesses } from '../lib/useBusinesses'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [authLoading, setAuthLoading] = useState(true)
  const [showBusinessMenu, setShowBusinessMenu] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [createError, setCreateError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const { businesses, currentBusiness, loading: bizLoading, canCreate, switchBusiness, createBusiness } = useBusinesses()

  useEffect(() => {
    checkUser()
  }, [])

  const loading = authLoading || bizLoading

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
    }
    setAuthLoading(false)
  }

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    
    const result = await createBusiness(newBusinessName)
    if (result.success) {
      setShowCreateModal(false)
      setNewBusinessName('')
      window.location.reload() // Reload to refresh all data
    } else {
      setCreateError(result.error || 'Error al crear negocio')
    }
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">TestimonioYa</span>
              </Link>
              
              {/* Business Selector */}
              {businesses.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBusinessMenu(!showBusinessMenu)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900 max-w-32 truncate">
                      {currentBusiness?.business_name || 'Seleccionar'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {showBusinessMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-2">
                        <p className="text-xs text-gray-500 px-2 py-1">Tus negocios</p>
                        {businesses.map((biz) => (
                          <button
                            key={biz.id}
                            onClick={() => {
                              switchBusiness(biz.id)
                              setShowBusinessMenu(false)
                              window.location.reload()
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              currentBusiness?.id === biz.id
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{biz.business_name}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                              biz.plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                              biz.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {biz.plan}
                            </span>
                          </button>
                        ))}
                        
                        {canCreate && (
                          <>
                            <hr className="my-2" />
                            <button
                              onClick={() => {
                                setShowBusinessMenu(false)
                                setShowCreateModal(true)
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-indigo-600 flex items-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Añadir negocio</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {currentBusiness && (
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {currentBusiness.business_name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crear Nuevo Negocio
            </h2>
            
            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {createError}
              </div>
            )}
            
            <form onSubmit={handleCreateBusiness}>
              <div className="mb-4">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Mi Nuevo Negocio"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewBusinessName('')
                    setCreateError('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-200 ease-in-out pt-20 px-4 pb-4
            md:relative md:inset-auto md:z-auto md:w-64 md:shadow-none md:bg-transparent md:transform-none md:pt-0 md:px-0 md:pb-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ul className="space-y-1">
                {[
                  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', onClick: () => setSidebarOpen(false) },
                  { to: '/dashboard/testimonials', icon: MessageCircle, label: 'Testimonios' },
                  { to: '/dashboard/request', icon: Send, label: 'Pedir Testimonio' },
                  { to: '/dashboard/links', icon: LinkIcon, label: 'Enlaces' },
                  { to: '/dashboard/widget', icon: Code, label: 'Widget' },
                  { to: '/dashboard/nps', icon: Target, label: 'NPS' },
                  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analíticas', badge: 'Premium' },
                  { to: '/dashboard/settings', icon: Settings, label: 'Configuración' },
                ].map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={item.onClick}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                          active
                            ? 'bg-indigo-50 text-indigo-600 border-l-[3px] border-indigo-600 pl-[13px]'
                            : 'text-gray-700 hover:bg-gray-50 border-l-[3px] border-transparent pl-[13px]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
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
