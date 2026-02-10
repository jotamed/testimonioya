import { useEffect, useState } from 'react'
import { Star, Plus, Search } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import ReviewCard from '../components/ReviewCard'
import ReviewStats from '../components/ReviewStats'
import ReviewReplyModal from '../components/ReviewReplyModal'
import AddReviewModal from '../components/AddReviewModal'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { useBusinesses } from '../lib/useBusinesses'
import { useUserPlan } from '../lib/useUserPlan'
import { supabase } from '../lib/supabase'
import { hasFeature } from '../lib/plans'

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
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Review | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<number>(0)
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
  }, [currentBusiness, canUseReviews])

  const loadReviews = async () => {
    if (!currentBusiness) return
    setLoading(true)
    const { data, error } = await supabase
      .from('external_reviews')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('review_date', { ascending: false })

    if (error) {
      toastError('Error al cargar reseñas')
    } else {
      setReviews(data || [])
    }
    setLoading(false)
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
      })
      .select()
      .single()

    if (error) {
      toastError('Error al añadir reseña')
      throw error
    }

    setReviews((prev) => [data, ...prev])
    toastSuccess('Reseña añadida')
  }

  const filteredReviews = reviews.filter((r) => {
    if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false
    if (filterRating > 0 && r.rating !== filterRating) return false
    if (searchQuery && !r.author_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(r.review_text || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const platforms = [...new Set(reviews.map((r) => r.platform))]

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
            <p className="text-sm text-gray-400">
              Disponible en los planes <span className="font-medium text-indigo-600">Pro</span> y <span className="font-medium text-purple-600">Business</span>
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-32" />)}
            </div>
            {[1, 2, 3].map((i) => <LoadingSkeleton key={i} className="h-36" />)}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-12 w-12 text-gray-300" />}
            title="Sin reseñas todavía"
            description="Añade tus primeras reseñas manualmente o conecta Google para importarlas automáticamente."
            action={{
              label: 'Añadir primera reseña',
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          <>
            <ReviewStats reviews={reviews} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por autor o texto..."
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="input-field w-auto"
                >
                  <option value="all">Todas las plataformas</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="input-field w-auto"
                >
                  <option value={0}>Todas las estrellas</option>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>{'⭐'.repeat(s)} ({s})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No hay reseñas que coincidan con los filtros
                </p>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={setReplyingTo}
                  />
                ))
              )}
            </div>
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
