import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface NpsBadgeProps {
  score: number
  totalResponses?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'compact' | 'minimal'
  showLabel?: boolean
  animated?: boolean
}

export default function NpsBadge({ 
  score, 
  totalResponses,
  size = 'md',
  variant = 'full',
  showLabel = true,
  animated = true
}: NpsBadgeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }

    // Animate score counting up
    const duration = 1000
    const steps = 30
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if ((score >= 0 && current >= score) || (score < 0 && current <= score)) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animated])

  // Color based on NPS score
  const getColor = (s: number) => {
    if (s >= 50) return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' }
    if (s >= 0) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' }
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' }
  }

  const colors = getColor(score)

  // Size classes
  const sizeClasses = {
    sm: { container: 'px-2 py-1', score: 'text-lg', label: 'text-xs' },
    md: { container: 'px-3 py-2', score: 'text-2xl', label: 'text-sm' },
    lg: { container: 'px-4 py-3', score: 'text-4xl', label: 'text-base' },
  }

  const sizes = sizeClasses[size]

  // Trend icon
  const TrendIcon = score >= 50 ? TrendingUp : score >= 0 ? Minus : TrendingDown

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center space-x-1 ${colors.text}`}>
        <span className={`font-bold ${sizes.score}`}>
          {displayScore >= 0 ? '+' : ''}{displayScore}
        </span>
        {showLabel && <span className={sizes.label}>NPS</span>}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-2 ${colors.light} rounded-full ${sizes.container}`}>
        <div className={`h-2 w-2 rounded-full ${colors.bg}`} />
        <span className={`font-bold ${colors.text}`}>
          NPS {displayScore >= 0 ? '+' : ''}{displayScore}
        </span>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`inline-flex items-center space-x-3 bg-white border border-gray-200 rounded-xl ${sizes.container} shadow-sm`}>
      {/* Score circle */}
      <div className={`relative h-14 w-14 rounded-full ${colors.light} flex items-center justify-center`}>
        <div className={`absolute inset-1 rounded-full ${colors.bg} opacity-20`} />
        <span className={`font-bold ${colors.text} ${sizes.score} relative z-10`}>
          {displayScore >= 0 ? '+' : ''}{displayScore}
        </span>
      </div>
      
      {/* Label and meta */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-gray-900">NPS Score</span>
          <TrendIcon className={`h-4 w-4 ${colors.text}`} />
        </div>
        {totalResponses && (
          <span className="text-xs text-gray-500">
            {totalResponses} respuestas
          </span>
        )}
        <div className="flex items-center space-x-1 mt-0.5">
          <svg className="h-3 w-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-green-600 font-medium">Verificado</span>
        </div>
      </div>
    </div>
  )
}

// Embeddable widget version
export function NpsBadgeWidget({ 
  businessSlug,
  size = 'md',
  variant = 'full'
}: { 
  businessSlug: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'compact' | 'minimal'
}) {
  const [data, setData] = useState<{ score: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch NPS data from API
    fetch(`/api/nps/${businessSlug}`)
      .then(r => r.json())
      .then(d => {
        setData({ score: d.score, total: d.total })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [businessSlug])

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-16 w-40" />
    )
  }

  if (!data) return null

  return (
    <NpsBadge 
      score={data.score} 
      totalResponses={data.total}
      size={size}
      variant={variant}
    />
  )
}
