import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ReviewStatsProps {
  reviews: Array<{ rating: number; review_date: string | null }>
}

export default function ReviewStats({ reviews }: ReviewStatsProps) {
  const total = reviews.length
  const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total > 0 ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
  }))

  // Trend: compare last 30 days vs previous 30 days
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const recent = reviews.filter((r) => r.review_date && now - new Date(r.review_date).getTime() < thirtyDays)
  const previous = reviews.filter(
    (r) => r.review_date && now - new Date(r.review_date).getTime() >= thirtyDays && now - new Date(r.review_date).getTime() < thirtyDays * 2
  )
  const recentAvg = recent.length > 0 ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : 0
  const prevAvg = previous.length > 0 ? previous.reduce((s, r) => s + r.rating, 0) / previous.length : 0
  const trendDiff = recentAvg - prevAvg

  const TrendIcon = trendDiff > 0.2 ? TrendingUp : trendDiff < -0.2 ? TrendingDown : Minus
  const trendColor = trendDiff > 0.2 ? 'text-green-600' : trendDiff < -0.2 ? 'text-red-600' : 'text-gray-400'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Average */}
      <div className="card text-center">
        <p className="text-sm text-gray-500 mb-1">Puntuación media</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-3xl font-bold text-gray-900">{average.toFixed(1)}</span>
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        </div>
        <p className="text-xs text-gray-400 mt-1">{total} reseña{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Distribution */}
      <div className="card">
        <p className="text-sm text-gray-500 mb-2">Distribución</p>
        <div className="space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center space-x-2 text-xs">
              <span className="w-3 text-gray-600 font-medium">{d.star}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-6 text-right text-gray-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend */}
      <div className="card text-center">
        <p className="text-sm text-gray-500 mb-1">Tendencia (30 días)</p>
        <div className="flex items-center justify-center space-x-2">
          <TrendIcon className={`h-6 w-6 ${trendColor}`} />
          <span className={`text-2xl font-bold ${trendColor}`}>
            {recent.length > 0 ? recentAvg.toFixed(1) : '—'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {recent.length} reseña{recent.length !== 1 ? 's' : ''} reciente{recent.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
