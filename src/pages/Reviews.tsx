import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus, Search, Check, X, Trash2, Clock, Globe, MapPin, Facebook, MessageSquare, ExternalLink } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import GoogleReviewsConnect from '../components/GoogleReviewsConnect'
import ReviewReplyModal from '../components/ReviewReplyModal'
import AddReviewModal from '../components/AddReviewModal'
import ReviewStats from '../components/ReviewStats'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useToast } from '../components/Toast'
import { useBusinesses } from '../lib/useBusinesses'
import { useUserPlan } from '../lib/useUserPlan'
import { supabase } from '../lib/supabase'
import { hasFeature } from '../lib/plans'

type FilterType = 'all' | 'pending' | 'approved' | 'rejected'
type ReviewStatus = 'pending' | 'approved' | 'rejected'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobadas' },
  { key: 'rejected', label: 'Rechazadas' },
]

interface Review {
  id: string
  business_id: string
  platform: string
  author_name: string
  rating: number
  review_text: string | null
  review_date: string | null
  reply: string | null
  replied_at: string | null
  created_at: string
  approved: boolean
  status: ReviewStatus
}

const platformConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  google: { label: 'Google', icon: Globe, color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  tripadvisor: { label: 'TripAdvisor', icon: MapPin, color: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  manual: { label: 'Manual', icon: MessageSquare, color: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' },
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Review | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { currentBusiness } = useBusinesses()
  const { plan } = useUserPlan()
  const { success: toastSuccess, error: toastError } = useToast()

  const canUseReviews = hasFeature(plan, 'hasReviews')

  useEffect(() => {
    if (currentBusiness && canUseReviews) {
      loadReviews()
    } else {
      setLoading(false)
    }
  }, [currentBusiness, canUseReviews, filter])

  const loadReviews = async () => {
    if (!currentBusiness) return
    setLoading(true)
    let query = supabase
      .from('external_reviews')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('review_date', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query
    if (error) {
      toastError('Error al cargar reseñas')
    } else {
      setReviews(data || [])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: ReviewStatus) => {
    const approved = status === 'approved'
    const { error } = await supabase
      .from('external_reviews')
      .update({ status, approved })
      .eq('id', id)

    if (error) {
      toastError('Error al actualizar')
    } else {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, approved } : r))
      )
      const msg = status === 'approved' ? 'Reseña aprobada — aparecerá en tu widget'
        : status === 'rejected' ? 'Reseña rechazada'
        : 'Reseña marcada como pendiente'
      toastSuccess(msg)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    const { error } = await supabase
      .from('external_reviews')
      .delete()
      .eq('id', id)

    if (error) {
      toastError('Error al eliminar')
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toastSuccess('Reseña eliminada')
    }
  }

  const handleReply = async (reviewId: string, reply: string) => {
    const { error } = await supabase
      .from('external_reviews')
      .update({ reply, replied_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (error) {
      toastError('Error al guardar respuesta')
      throw error
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, reply, replied_at: new Date().toISOString() } : r
      )
    )
    toastSuccess('Respuesta guardada')
  }

  const handleAddReview = async (review: {
    platform: string
    author_name: string
    rating: number
    review_text: string
    review_date: string
  }) => {
    if (!currentBusiness) return

    const { data, error } = await supabase
      .from('external_reviews')
      .insert({
        business_id: currentBusiness.id,
        ...review,
        review_date: new Date(review.review_date).toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      toastError('Error al añadir reseña')
      throw error
    }

    setReviews((prev) => [data, ...prev])
    toastSuccess('Reseña añadida como pendiente')
  }

  const filteredReviews = reviews.filter((r) => {
    if (searchQuery && !r.author_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(r.review_text || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const googlePlaceId = (currentBusiness as any)?.google_place_id
  const googleReplyUrl = googlePlaceId
    ? `https://business.google.com/reviews?place_id=${googlePlaceId}`
    : null

  const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona las reseñas de tu negocio en plataformas externas
            </p>
          </div>
          {canUseReviews && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Añadir reseña</span>
            </button>
          )}
        </div>

        {/* Google Reviews Connection */}
        {canUseReviews && currentBusiness && (
          <GoogleReviewsConnect
            businessId={currentBusiness.id}
            googlePlaceId={(currentBusiness as any).google_place_id}
            googlePlaceName={(currentBusiness as any).google_place_name}
            googlePlaceAddress={(currentBusiness as any).google_place_address}
            googleBusinessLocation={(currentBusiness as any).google_business_location}
            lastSynced={(currentBusiness as any).reviews_last_synced}
            autoSync={(currentBusiness as any).reviews_auto_sync ?? false}
            onSync={loadReviews}
          />
        )}

        {!canUseReviews ? (
          <div className="card text-center py-12">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Gestión de reseñas externas
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Centraliza las reseñas de Google, TripAdvisor y otras plataformas.
              Responde desde un solo lugar y monitoriza tu reputación online.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Disponible en los planes <span className="font-medium text-indigo-600">Pro</span> y <span className="font-medium text-purple-600">Business</span>
            </p>
            <Link
              to="/dashboard/settings?tab=billing"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>Ver planes y hacer upgrade</span>
              <span>→</span>
            </Link>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <>
            {reviews.length > 0 && <ReviewStats reviews={reviews} />}

            {/* Filter Pills — same style as Testimonials */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl overflow-x-auto flex-nowrap">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      filter === f.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por autor o texto..."
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {filter === 'all' ? 'Sin reseñas todavía' : 'No hay reseñas'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {filter === 'all'
                    ? 'Conecta Google arriba para importar reseñas, o añade una manualmente.'
                    : `No hay reseñas con estado "${filter === 'pending' ? 'pendiente' : filter === 'approved' ? 'aprobada' : 'rechazada'}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((review) => {
                  const platform = platformConfig[review.platform] || platformConfig.manual
                  const PlatformIcon = platform.icon

                  return (
                    <div
                      key={review.id}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-semibold">
                                  {review.author_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {review.author_name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {review.review_date && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(review.review_date)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Stars */}
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              {/* Status badge — same as testimonials */}
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  review.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    : review.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                    : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                }`}
                              >
                                {review.status === 'approved'
                                  ? '✓ Aprobada'
                                  : review.status === 'pending'
                                  ? '● Pendiente'
                                  : '✗ Rechazada'}
                              </span>
                              {/* Platform badge */}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${platform.color}`}>
                                <PlatformIcon className="h-3 w-3" />
                                {platform.label}
                              </span>
                            </div>
                          </div>

                          {/* Review text */}
                          {review.review_text && (
                            <p className="text-gray-700 leading-relaxed mb-3">{review.review_text}</p>
                          )}

                          {/* Reply */}
                          {review.reply && (
                            <div className="pl-4 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg p-3 mb-3">
                              <p className="text-xs font-medium text-indigo-600 mb-1">Tu nota interna</p>
                              <p className="text-sm text-gray-700">{review.reply}</p>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            {googleReplyUrl && review.platform === 'google' && (
                              <a
                                href={googleReplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Responder en Google
                              </a>
                            )}
                            <button
                              onClick={() => setReplyingTo(review)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {review.reply ? 'Editar nota' : 'Añadir nota'}
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="inline-flex items-center gap-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                              Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Actions — same layout as Testimonials */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(review.id, 'approved')}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm font-medium"
                              >
                                <Check className="h-4 w-4" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => updateStatus(review.id, 'rejected')}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all text-sm font-medium"
                              >
                                <X className="h-4 w-4" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          )}

                          {review.status === 'approved' && (
                            <button
                              onClick={() => updateStatus(review.id, 'rejected')}
                              className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all text-sm font-medium"
                            >
                              <X className="h-4 w-4" />
                              <span>Rechazar</span>
                            </button>
                          )}

                          {review.status === 'rejected' && (
                            <button
                              onClick={() => updateStatus(review.id, 'approved')}
                              className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm font-medium"
                            >
                              <Check className="h-4 w-4" />
                              <span>Aprobar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {replyingTo && (
        <ReviewReplyModal
          review={replyingTo}
          onClose={() => setReplyingTo(null)}
          onSave={handleReply}
        />
      )}

      {showAddModal && (
        <AddReviewModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddReview}
        />
      )}
    </DashboardLayout>
  )
}
