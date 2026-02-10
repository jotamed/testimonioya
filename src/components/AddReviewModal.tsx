import { useState } from 'react'
import { X, Star } from 'lucide-react'

interface AddReviewModalProps {
  onClose: () => void
  onSave: (review: {
    platform: string
    author_name: string
    rating: number
    review_text: string
    review_date: string
  }) => Promise<void>
}

export default function AddReviewModal({ onClose, onSave }: AddReviewModalProps) {
  const [platform, setPlatform] = useState('google')
  const [authorName, setAuthorName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!authorName.trim()) return
    setSaving(true)
    try {
      await onSave({
        platform,
        author_name: authorName.trim(),
        rating,
        review_text: reviewText.trim(),
        review_date: reviewDate,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 animate-modal">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Añadir reseña</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input-field"
            >
              <option value="google">Google</option>
              <option value="tripadvisor">TripAdvisor</option>
              <option value="facebook">Facebook</option>
              <option value="manual">Otra</option>
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del autor</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="input-field"
              placeholder="María García"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puntuación</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{hoverRating || rating}/5</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la reseña</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Texto de la reseña (opcional)"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!authorName.trim() || saving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Añadir reseña'}
          </button>
        </div>
      </div>
    </div>
  )
}
