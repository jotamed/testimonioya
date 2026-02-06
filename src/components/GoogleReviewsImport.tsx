import { useState } from 'react'
import { Search, Download, Check, AlertCircle, Star, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url?: string
  relative_time_description?: string
}

interface GoogleReviewsImportProps {
  businessId: string
  onImportComplete?: (count: number) => void
}

export default function GoogleReviewsImport({ 
  businessId,
  onImportComplete 
}: GoogleReviewsImportProps) {
  const [_placeId, setPlaceId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [_imported, setImported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'search' | 'select' | 'done'>('search')

  // Search for place
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setError(null)
    
    try {
      // In production, this would call your backend which calls Google Places API
      // For now, we'll show a demo flow
      
      // Simulated API call
      await new Promise(r => setTimeout(r, 1000))
      
      // Demo: If they enter a Place ID directly (starts with ChIJ)
      if (searchQuery.startsWith('ChIJ')) {
        setPlaceId(searchQuery)
        // Fetch reviews for this place
        await fetchReviews(searchQuery)
      } else {
        // Show error - need Place ID or proper search
        setError('Para importar, necesitas el Place ID de Google. Búscalo en Google Maps → Compartir → "Insertar un mapa" y copia el ID.')
      }
    } catch (err) {
      setError('Error al buscar. Inténtalo de nuevo.')
    } finally {
      setSearching(false)
    }
  }

  const fetchReviews = async (_pid: string) => {
    // In production: call backend → Google Places API
    // Demo data for now
    const demoReviews: GoogleReview[] = [
      {
        author_name: 'María López',
        rating: 5,
        text: 'Excelente servicio, muy profesionales. Volveré sin duda.',
        time: Date.now() / 1000 - 86400 * 7,
        relative_time_description: 'hace una semana'
      },
      {
        author_name: 'Carlos Ruiz',
        rating: 5,
        text: 'La mejor experiencia que he tenido. El equipo es increíble y el resultado superó mis expectativas.',
        time: Date.now() / 1000 - 86400 * 14,
        relative_time_description: 'hace 2 semanas'
      },
      {
        author_name: 'Ana García',
        rating: 4,
        text: 'Muy buen trato y calidad. Recomendado.',
        time: Date.now() / 1000 - 86400 * 30,
        relative_time_description: 'hace un mes'
      },
      {
        author_name: 'Pedro Martínez',
        rating: 5,
        text: 'Fantástico. Atención personalizada y resultados excelentes.',
        time: Date.now() / 1000 - 86400 * 45,
        relative_time_description: 'hace 2 meses'
      },
    ]
    
    setReviews(demoReviews)
    setSelectedReviews(new Set(demoReviews.map((_, i) => i)))
    setStep('select')
  }

  const toggleReview = (index: number) => {
    const newSelected = new Set(selectedReviews)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedReviews(newSelected)
  }

  const handleImport = async () => {
    if (selectedReviews.size === 0) return
    
    setImporting(true)
    setError(null)

    try {
      const reviewsToImport = reviews.filter((_, i) => selectedReviews.has(i))
      
      // Insert as testimonials
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert(
          reviewsToImport.map(review => ({
            business_id: businessId,
            customer_name: review.author_name,
            text_content: review.text,
            rating: review.rating,
            source: 'google',
            status: 'approved', // Auto-approve imported reviews
            created_at: new Date(review.time * 1000).toISOString()
          }))
        )

      if (insertError) throw insertError

      setImported(true)
      setStep('done')
      onImportComplete?.(reviewsToImport.length)
    } catch (err) {
      console.error('Import error:', err)
      setError('Error al importar. Inténtalo de nuevo.')
    } finally {
      setImporting(false)
    }
  }

  // Step 3: Done
  if (step === 'done') {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ¡Importación completada!
        </h3>
        <p className="text-gray-600 mb-4">
          Se importaron {selectedReviews.size} reseñas de Google
        </p>
        <button
          onClick={() => {
            setStep('search')
            setReviews([])
            setSelectedReviews(new Set())
            setPlaceId('')
            setSearchQuery('')
            setImported(false)
          }}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Importar más reseñas
        </button>
      </div>
    )
  }

  // Step 2: Select reviews
  if (step === 'select') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Selecciona las reseñas a importar
          </h3>
          <button
            onClick={() => setStep('search')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Cambiar búsqueda
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {reviews.map((review, index) => (
            <div 
              key={index}
              onClick={() => toggleReview(index)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedReviews.has(index) 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{review.author_name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.relative_time_description}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  selectedReviews.has(index) 
                    ? 'border-indigo-500 bg-indigo-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedReviews.has(index) && <Check className="h-3 w-3 text-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-500">
            {selectedReviews.size} de {reviews.length} seleccionadas
          </span>
          <button
            onClick={handleImport}
            disabled={selectedReviews.size === 0 || importing}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Importar seleccionadas</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Step 1: Search
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Importar reseñas de Google
        </h3>
        <p className="text-sm text-gray-500">
          Trae tus reseñas existentes de Google My Business
        </p>
      </div>

      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ingresa tu Place ID de Google..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {searching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span>Buscar</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">¿Cómo encontrar tu Place ID?</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Ve a <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Google Place ID Finder</a></li>
          <li>Busca tu negocio en el mapa</li>
          <li>Copia el Place ID (empieza con "ChIJ...")</li>
          <li>Pégalo aquí arriba</li>
        </ol>
      </div>
    </div>
  )
}
