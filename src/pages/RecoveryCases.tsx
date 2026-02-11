import { useEffect, useState } from 'react'
import { AlertCircle, Clock, MessageSquare, CheckCircle, XCircle, Send, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, RecoveryCase } from '../lib/supabase'
import { useUserPlan } from '../lib/useUserPlan'

export default function RecoveryCases() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [cases, setCases] = useState<RecoveryCase[]>([])
  const [loading, setLoading] = useState(true)
  const { plan } = useUserPlan()
  
  // Detail modal state
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedCase) return

    setSubmitting(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No hay sesión activa')
      }

      const { error: replyError } = await supabase.functions.invoke('recovery-reply', {
        body: {
          case_id: selectedCase.id,
          message: replyMessage.trim(),
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (replyError) throw replyError

      // Reload the specific case to get updated messages
      const { data: updatedCase } = await supabase
        .from('recovery_cases')
        .select('*')
        .eq('id', selectedCase.id)
        .single()

      if (updatedCase) {
        setSelectedCase(updatedCase)
        // Also update the cases list
        setCases(prevCases => 
          prevCases.map(c => c.id === updatedCase.id ? updatedCase : c)
        )
      }

      setReplyMessage('')
      setError(null)
    } catch (err: any) {
      console.error('Error sending reply:', err)
      setError(err.message || 'Error al enviar la respuesta')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (caseId: string, newStatus: 'resolved' | 'closed') => {
    try {
      const { error: updateError } = await supabase
        .from('recovery_cases')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId)

      if (updateError) throw updateError

      // Update the cases list
      setCases(prevCases =>
        prevCases.map(c =>
          c.id === caseId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
        )
      )

      // Close modal if case was closed, otherwise update selected case
      if (newStatus === 'closed') {
        setSelectedCase(null)
      } else if (selectedCase?.id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus, updated_at: new Date().toISOString() })
      }
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Error al actualizar el estado')
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

  // Check if recovery flow is enabled
  if (!business?.use_recovery_flow) {
    return (
      <DashboardLayout>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Recovery Flow desactivado
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Activa el Recovery Flow en{' '}
                <a href="/dashboard/settings?tab=collection" className="underline font-medium">
                  Configuración
                </a>
                {' '}para gestionar casos de recuperación de clientes insatisfechos.
              </p>
              <p className="text-xs text-blue-600">
                El Recovery Flow requiere tener el flujo unificado activado.
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
                          onClick={() => setSelectedCase(case_)}
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

      {/* Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Caso: {selectedCase.customer_name || 'Anónimo'}
                </h2>
                {selectedCase.customer_email && (
                  <p className="text-sm text-gray-500 mt-1">{selectedCase.customer_email}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCase(null)
                  setReplyMessage('')
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body - Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedCase.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'business' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'business'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1 opacity-70">
                      {msg.role === 'business' ? business?.business_name || 'Tú' : 'Cliente'}
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-2 ${msg.role === 'business' ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer - Reply Form */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {selectedCase.messages.length >= 5 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Se ha alcanzado el límite de 5 mensajes para este caso.
                  </p>
                </div>
              ) : selectedCase.status === 'closed' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">Este caso está cerrado.</p>
                </div>
              ) : (
                <form onSubmit={handleReply} className="space-y-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Escribe tu respuesta..."
                    required
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {selectedCase.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(selectedCase.id, 'resolved')}
                          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar resuelto
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Cerrar este caso?')) {
                            updateStatus(selectedCase.id, 'closed')
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Cerrar caso
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {selectedCase.messages.length}/5 mensajes utilizados
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
