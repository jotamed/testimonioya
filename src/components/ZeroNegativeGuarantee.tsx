import { Shield, Check, AlertTriangle } from 'lucide-react'

interface ZeroNegativeGuaranteeProps {
  variant?: 'banner' | 'card' | 'inline'
  showDetails?: boolean
}

export default function ZeroNegativeGuarantee({ 
  variant = 'card',
  showDetails = true 
}: ZeroNegativeGuaranteeProps) {
  
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-3">
          <Shield className="h-5 w-5" />
          <p className="font-medium">
            Cero testimonios malos. <span className="font-normal opacity-90">Solo los promotores (NPS 9-10) dejan testimonio público.</span>
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
        <Shield className="h-4 w-4" />
        <span>Cero testimonios malos garantizado</span>
      </div>
    )
  }

  // Card variant (default)
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 md:p-8">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Cero testimonios malos. Garantizado.
          </h3>
          <p className="text-gray-600 mb-4">
            Con el sistema NPS-First, solo tus clientes más felices (promotores 9-10) 
            dejan testimonio público. Los demás te dan feedback privado.
          </p>
          
          {showDetails && (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-600">0-6</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Detractores → Feedback privado</p>
                  <p className="text-sm text-gray-500">Tu equipo lo ve primero. Salvas la relación.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">7-8</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pasivos → Sugerencias internas</p>
                  <p className="text-sm text-gray-500">Mejora continua. No se publica.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-600">9-10</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Promotores → Testimonio público</p>
                  <p className="text-sm text-gray-500">Solo estos van a tu Wall of Love.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Comparison */}
      <div className="mt-6 pt-6 border-t border-green-200">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 mb-2">❌ Sin filtrado NPS</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Pides a todos tus clientes</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Cliente insatisfecho = reseña negativa</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Daño público a tu reputación</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600 mb-2">✅ Con TestimonioYa</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Filtras con NPS primero</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Solo promotores dan testimonio</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Detractores van a feedback privado</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Standalone widget for embedding
export function ZeroNegativeBadge() {
  return (
    <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
      <Shield className="h-5 w-5" />
      <span className="font-semibold">Cero testimonios malos</span>
      <span className="text-green-200">|</span>
      <span className="text-sm text-green-100">Garantizado por NPS</span>
    </div>
  )
}
