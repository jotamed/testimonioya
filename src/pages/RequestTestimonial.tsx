import { useEffect, useState } from 'react'
import { Mail, MessageCircle, Link as LinkIcon, Copy, Check, ExternalLink, Send, Clock, CheckCircle2, Star } from 'lucide-react'
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
  const [emailSuccess, setEmailSuccess] = useState<{ count: number; total: number } | null>(null)
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null)
  const [requests, setRequests] = useState<TestimonialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const testimonialUrl = collectionSlug
    ? `${window.location.origin}/t/${collectionSlug}`
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
        .then(({ data: allBiz, error: bizErr }) => {
          if (bizErr || !allBiz?.length) return { data: null, error: bizErr }
          const savedId = localStorage.getItem('testimonioya_current_business')
          const biz = allBiz.find((b: any) => b.id === savedId) || allBiz[0]
          return { data: biz, error: null }
        })

      if (biz) {
        setBusiness(biz)

        // Get the collection link slug for the testimonial URL
        const { data: links } = await supabase
          .from('collection_links')
          .select('slug')
          .eq('business_id', biz.id)
          .eq('is_active', true)
          .limit(1)

        if (links && links.length > 0) {
          setCollectionSlug(links[0].slug)
        }

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
    setEmailSuccess(null)
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
                form_url: testimonialUrl,
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
        setEmailSuccess({ count: successCount, total: emailList.length })
        toast.success('¡Enviado!', `Se enviaron ${successCount} de ${emailList.length} emails`)
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

    const opened = window.open(waUrl, '_blank')
    if (!opened) {
      // Popup blocked or can't open - copy link instead
      try {
        await navigator.clipboard.writeText(waUrl)
        toast.success('Link copiado', 'No se pudo abrir WhatsApp. El enlace se ha copiado al portapapeles.')
      } catch {
        toast.error('No se pudo abrir WhatsApp', 'Prueba desde el móvil o copia el enlace manualmente.')
      }
    } else {
      toast.success('¡Listo!', 'Se abrió WhatsApp con el mensaje')
    }
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

  const tabs: { key: Channel; label: string; icon: typeof Mail; color: string; activeColor: string }[] = [
    { key: 'email', label: 'Email', icon: Mail, color: 'text-gray-500', activeColor: 'text-indigo-600 border-indigo-600 bg-indigo-50' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-gray-500', activeColor: 'text-green-600 border-green-600 bg-green-50' },
    { key: 'link', label: 'Enlace', icon: LinkIcon, color: 'text-gray-500', activeColor: 'text-indigo-600 border-indigo-600 bg-indigo-50' },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-72 animate-pulse" />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 p-1 gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
              <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse" />
            </div>
          </div>
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedir Testimonio</h1>
          <p className="text-gray-500 mt-1">
            Solicita testimonios a tus clientes por el canal que prefieras
          </p>
        </div>

        {/* Tabs Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 p-1.5 gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setEmailSuccess(null) }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${tab.activeColor} border-b-2 shadow-sm`
                      : `${tab.color} hover:text-gray-700 hover:bg-gray-50`
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="p-6">
            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-5">
                {emailSuccess ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">¡Emails enviados!</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Se enviaron {emailSuccess.count} de {emailSuccess.total} solicitudes correctamente
                    </p>
                    <button
                      onClick={() => setEmailSuccess(null)}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                    >
                      Enviar más solicitudes →
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emails de tus clientes
                      </label>
                      <textarea
                        value={emails}
                        onChange={e => setEmails(e.target.value)}
                        placeholder={'cliente1@email.com\ncliente2@email.com\ncliente3@email.com'}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm transition-shadow hover:border-gray-300"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        Un email por línea, o separados por comas
                      </p>
                    </div>

                    {/* Email Preview */}
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 overflow-hidden">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Vista previa del email</p>
                      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 text-sm space-y-3 overflow-hidden">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Mail className="h-3.5 w-3.5" />
                          <span>De: {business.business_name} via TestimonioYa</span>
                        </div>
                        <hr className="border-gray-100" />
                        <p className="text-gray-900 font-medium">¡Hola! 👋</p>
                        <p className="text-gray-600">
                          En <strong>{business.business_name}</strong> tu opinión es muy importante.
                          ¿Podrías tomarte un minuto para dejarnos tu testimonio?
                        </p>
                        <div className="bg-indigo-50 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center gap-0.5 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <span className="text-indigo-600 font-medium text-xs">Dejar mi testimonio →</span>
                        </div>
                        <p className="text-gray-500 text-xs">¡Muchas gracias! 🙏</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSendEmails}
                      disabled={sending || !emails.trim()}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] font-medium text-sm shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                      <span>{sending ? 'Enviando...' : 'Enviar Solicitud'}</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de teléfono (con código de país)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="5491123456789"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-shadow hover:border-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Ej: 5491123456789 (Argentina) o 573001234567 (Colombia)
                  </p>
                </div>

                {/* WhatsApp Preview */}
                <div className="bg-[#e5ddd5] rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Vista previa del mensaje</p>
                  <div className="bg-white rounded-lg shadow-sm p-3 max-w-sm text-sm">
                    <p className="text-gray-900 whitespace-pre-line">
                      ¡Hola! 👋 Soy de <strong>{business.business_name}</strong>. Tu opinión es muy importante para nosotros. ¿Podrías dejarnos un testimonio? Solo toma un minuto:
                    </p>
                    <p className="text-blue-500 mt-2 text-xs break-all overflow-hidden">{testimonialUrl}</p>
                    <p className="text-gray-900 mt-2">¡Muchas gracias! 🙏</p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">ahora ✓✓</p>
                  </div>
                </div>

                <button
                  onClick={handleWhatsApp}
                  disabled={!phone.trim()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] font-medium text-sm shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            )}

            {/* Link Tab */}
            {activeTab === 'link' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu enlace de testimonios
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={testimonialUrl}
                      className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 text-sm font-mono truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98] shadow-sm ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Comparte este enlace donde quieras: redes sociales, QR, tu web, etc.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request History */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6 pb-0">
              <h2 className="text-lg font-semibold text-gray-900">Historial de Solicitudes</h2>
              <p className="text-sm text-gray-500 mt-0.5">{requests.length} solicitudes enviadas</p>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-100">
                    <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Canal</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Destinatario</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</th>
                    <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wide">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.channel === 'email' ? 'bg-indigo-50 text-indigo-700' :
                          req.channel === 'whatsapp' ? 'bg-green-50 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {req.channel === 'email' && <Mail className="h-3 w-3" />}
                          {req.channel === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                          {req.channel === 'link' && <LinkIcon className="h-3 w-3" />}
                          <span className="capitalize">{req.channel}</span>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-700 font-mono text-xs">
                        {req.recipient || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center space-x-1 text-xs font-medium ${
                          req.status === 'completed' ? 'text-emerald-600' :
                          req.status === 'opened' ? 'text-blue-600' :
                          'text-gray-400'
                        }`}>
                          {req.status === 'completed' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>
                            {req.status === 'sent' ? 'Enviado' :
                             req.status === 'opened' ? 'Abierto' :
                             'Completado'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-400 text-xs tabular-nums">
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
