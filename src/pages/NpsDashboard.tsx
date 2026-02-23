import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, MessageSquare, Calendar, Filter, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, NpsResponse } from '../lib/supabase'
import { useUserPlan } from '../lib/useUserPlan'
import { getPlanLimits } from '../lib/plans'

interface NpsStats {
  total: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number
  responses: NpsResponse[]
  trend: { period: string; score: number; count: number }[]
}

export default function NpsDashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [stats, setStats] = useState<NpsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const { plan } = useUserPlan()
  const hasNps = plan && getPlanLimits(plan).hasNps

  useEffect(() => {
    loadData()
  }, [dateFilter])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: allBiz, error: bizErr }) => {
          if (bizErr || !allBiz?.length) return { data: null, error: bizErr }
          const savedId = localStorage.getItem('testimonioya_current_business')
          const biz = allBiz.find((b: any) => b.id === savedId) || allBiz[0]
          return { data: biz, error: null }
        })

      if (!businessData) return
      setBusiness(businessData)

      let query = supabase
        .from('nps_responses')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false })

      if (dateFilter !== 'all') {
        const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90
        const since = new Date()
        since.setDate(since.getDate() - days)
        query = query.gte('created_at', since.toISOString())
      }

      const { data: responses } = await query
      const all = responses || []

      const promoters = all.filter(r => r.category === 'promoter').length
      const passives = all.filter(r => r.category === 'passive').length
      const detractors = all.filter(r => r.category === 'detractor').length
      const total = all.length
      const npsScore = total > 0
        ? Math.round(((promoters - detractors) / total) * 100)
        : 0

      // Group by week for trend
      const weekMap = new Map<string, { scores: number[]; count: number }>()
      all.forEach(r => {
        const d = new Date(r.created_at)
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        const key = weekStart.toISOString().slice(0, 10)
        if (!weekMap.has(key)) weekMap.set(key, { scores: [], count: 0 })
        const w = weekMap.get(key)!
        w.scores.push(r.score)
        w.count++
      })

      const trend = Array.from(weekMap.entries())
        .map(([period, data]) => {
          const p = data.scores.filter(s => s >= 9).length
          const d = data.scores.filter(s => s <= 6).length
          const t = data.scores.length
          return {
            period,
            score: t > 0 ? Math.round(((p - d) / t) * 100) : 0,
            count: data.count,
          }
        })
        .sort((a, b) => a.period.localeCompare(b.period))

      setStats({ total, promoters, passives, detractors, npsScore, responses: all, trend })
    } catch (error) {
      console.error('Error loading NPS data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasNps) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  Encuesta de satisfacción disponible en planes Pro y Business
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  La encuesta de satisfacción está disponible en planes Pro y Business. Actualiza tu plan para acceder a:
                </p>
                <ul className="text-sm text-amber-700 space-y-1 ml-4 mb-4">
                  <li>• Dashboard de satisfacción con métricas</li>
                  <li>• Flujo unificado: pregunta + testimonio</li>
                  <li>• Análisis de tendencias</li>
                  <li>• Respuestas ilimitadas</li>
                </ul>
                <a
                  href="/dashboard/settings"
                  className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Ver planes →
                </a>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de satisfacción...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!business || !stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontraron datos</p>
        </div>
      </DashboardLayout>
    )
  }

  const npsColor = stats.npsScore >= 50 ? 'text-green-600' : stats.npsScore >= 0 ? 'text-amber-600' : 'text-red-600'
  const npsBg = stats.npsScore >= 50 ? 'bg-green-50 border-green-200' : stats.npsScore >= 0 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
  const npsLabel = stats.npsScore >= 70 ? 'Excelente' : stats.npsScore >= 50 ? 'Muy bueno' : stats.npsScore >= 0 ? 'Aceptable' : 'Necesita mejora'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Satisfacción</h1>
            <p className="text-gray-600 mt-1">Net Promoter Score de {business.business_name}</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="input-field py-2 text-sm"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
        </div>

        {/* NPS Score Hero with Gauge */}
        <div className={`rounded-2xl border-2 p-4 sm:p-8 ${npsBg}`}>
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-gray-600 mb-4">Tu índice de satisfacción</p>
            {/* Semi-circle gauge */}
            <div className="relative w-36 sm:w-48 h-[72px] sm:h-24 mb-2">
              <svg viewBox="0 0 200 100" className="w-full h-full">
                {/* Background arc */}
                <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
                {/* Colored segments */}
                <path d="M 10 100 A 90 90 0 0 1 70 17" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
                <path d="M 70 17 A 90 90 0 0 1 130 17" fill="none" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
                <path d="M 130 17 A 90 90 0 0 1 190 100" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
                {/* Needle */}
                {stats.total > 0 && (() => {
                  const normalized = (stats.npsScore + 100) / 200 // 0 to 1
                  const angle = Math.PI * (1 - normalized) // PI to 0
                  const nx = 100 + 65 * Math.cos(angle)
                  const ny = 100 - 65 * Math.sin(angle)
                  return <line x1="100" y1="100" x2={nx} y2={ny} stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                })()}
                <circle cx="100" cy="100" r="6" fill="#1e1b4b" />
              </svg>
              <div className="absolute inset-0 flex items-end justify-center pb-0">
                <span className={`text-3xl sm:text-4xl font-bold ${npsColor}`}>
                  {stats.total > 0 ? stats.npsScore : '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between w-36 sm:w-48 text-xs text-gray-400 -mt-1 mb-2">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
            <p className={`text-lg font-semibold ${npsColor}`}>{stats.total > 0 ? npsLabel : 'Sin datos aún'}</p>
            <p className="text-sm text-gray-500 mt-1">Basado en {stats.total} respuesta{stats.total !== 1 ? 's' : ''}</p>
          </div>
          
          {/* Horizontal distribution bar */}
          {stats.total > 0 && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex rounded-full overflow-hidden h-3">
                <div className="bg-red-500 transition-all" style={{ width: `${(stats.detractors / stats.total) * 100}%` }} />
                <div className="bg-amber-400 transition-all" style={{ width: `${(stats.passives / stats.total) * 100}%` }} />
                <div className="bg-green-500 transition-all" style={{ width: `${(stats.promoters / stats.total) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5 text-gray-500">
                <span className="text-red-600">{Math.round((stats.detractors / stats.total) * 100)}% insatisfechos</span>
                <span className="text-amber-600">{Math.round((stats.passives / stats.total) * 100)}% pasivos</span>
                <span className="text-green-600">{Math.round((stats.promoters / stats.total) * 100)}% contentos</span>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Clientes contentos</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.promoters}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.promoters / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Puntuación 9-10</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.total > 0 ? Math.round((stats.promoters / stats.total) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Minus className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-gray-900">Pasivos</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">{stats.passives}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.passives / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Puntuación 7-8</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.total > 0 ? Math.round((stats.passives / stats.total) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900">Clientes insatisfechos</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.detractors}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.detractors / stats.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Puntuación 0-6</p>
            <p className="text-lg font-semibold text-gray-900">
              {stats.total > 0 ? Math.round((stats.detractors / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* NPS Trend */}
        {stats.trend.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tendencia NPS</h2>
            <div className="flex items-end space-x-2 h-40">
              {stats.trend.map((week, i) => {
                const height = Math.max(5, Math.abs(week.score))
                const color = week.score >= 50 ? 'bg-green-500' : week.score >= 0 ? 'bg-amber-500' : 'bg-red-500'
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-xs font-medium text-gray-700 mb-1">{week.score}</span>
                    <div
                      className={`w-full ${color} rounded-t-md transition-all`}
                      style={{ height: `${height}%` }}
                      title={`Semana ${week.period}: NPS ${week.score} (${week.count} resp.)`}
                    />
                    <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                      {new Date(week.period).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Responses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Respuestas Recientes
            <span className="ml-2 text-sm font-normal text-gray-500">({stats.total})</span>
          </h2>

          {stats.responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin respuestas NPS aún</h3>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                Comparte tu enlace NPS con tus clientes para empezar a medir su satisfacción
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 max-w-full overflow-hidden">
                <code className="text-sm text-indigo-600 font-mono break-all min-w-0">
                  {window.location.origin}/nps/{business.slug}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/nps/${business.slug}`)
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm shrink-0"
                >
                  Copiar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.responses.slice(0, 20).map((response) => {
                const scoreColor = response.score >= 9 ? 'bg-green-500' : response.score >= 7 ? 'bg-amber-500' : 'bg-red-500'
                const categoryLabel = response.category === 'promoter' ? 'Promotor' : response.category === 'passive' ? 'Pasivo' : 'Detractor'
                const categoryColor = response.category === 'promoter' ? 'text-green-700 bg-green-50' : response.category === 'passive' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'

                return (
                  <div key={response.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`h-10 w-10 ${scoreColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {response.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {response.customer_name || 'Anónimo'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                          {categoryLabel}
                        </span>
                      </div>
                      {response.feedback && (
                        <p className="text-gray-700 text-sm">{response.feedback}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(response.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </span>
                        {response.customer_email && (
                          <span>{response.customer_email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* NPS Explanation */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
          <h3 className="font-bold text-indigo-900 mb-2">¿Qué es el NPS?</h3>
          <p className="text-sm text-indigo-800 mb-3">
            El Net Promoter Score mide la probabilidad de que tus clientes te recomienden. 
            Va de -100 a 100.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-green-700">🟢 &gt;50: Excelente</p>
              <p className="text-gray-600 text-xs">Tus clientes te aman</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-amber-700">🟡 0-50: Bueno</p>
              <p className="text-gray-600 text-xs">Margen de mejora</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium text-red-700">🔴 &lt;0: Crítico</p>
              <p className="text-gray-600 text-xs">Hay que actuar ya</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
