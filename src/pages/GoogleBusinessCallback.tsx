import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function GoogleBusinessCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setErrorMsg('Acceso denegado. No se ha conectado Google Business.')
      return
    }

    if (!code || !stateParam) {
      setStatus('error')
      setErrorMsg('Parámetros inválidos.')
      return
    }

    try {
      const state = JSON.parse(atob(stateParam))
      const { businessId } = state

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setStatus('error')
        setErrorMsg('No hay sesión activa. Inicia sesión primero.')
        return
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://wnmfanhejnrtfccemlai.supabase.co'}/functions/v1/google-business-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc',
          },
          body: JSON.stringify({ action: 'exchange', code, businessId }),
        }
      )

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setStatus('success')
      setTimeout(() => navigate('/dashboard/reviews'), 2000)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Error al conectar con Google Business')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Conectando con Google Business...</h2>
            <p className="text-gray-500">Espera un momento</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Conectado!</h2>
            <p className="text-gray-500">Google Business conectado correctamente. Redirigiendo a Reseñas...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-500 mb-4">{errorMsg}</p>
            <button
              onClick={() => navigate('/dashboard/reviews')}
              className="btn-primary"
            >
              Volver a Reseñas
            </button>
          </>
        )}
      </div>
    </div>
  )
}
