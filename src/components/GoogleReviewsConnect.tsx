import { useState } from 'react'
import { Search, Link2, Unlink, RefreshCw, MapPin, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface GoogleReviewsConnectProps {
  businessId: string
  googlePlaceId: string | null
  lastSynced: string | null
  autoSync: boolean
  onSync: () => void
}

interface PlaceResult {
  place_id: string
  name: string
  address: string
  rating: number
  total_ratings: number
}

export default function GoogleReviewsConnect({
  businessId,
  googlePlaceId,
  lastSynced,
  autoSync: _autoSync,
  onSync,
}: GoogleReviewsConnectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const callEdgeFunction = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No session')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || 'https://wnmfanhejnrtfccemlai.supabase.co'}/functions/v1/sync-google-reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc',
        },
        body: JSON.stringify(body),
      }
    )
    return res.json()
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError(null)
    setResults([])
    try {
      const data = await callEdgeFunction({ action: 'search', query: searchQuery })
      if (data.error) throw new Error(data.error)
      setResults(data.results || [])
      if ((data.results || []).length === 0) {
        setError('No se encontraron resultados. Prueba con otro nombre o dirección.')
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar')
    }
    setSearching(false)
  }

  const handleConnect = async (placeId: string) => {
    setConnecting(true)
    setError(null)
    try {
      const data = await callEdgeFunction({ action: 'connect', businessId, placeId })
      if (data.error) throw new Error(data.error)
      // Auto-sync after connecting
      await handleSync()
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Error al conectar')
    }
    setConnecting(false)
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Desconectar Google? Las reseñas ya importadas se mantienen.')) return
    try {
      await callEdgeFunction({ action: 'disconnect', businessId })
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Error al desconectar')
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setError(null)
    try {
      const data = await callEdgeFunction({ action: 'sync', businessId })
      if (data.error) throw new Error(data.error)
      setSyncResult(data)
      onSync()
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar')
    }
    setSyncing(false)
  }

  if (googlePlaceId) {
    return (
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Google conectado</p>
              <p className="text-sm text-green-700">
                {lastSynced
                  ? `Última sincronización: ${new Date(lastSynced).toLocaleString('es-ES')}`
                  : 'Aún no sincronizado'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-secondary text-sm flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
              title="Desconectar Google"
            >
              <Unlink className="h-4 w-4" />
            </button>
          </div>
        </div>
        {syncResult && (
          <div className="mt-3 text-sm text-green-800 bg-green-100 rounded-lg p-3">
            ✅ {syncResult.imported} reseñas importadas
            {syncResult.skipped > 0 && ` · ${syncResult.skipped} ya existían`}
            {syncResult.overall_rating && ` · Puntuación Google: ${syncResult.overall_rating}⭐ (${syncResult.total_ratings} reseñas)`}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="card border-dashed border-2 border-gray-300 bg-gray-50">
      <div className="text-center py-4">
        <div className="bg-white p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-sm">
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Conecta Google Reviews</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Importa automáticamente las reseñas de Google de tu negocio. Se sincronizarán periódicamente.
        </p>
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="btn-primary"
          >
            <Search className="h-4 w-4 mr-2 inline" />
            Buscar mi negocio en Google
          </button>
        ) : (
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nombre de tu negocio y ciudad..."
                className="input-field flex-1"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="btn-primary px-4"
              >
                {searching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>

            {results.length > 0 && (
              <div className="space-y-2 text-left">
                {results.map((place) => (
                  <div
                    key={place.place_id}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{place.name}</p>
                        <p className="text-sm text-gray-500 flex items-center mt-0.5">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{place.address}</span>
                        </p>
                        {place.rating && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                            {place.rating} ({place.total_ratings} reseñas)
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleConnect(place.place_id)}
                        disabled={connecting}
                        className="btn-primary text-sm whitespace-nowrap"
                      >
                        {connecting ? 'Conectando...' : 'Conectar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={() => {
                setShowSearch(false)
                setResults([])
                setError(null)
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
