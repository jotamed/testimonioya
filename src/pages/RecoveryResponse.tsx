import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { MessageSquare, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase, RecoveryCase, Business } from '../lib/supabase'

export default function RecoveryResponse() {
  const { caseId } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invalidToken, setInvalidToken] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    loadCase()
  }, [caseId, token])

  const loadCase = async () => {
    try {
      if (!caseId || !token) {
        setInvalidToken(true)
        setLoading(false)
        return
      }

      // Load recovery case (token validation happens when submitting via edge function)
      const { data: caseData, error: caseError } = await supabase
        .from('recovery_cases')
        .select('*')
        .eq('id', caseId)
        .single()

      if (caseError || !caseData) {
        setInvalidToken(true)
        setLoading(false)
        return
      }

      setRecoveryCase(caseData)

      // Load business info
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', caseData.business_id)
        .single()

      if (bizData) {
        setBusiness(bizData)
      }
    } catch (err) {
      console.error('Error loading case:', err)
      setInvalidToken(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !recoveryCase || !caseId || !token) return

    // Check if case is closed
    if (recoveryCase.status === 'closed') {
      setError('Este caso ya está cerrado')
      return
    }

    // Check message limit
    if (recoveryCase.messages.length >= 50) {
      setError('Se ha alcanzado el límite de mensajes para este caso')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Use direct fetch to avoid SDK sending expired JWT in Authorization header
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc'
      const resp = await fetch('https://wnmfanhejnrtfccemlai.supabase.co/functions/v1/recovery-customer-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          case_id: caseId,
          token,
          message: replyMessage.trim(),
        }),
      })

      let data: any = {}
      try { data = await resp.json() } catch {}
      if (!resp.ok || data?.error) {
        throw new Error(data?.error || `Error ${resp.status}`)
      }

      setSubmitted(true)
      setReplyMessage('')
      
      // Reload case to show new message
      await loadCase()
    } catch (err: any) {
      console.error('Error submitting reply:', err)
      setError(err.message || 'Error al enviar tu respuesta. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-indigo-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
          <p className="text-gray-600">
            Este enlace no es válido o ha expirado. Si necesitas ayuda, contacta directamente con el negocio.
          </p>
        </div>
      </div>
    )
  }

  if (!recoveryCase || !business) return null

  const brandColor = business.brand_color || '#4f46e5'
  const isClosed = recoveryCase.status === 'closed'
  const isResolved = recoveryCase.status === 'resolved'
  const maxMessagesReached = recoveryCase.messages.length >= 50

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-16 w-16 rounded-full mb-4"
            style={{ backgroundColor: brandColor + '20' }}
          >
            <MessageSquare className="h-8 w-8" style={{ color: brandColor }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Conversación con {business.business_name}
          </h1>
          <p className="text-gray-600">
            {isClosed
              ? 'Este caso está cerrado'
              : isResolved
              ? 'Este caso ha sido marcado como resuelto'
              : 'Tu feedback es importante para nosotros'}
          </p>
        </div>

        {/* Conversation thread */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="space-y-6">
            {recoveryCase.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'customer'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-medium mb-1 opacity-70">
                    {msg.role === 'customer' ? 'Tú' : business.business_name}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'customer' ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply form */}
        {!isClosed && !maxMessagesReached ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Tu respuesta ha sido enviada. {business.business_name} la recibirá pronto.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu respuesta
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {replyMessage.length}/1000
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !replyMessage.trim()}
                className="w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center space-x-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: brandColor }}
              >
                <Send className="h-5 w-5" />
                <span>{submitting ? 'Enviando...' : 'Enviar respuesta'}</span>
              </button>
            </form>

            <p className="mt-4 text-xs text-center text-gray-500">
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">
              {isClosed
                ? 'Esta conversación ha sido cerrada.'
                : maxMessagesReached
                ? 'Se ha alcanzado el límite de mensajes para esta conversación.'
                : 'Esta conversación ha sido marcada como resuelta.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Si necesitas más ayuda, contacta directamente con {business.business_name}.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            Powered by{' '}
            <a href="https://testimonioya.com" className="text-indigo-600 hover:text-indigo-700">
              TestimonioYa
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
