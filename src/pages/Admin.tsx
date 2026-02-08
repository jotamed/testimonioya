import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Users, Crown, Star, MessageCircle, Eye, ArrowLeft,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, UserPlus, Loader2, Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface UserRow {
  user_id: string
  email: string
  created_at: string
  businesses: {
    id: string
    business_name: string
    plan: string
    testimonials_count: number
    slug: string
    created_at: string
  }[]
  is_active: boolean
}

interface Stats {
  totalUsers: number
  proUsers: number
  premiumUsers: number
  totalTestimonials: number
  totalBusinesses: number
}

const FAKE_NAMES = ['Café El Aroma', 'Clínica Dental Sonrisa', 'Taller AutoPro', 'Restaurante La Mesa', 'Yoga Studio Zen']
const FAKE_TESTIMONIALS = [
  { name: 'María García', text: 'Excelente servicio, 100% recomendado. Volveré sin duda.', rating: 5 },
  { name: 'Carlos López', text: 'Muy buena atención al cliente. El producto superó mis expectativas.', rating: 5 },
  { name: 'Ana Martínez', text: 'Profesionales y amables. La experiencia fue muy positiva.', rating: 4 },
  { name: 'Pedro Sánchez', text: 'Buen servicio en general, aunque el tiempo de espera podría mejorar.', rating: 4 },
  { name: 'Laura Rodríguez', text: 'Increíble experiencia. El equipo es muy profesional y atento.', rating: 5 },
  { name: 'Diego Fernández', text: 'Relación calidad-precio inmejorable. Muy satisfecho.', rating: 4 },
]

export default function Admin() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, proUsers: 0, premiumUsers: 0, totalTestimonials: 0, totalBusinesses: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [creatingTest, setCreatingTest] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Get all businesses with their data
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Admin query error:', error)
        // If RLS blocks, we need a service role or admin policy
        setLoading(false)
        return
      }

      // Get all testimonials count per business
      const { data: testimonials } = await supabase
        .from('testimonials')
        .select('business_id')

      const testimonialCounts: Record<string, number> = {}
      testimonials?.forEach(t => {
        testimonialCounts[t.business_id] = (testimonialCounts[t.business_id] || 0) + 1
      })

      // Group businesses by user_id
      const userMap = new Map<string, UserRow>()
      businesses?.forEach(biz => {
        if (!userMap.has(biz.user_id)) {
          userMap.set(biz.user_id, {
            user_id: biz.user_id,
            email: '', // We'll try to get this
            created_at: biz.created_at,
            businesses: [],
            is_active: true,
          })
        }
        const user = userMap.get(biz.user_id)!
        user.businesses.push({
          id: biz.id,
          business_name: biz.business_name,
          plan: biz.plan,
          testimonials_count: testimonialCounts[biz.id] || biz.testimonials_count || 0,
          slug: biz.slug,
          created_at: biz.created_at,
        })
      })

      // Try to get user emails from businesses or auth metadata
      // Since we can't query auth.users directly from client, we'll use the business data
      // In a real scenario, you'd have a server function for this
      const userList = Array.from(userMap.values())

      // Calculate stats
      const allBusinesses = businesses || []
      const totalTestimonials = Object.values(testimonialCounts).reduce((a, b) => a + b, 0)

      setStats({
        totalUsers: userList.length,
        proUsers: allBusinesses.filter(b => b.plan === 'pro').length,
        premiumUsers: allBusinesses.filter(b => b.plan === 'premium').length,
        totalTestimonials,
        totalBusinesses: allBusinesses.length,
      })

      setUsers(userList)
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const changePlan = async (businessId: string, newPlan: string) => {
    setActionLoading(businessId + '-plan')
    const { error } = await supabase
      .from('businesses')
      .update({ plan: newPlan })
      .eq('id', businessId)

    if (!error) {
      setUsers(prev => prev.map(u => ({
        ...u,
        businesses: u.businesses.map(b =>
          b.id === businessId ? { ...b, plan: newPlan } : b
        )
      })))
    }
    setActionLoading(null)
  }

  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    setActionLoading(userId + '-toggle')
    // Toggle by updating all businesses for this user
    // In production, you'd have a user-level active flag
    const user = users.find(u => u.user_id === userId)
    if (user) {
      for (const biz of user.businesses) {
        await supabase
          .from('businesses')
          .update({ plan: currentActive ? 'free' : user.businesses[0].plan })
          .eq('id', biz.id)
      }
      setUsers(prev => prev.map(u =>
        u.user_id === userId ? { ...u, is_active: !currentActive } : u
      ))
    }
    setActionLoading(null)
  }

  const createTestUser = async () => {
    setCreatingTest(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const randomName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
      const slug = randomName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const timestamp = Date.now()

      // Create a test business under current admin user
      const { data: newBiz, error: bizError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          business_name: `[TEST] ${randomName}`,
          slug: `test-${slug}-${timestamp}`,
          industry: 'demo',
          plan: 'pro',
          welcome_message: '¡Gracias por tu opinión! Este es un negocio de prueba.',
          brand_color: '#4f46e5',
        })
        .select()
        .single()

      if (bizError) {
        console.error('Error creating test business:', bizError)
        setCreatingTest(false)
        return
      }

      // Create fake testimonials
      const fakeTestimonials = FAKE_TESTIMONIALS.map(t => ({
        business_id: newBiz.id,
        customer_name: t.name,
        customer_email: `${t.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        text_content: t.text,
        rating: t.rating,
        status: Math.random() > 0.2 ? 'approved' : 'pending',
        source: 'form',
        is_featured: Math.random() > 0.6,
      }))

      await supabase.from('testimonials').insert(fakeTestimonials)

      // Update count
      await supabase
        .from('businesses')
        .update({ testimonials_count: fakeTestimonials.length })
        .eq('id', newBiz.id)

      // Create a collection link
      await supabase.from('collection_links').insert({
        business_id: newBiz.id,
        slug: `test-link-${timestamp}`,
        name: 'Enlace de prueba',
        campaign_type: 'general',
        is_active: true,
      })

      // Reload data
      await loadAdminData()
    } catch (err) {
      console.error('Error creating test user:', err)
    } finally {
      setCreatingTest(false)
    }
  }

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.businesses.some(b => b.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const planBadge = (plan: string) => {
    const styles: Record<string, string> = {
      premium: 'bg-purple-100 text-purple-700',
      pro: 'bg-indigo-100 text-indigo-700',
      free: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[plan] || styles.free}`}>
        {plan}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando panel admin...</p>
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
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <ShieldCheck className="h-7 w-7 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={createTestUser}
              disabled={creatingTest}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {creatingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>{creatingTest ? 'Creando...' : 'Create Test User'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Usuarios</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Star className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.proUsers}</p>
                <p className="text-xs text-gray-500">Pro</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTestimonials}</p>
                <p className="text-xs text-gray-500">Testimonios</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</p>
                <p className="text-xs text-gray-500">Negocios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, nombre de negocio o ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios Registrados ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <div key={user.user_id} className="hover:bg-gray-50 transition-colors">
                  {/* User Row */}
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email || user.user_id.slice(0, 12) + '...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('es-ES')} · {user.businesses.length} negocio(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {user.businesses.map(b => (
                        <span key={b.id}>{planBadge(b.plan)}</span>
                      ))}
                      <span className="text-sm text-gray-500">
                        {user.businesses.reduce((sum, b) => sum + b.testimonials_count, 0)} testimonios
                      </span>
                      {expandedUser === user.user_id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUser === user.user_id && (
                    <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="pt-4 space-y-3">
                        <p className="text-xs text-gray-500 font-mono">User ID: {user.user_id}</p>

                        {user.businesses.map(biz => (
                          <div key={biz.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{biz.business_name}</h4>
                                <p className="text-xs text-gray-500">/{biz.slug} · {biz.testimonials_count} testimonios</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* Plan Selector */}
                                <select
                                  value={biz.plan}
                                  onChange={e => changePlan(biz.id, e.target.value)}
                                  disabled={actionLoading === biz.id + '-plan'}
                                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                  <option value="free">Free</option>
                                  <option value="pro">Pro</option>
                                  <option value="premium">Premium</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleUserActive(user.user_id, user.is_active)
                            }}
                            disabled={actionLoading === user.user_id + '-toggle'}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              user.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {user.is_active ? (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                <span>Activar</span>
                              </>
                            )}
                          </button>

                          <Link
                            to="/dashboard"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Dashboard</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
