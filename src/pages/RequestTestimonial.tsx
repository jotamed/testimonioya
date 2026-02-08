import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Link as LinkIcon, Copy, Check, ExternalLink, Send, Clock } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'
import { useToast } from '../components/Toast'

type Channel = 'email' | 'whatsapp' | 'link'

interface TestimonialRequest {
  id: string
  channel: Channel
  recipient: string | null
  status: string
  created_at: string
}

const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co'

export default function RequestTestimonial() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState<Channel>('email')
  const [emails, setEmails] = useState('')
  const [phone, setPhone] = useState('')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [requests, setRequests] = useState<TestimonialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const testimonialUrl = business
    ? `${window.location.origin}/t/${business.slug}`
    : ''

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (biz) {
        setBusiness(biz)

        const { data: reqs } = await supabase
          .from('testimonial_requests')
          .select('*')
          .eq('business_id', biz.id)
          .order('created_at', { ascending: false })
          .limit(50)

        setRequests(reqs || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const logRequest = async (channel: Channel, recipient: string | null) => {
    if (!business) return
    try {
      await supabase
        .from('testimonial_requests')
        .insert({ business_id: business.id, channel, recipient, status: 'sent' })
    } catch (e) {
      console.error('Error logging request:', e)
    }
  }

  const handleSendEmails = async () => {
    if (!business) return
    const emailList = emails
      .split(/[,\n]+/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'))

    if (emailList.length === 0) {
      toast.error('Error', 'Ingresa al menos un email válido')
      return
    }

    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Error', 'No autenticado')
        return
      }

      let successCount = 0
      for (const email of emailList) {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              type: 'request_testimonial',
              to: email,
              data: {
                business_name: business.business_name,
                logo_url: business.logo_url,
                testimonial_url: testimonialUrl,
              },
            }),
          })

          const result = await response.json()
          if (!result.error) {
            successCount++
            await logRequest('email', email)
          }
        } catch (e) {
          console.error(`Error sending to ${email}:`, e)
        }
      }

      if (successCount > 0) {
        toast.success(
          '¡Enviado!',
          `Se enviaron ${successCount} de ${emailList.length} emails`
        )
        setEmails('')
        loadData()
      } else {
        toast.error('Error', 'No se pudo enviar ningún email')
      }
    } finally {
      setSending(false)
    }
  }

  const handleWhatsApp = async () => {
    if (!business) return
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 8) {
      toast.error('Error', 'Ingresa un número de teléfono válido')
      return
    }

    const message = `¡Hola! 👋 Soy de ${business.business_name}. Tu opinión es muy importante para nosotros. ¿Podrías dejarnos un testimonio? Solo toma un minuto:\n\n${testimonialUrl}\n\n¡Muchas gracias! 🙏`
    const waUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`

    await logRequest('whatsapp', cleaned)
    loadData()

    window.open(waUrl, '_blank')
    toast.success('¡Listo!', 'Se abrió WhatsApp con el mensaje')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(testimonialUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      await logRequest('link', null)
      loadData()
      toast.success('¡Copiado!', 'Enlace copiado al portapapeles')
    } catch {
      toast.error('Error', 'No se pudo copiar')
    }
  }

  const tabs: { key: Channel; label: string; icon: typeof Mail }[] = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { key: 'link', label: 'Enlace', icon: LinkIcon },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </DashboardLayout>
    )
  }

  if (!business) {
    return (
      <DashboardLayout>
        <p className="text-gray-600">No se encontró el negocio</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedir Testimonio</h1>
        <p className="text-gray-600 mb-8">
          Solicita testimonios a tus clientes por el canal que prefieras.
        </p>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {/* Email Tab */}
            {activeTab === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emails de tus clientes
                </label>
                <textarea
                  value={emails}
                  onChange={e => setEmails(e.target.value)}
                  placeholder={'cliente1@email.com\ncliente2@email.com\ncliente3@email.com'}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Un email por línea, o separados por comas
                </p>
                <button
                  onClick={handleSendEmails}
                  disabled={sending || !emails.trim()}
                  className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>{sending ? 'Enviando...' : 'Enviar Solicitud'}</span>
                </button>
              </div>
            )}

            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de teléfono (con código de país)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="5491123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ej: 5491123456789 (Argentina) o 573001234567 (Colombia)
                </p>
                <button
                  onClick={handleWhatsApp}
                  disabled={!phone.trim()}
                  className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            )}

            {/* Link Tab */}
            {activeTab === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu enlace de testimonios
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={testimonialUrl}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Comparte este enlace donde quieras: redes sociales, QR, tu web, etc.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Request History */}
        {requests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Solicitudes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Canal</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Destinatario</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Estado</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                          req.channel === 'email' ? 'bg-blue-100 text-blue-700' :
                          req.channel === 'whatsapp' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {req.channel === 'email' && <Mail className="h-3 w-3" />}
                          {req.channel === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                          {req.channel === 'link' && <LinkIcon className="h-3 w-3" />}
                          <span className="capitalize">{req.channel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-700">
                        {req.recipient || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center space-x-1 text-xs ${
                          req.status === 'completed' ? 'text-green-600' :
                          req.status === 'opened' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span>
                            {req.status === 'sent' ? 'Enviado' :
                             req.status === 'opened' ? 'Abierto' :
                             'Completado'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {new Date(req.created_at).toLocaleDateString('es', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
