import { useState } from 'react'
import { Star, MessageSquare, Globe, MapPin, Facebook, Clock } from 'lucide-react'

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

interface ReviewCardProps {
  review: Review
  onReply: (review: Review) => void
}

const platformConfig: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  google: { label: 'Google', icon: Globe, color: 'text-blue-600 bg-blue-50' },
  tripadvisor: { label: 'TripAdvisor', icon: MapPin, color: 'text-green-600 bg-green-50' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-700 bg-blue-50' },
  manual: { label: 'Manual', icon: MessageSquare, color: 'text-gray-600 bg-gray-50' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const platform = platformConfig[review.platform] || platformConfig.manual
  const PlatformIcon = platform.icon
  const isLong = (review.review_text?.length || 0) > 200

  const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            {review.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.author_name}</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <StarRating rating={review.rating} />
              {review.review_date && (
                <span className="text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(review.review_date)}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${platform.color}`}>
          <PlatformIcon className="h-3 w-3" />
          <span>{platform.label}</span>
        </span>
      </div>

      {review.review_text && (
        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            {isLong && !expanded
              ? review.review_text.slice(0, 200) + '...'
              : review.review_text}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-indigo-600 text-xs font-medium mt-1 hover:underline"
            >
              {expanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      )}

      {review.reply && (
        <div className="mt-3 pl-4 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg p-3">
          <p className="text-xs font-medium text-indigo-600 mb-1">Tu respuesta</p>
          <p className="text-sm text-gray-700">{review.reply}</p>
          {review.replied_at && (
            <p className="text-xs text-gray-400 mt-1">{formatDate(review.replied_at)}</p>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onReply(review)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{review.reply ? 'Editar respuesta' : 'Responder'}</span>
        </button>
      </div>
    </div>
  )
}
