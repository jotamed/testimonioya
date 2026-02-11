import { useEffect, useState } from 'react'
import { AlertCircle, Clock, MessageSquare, CheckCircle, XCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, RecoveryCase } from '../lib/supabase'
import { useUserPlan } from '../lib/useUserPlan'

export default function RecoveryCases() {
  const [_business, setBusiness] = useState<Business | null>(null)
  const [cases, setCases] = useState<RecoveryCase[]>([])
  const [loading, setLoading] = useState(true)
  const { plan } = useUserPlan()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get current business
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: allBiz, error: bizErr }) => {
          if (bizErr || !allBiz?.length) return { data: null }
          const savedId = localStorage.getItem('testimonioya_current_business')
          const biz = allBiz.find((b: any) => b.id === savedId) || allBiz[0]
          return { data: biz }
        })

      if (!biz) return
      setBusiness(biz)

      // Load recovery cases
      const { data: casesData } = await supabase
        .from('recovery_cases')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })

      setCases(casesData || [])
    } catch (error) {
      console.error('Error loading cases:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if Business plan
  if (plan !== 'business') {
    return (
      <DashboardLayout>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Feature disponible en plan Business
              </h3>
              <p className="text-sm text-amber-700">
                El Recovery Flow para gestionar clientes detractores está disponible solo en el plan Business.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </DashboardLayout>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'in_progress':
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Nuevo'
      case 'in_progress':
        return 'En progreso'
      case 'resolved':
        return 'Resuelto'
      case 'closed':
        return 'Cerrado'
      default:
        return status
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Casos de Recuperación</h1>
          <p className="text-gray-500 mt-1">
            Gestiona clientes detractores y mejora su experiencia
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Abiertos', count: cases.filter(c => c.status === 'open').length, color: 'orange' },
            { label: 'En progreso', count: cases.filter(c => c.status === 'in_progress').length, color: 'blue' },
            { label: 'Resueltos', count: cases.filter(c => c.status === 'resolved').length, color: 'green' },
            { label: 'Total', count: cases.length, color: 'gray' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Cases List */}
        {cases.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay casos aún
            </h3>
            <p className="text-gray-500">
              Los casos de recuperación aparecerán cuando recibas respuestas NPS de detractores.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Mensajes
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cases.map((case_) => (
                    <tr key={case_.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {case_.customer_name || 'Anónimo'}
                          </p>
                          {case_.customer_email && (
                            <p className="text-sm text-gray-500">{case_.customer_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(case_.status)}
                          <span className="text-sm font-medium">
                            {getStatusLabel(case_.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {case_.messages.length} mensaje{case_.messages.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(case_.created_at).toLocaleDateString('es', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          onClick={() => {
                            // TODO: Open case detail modal
                            alert('Case detail view - To be implemented in Phase 4')
                          }}
                        >
                          Ver detalles →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
