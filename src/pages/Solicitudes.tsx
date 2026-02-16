import { useEffect, useState, useRef } from 'react'
import { Plus, Copy, Check, QrCode, Trash2, AlertTriangle, Download, X, Eye, Send, MessageSquarePlus, Mail, MessageCircle, Edit2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../components/Toast'
import { supabase, Business, CollectionLink } from '../lib/supabase'
import { canCreateCollectionLink } from '../lib/plans'

const SUPABASE_URL = 'https://wnmfanhejnrtfccemlai.supabase.co'

export default function Solicitudes() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [solicitudes, setSolicitudes] = useState<CollectionLink[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<CollectionLink | null>(null)
  const [showQRModal, setShowQRModal] = useState<{ url: string; name: string } | null>(null)
  const [showSendModal, setShowSendModal] = useState<{ solicitud: CollectionLink; channel: 'email' | 'whatsapp' } | null>(null)
  const [newSolicitud, setNewSolicitud] = useState({ name: '', message: '', email_subject: '', email_message: '' })
  const [sendData, setSendData] = useState({ recipient: '' })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [linkLimit, setLinkLimit] = useState<{ allowed: boolean; current: number; limit: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const toast = useToast()
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data: allBiz, error: bizErr }) => {
          if (bizErr || !allBiz?.length) return { data: null, error: bizErr }
          const savedId = localStorage.getItem('testimonioya_current_business')
          const biz = allBiz.find((b: any) => b.id === savedId) || allBiz[0]
          return { data: biz, error: null }
        })

      if (businessData) {
        setBusiness(businessData)

        const { data: linksData } = await supabase
          .from('collection_links')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        setSolicitudes(linksData || [])

        const limitCheck = await canCreateCollectionLink(businessData.id, user.id)
        setLinkLimit(limitCheck)
      }
    } catch (error) {
      console.error('Error loading solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substr(2, 6)
  }

  const getDefaultMessage = (businessName: string) => {
    return `¡Hola! 👋 Soy de ${businessName}. Tu opinión es muy importante para nosotros. ¿Podrías dejarnos un testimonio? Solo toma un minuto:\n\n¡Muchas gracias! 🙏`
  }

  // Get the stored message for a solicitud, or the default
  const getSolicitudMessage = (solicitud: CollectionLink) => {
    return solicitud.whatsapp_message || (business ? getDefaultMessage(business.business_name) : '')
  }

  // Build the final message with the link appended
  const buildFinalMessage = (message: string, url: string) => {
    // If message doesn't contain the URL, append it before the last line
    if (message.includes(url)) return message
    const lines = message.split('\n')
    // Find last non-empty line
    const lastNonEmpty = [...lines].reverse().findIndex(l => l.trim().length > 0)
    if (lastNonEmpty > 0) {
      const insertAt = lines.length - lastNonEmpty
      lines.splice(insertAt, 0, url, '')
      return lines.join('\n')
    }
    return message + '\n\n' + url
  }

  const createSolicitud = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    const limitCheck = await canCreateCollectionLink(business.id, business.user_id)
    if (!limitCheck.allowed) {
      toast.warning('Límite alcanzado', 'Actualiza a Pro para crear solicitudes ilimitadas.')
      setShowCreateModal(false)
      return
    }

    try {
      const slug = generateSlug(newSolicitud.name)
      const { error } = await supabase
        .from('collection_links')
        .insert({
          business_id: business.id,
          name: newSolicitud.name,
          slug,
          whatsapp_message: newSolicitud.message || null,
          email_subject: newSolicitud.email_subject || null,
          email_message: newSolicitud.email_message || null,
        })

      if (error) throw error

      setNewSolicitud({ name: '', message: '', email_subject: '', email_message: '' })
      setShowCreateModal(false)
      toast.success('¡Solicitud creada!', 'Ya puedes empezar a enviarla')
      loadData()
    } catch (error) {
      console.error('Error creating solicitud:', error)
      toast.error('Error al crear la solicitud')
    }
  }

  const updateSolicitud = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return

    try {
      const { error } = await supabase
        .from('collection_links')
        .update({
          name: showEditModal.name,
          whatsapp_message: showEditModal.whatsapp_message || null,
          email_subject: showEditModal.email_subject || null,
          email_message: showEditModal.email_message || null,
        })
        .eq('id', showEditModal.id)

      if (error) throw error

      setShowEditModal(null)
      toast.success('¡Actualizado!', 'Los cambios se guardaron correctamente')
      loadData()
    } catch (error) {
      console.error('Error updating solicitud:', error)
      toast.error('Error al actualizar')
    }
  }

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('collection_links')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteSolicitud = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return

    try {
      const { error } = await supabase
        .from('collection_links')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Eliminada correctamente')
      loadData()
    } catch (error) {
      console.error('Error deleting solicitud:', error)
      toast.error('Error al eliminar')
    }
  }

  const copyToClipboard = (text: string, linkId?: string) => {
    navigator.clipboard.writeText(text)
    if (linkId) {
      setCopiedId(linkId)
      setTimeout(() => setCopiedId(null), 2000)
    }
    toast.success('¡Enlace copiado!')
  }

  const getFullUrl = (slug: string) => {
    return `${window.location.origin}/t/${slug}`
  }

  const handleSend = async () => {
    if (!business || !showSendModal) return
    const { solicitud, channel } = showSendModal
    const url = getFullUrl(solicitud.slug)
    const baseMessage = getSolicitudMessage(solicitud)
    const finalMessage = buildFinalMessage(baseMessage, url)

    setSending(true)
    try {
      if (channel === 'whatsapp') {
        const cleaned = sendData.recipient.replace(/\D/g, '')
        if (cleaned.length < 8) {
          toast.error('Error', 'Ingresa un número válido')
          setSending(false)
          return
        }

        const waUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(finalMessage)}`

        await supabase
          .from('testimonial_requests')
          .insert({ business_id: business.id, channel: 'whatsapp', recipient: cleaned, status: 'sent' })

        const opened = window.open(waUrl, '_blank')
        if (!opened) {
          await navigator.clipboard.writeText(waUrl)
          toast.success('Link copiado', 'No se pudo abrir WhatsApp. El enlace se copió al portapapeles.')
        } else {
          toast.success('¡Listo!', 'Se abrió WhatsApp')
        }
      } else if (channel === 'email') {
        const email = sendData.recipient.trim()
        if (!email.includes('@')) {
          toast.error('Error', 'Ingresa un email válido')
          setSending(false)
          return
        }

        const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc'

        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({
            type: 'request_testimonial',
            to: email,
            data: {
              business_name: business.business_name,
              logo_url: business.logo_url,
              form_url: url,
              custom_message: baseMessage,
              custom_subject: solicitud.email_subject || null,
              custom_body: solicitud.email_message || null,
            },
          }),
        })

        const result = await response.json()
        if (response.ok && !result.error) {
          await supabase
            .from('testimonial_requests')
            .insert({ business_id: business.id, channel: 'email', recipient: email, status: 'sent' })
          toast.success('¡Enviado!', `Email enviado a ${email}`)
        } else {
          toast.error('Error', result.error || 'No se pudo enviar el email')
        }
      }

      setShowSendModal(null)
      setSendData({ recipient: '' })
      loadData()
    } catch (error) {
      console.error('Send error:', error)
      toast.error('Error al enviar')
    } finally {
      setSending(false)
    }
  }

  const downloadQR = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 512, 512)
        ctx.drawImage(img, 0, 0, 512, 512)
      }
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${showQRModal?.name || 'solicitud'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Solicitudes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Pide testimonios por WhatsApp o Email
            </p>
            {linkLimit && linkLimit.limit !== Infinity && (
              <p className="text-xs text-gray-400 mt-1">
                {linkLimit.current} / {linkLimit.limit} solicitudes usadas
              </p>
            )}
          </div>
          {linkLimit && !linkLimit.allowed ? (
            <a
              href="/dashboard/settings?tab=billing"
              className="btn-primary flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            >
              <AlertTriangle className="h-5 w-5" />
              <span>Upgrade</span>
            </a>
          ) : (
            <button
              onClick={() => {
                setNewSolicitud({ 
                  name: '', 
                  message: business ? getDefaultMessage(business.business_name) : '',
                  email_subject: '',
                  email_message: '',
                })
                setShowCreateModal(true)
              }}
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva solicitud</span>
            </button>
          )}
        </div>

        {solicitudes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <MessageSquarePlus className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No tienes solicitudes aún
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Crea tu primera solicitud para comenzar a pedir testimonios
            </p>
            <button
              onClick={() => {
                setNewSolicitud({ 
                  name: '', 
                  message: business ? getDefaultMessage(business.business_name) : '',
                  email_subject: '',
                  email_message: '',
                })
                setShowCreateModal(true)
              }}
              className="btn-primary"
            >
              Crear primera solicitud
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className={`bg-white rounded-xl border-2 p-4 sm:p-5 transition-all ${
                  solicitud.is_active ? 'border-gray-200 hover:border-indigo-200' : 'border-gray-100 opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${solicitud.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <h3 className="font-semibold text-gray-900 truncate">{solicitud.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => setShowEditModal(solicitud)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSolicitud(solicitud.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* URL */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <code className="text-xs text-gray-600 font-mono truncate flex-1">
                    {getFullUrl(solicitud.slug)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(getFullUrl(solicitud.slug), solicitud.id)}
                    className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 ${
                      copiedId === solicitud.id
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    {copiedId === solicitud.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <span className="flex items-center space-x-1.5 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{solicitud.views_count} vistas</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-gray-500">
                    <Send className="h-4 w-4" />
                    <span>{solicitud.submissions_count} testimonios</span>
                  </span>
                  {solicitud.views_count > 0 && (
                    <span className="text-indigo-600 font-medium text-xs">
                      {Math.round((solicitud.submissions_count / solicitud.views_count) * 100)}% conv.
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowSendModal({ solicitud, channel: 'whatsapp' })}
                    disabled={!solicitud.is_active}
                    className="flex items-center space-x-1.5 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setShowSendModal({ solicitud, channel: 'email' })}
                    disabled={!solicitud.is_active}
                    className="flex items-center space-x-1.5 px-3 py-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => setShowQRModal({ url: getFullUrl(solicitud.slug), name: solicitud.name })}
                    className="flex items-center space-x-1.5 px-3 py-2 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>QR</span>
                  </button>
                  <button
                    onClick={() => toggleStatus(solicitud.id, solicitud.is_active)}
                    className={`ml-auto px-3 py-2 rounded-lg text-sm transition-colors ${
                      solicitud.is_active
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {solicitud.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Nueva solicitud</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewSolicitud({ name: '', message: '', email_subject: '', email_message: '' })
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={createSolicitud} className="p-5">
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={newSolicitud.name}
                      onChange={(e) => setNewSolicitud({...newSolicitud, name: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Post-venta, Clientes VIP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mensaje WhatsApp
                    </label>
                    <textarea
                      value={newSolicitud.message}
                      onChange={(e) => setNewSolicitud({...newSolicitud, message: e.target.value})}
                      className="input-field resize-none"
                      rows={4}
                      placeholder={business ? getDefaultMessage(business.business_name) : ''}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      El enlace se añade automáticamente al enviar
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">📧 Personalización de email</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Asunto del email
                        </label>
                        <input
                          type="text"
                          value={newSolicitud.email_subject}
                          onChange={(e) => setNewSolicitud({...newSolicitud, email_subject: e.target.value})}
                          className="input-field"
                          placeholder={business ? `¿Qué tal tu experiencia con ${business.business_name}?` : ''}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cuerpo del email
                        </label>
                        <textarea
                          value={newSolicitud.email_message}
                          onChange={(e) => setNewSolicitud({...newSolicitud, email_message: e.target.value})}
                          className="input-field resize-none"
                          rows={3}
                          placeholder={business ? `Gracias por elegir ${business.business_name}. Tu opinión nos importa mucho — ¿podrías dedicarnos un minuto para contarnos cómo fue tu experiencia?` : ''}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Déjalo vacío para usar el mensaje por defecto
                    </p>
                  </div>

                  {/* Preview */}
                  {business && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vista previa WhatsApp</p>
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {newSolicitud.message || getDefaultMessage(business.business_name)}
                        {'\n\n'}
                        <span className="text-indigo-600 underline">https://testimonioya.com/t/ejemplo</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewSolicitud({ name: '', message: '', email_subject: '', email_message: '' })
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Crear solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Editar solicitud</h2>
                <button onClick={() => setShowEditModal(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={updateSolicitud} className="p-5">
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      required
                      value={showEditModal.name}
                      onChange={(e) => setShowEditModal({...showEditModal, name: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mensaje WhatsApp
                    </label>
                    <textarea
                      value={showEditModal.whatsapp_message || (business ? getDefaultMessage(business.business_name) : '')}
                      onChange={(e) => setShowEditModal({...showEditModal, whatsapp_message: e.target.value})}
                      className="input-field resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      El enlace se añade automáticamente al enviar
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">📧 Personalización de email</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Asunto del email
                        </label>
                        <input
                          type="text"
                          value={showEditModal.email_subject || ''}
                          onChange={(e) => setShowEditModal({...showEditModal, email_subject: e.target.value})}
                          className="input-field"
                          placeholder={business ? `¿Qué tal tu experiencia con ${business.business_name}?` : ''}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cuerpo del email
                        </label>
                        <textarea
                          value={showEditModal.email_message || ''}
                          onChange={(e) => setShowEditModal({...showEditModal, email_message: e.target.value})}
                          className="input-field resize-none"
                          rows={3}
                          placeholder={business ? `Gracias por elegir ${business.business_name}. Tu opinión nos importa mucho — ¿podrías dedicarnos un minuto para contarnos cómo fue tu experiencia?` : ''}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Déjalo vacío para usar el mensaje por defecto
                    </p>
                  </div>

                  {/* Preview */}
                  {business && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Vista previa WhatsApp</p>
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {showEditModal.whatsapp_message || getDefaultMessage(business.business_name)}
                        {'\n\n'}
                        <span className="text-indigo-600 underline">{getFullUrl(showEditModal.slug)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Send Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">
                  Enviar por {showSendModal.channel === 'email' ? 'Email' : 'WhatsApp'}
                </h2>
                <button
                  onClick={() => { setShowSendModal(null); setSendData({ recipient: '' }) }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {showSendModal.channel === 'email' ? 'Email del destinatario' : 'Número de teléfono'}
                  </label>
                  <input
                    type={showSendModal.channel === 'email' ? 'email' : 'tel'}
                    value={sendData.recipient}
                    onChange={(e) => setSendData({ recipient: e.target.value })}
                    className="input-field"
                    placeholder={showSendModal.channel === 'email' ? 'cliente@email.com' : '34612345678'}
                    autoFocus
                  />
                </div>

                {business && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {showSendModal.channel === 'email' ? 'Email que recibirá' : 'Mensaje'}
                    </p>
                    {showSendModal.channel === 'email' ? (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 space-y-2">
                        <p className="font-medium text-gray-900">
                          Asunto: {showSendModal.solicitud.email_subject || `¿Qué tal tu experiencia con ${business.business_name}?`}
                        </p>
                        <hr className="border-gray-200" />
                        <p className="whitespace-pre-line leading-relaxed">
                          {showSendModal.solicitud.email_message || `Gracias por elegir ${business.business_name}. Tu opinión nos importa mucho — ¿podrías dedicarnos un minuto para contarnos cómo fue tu experiencia?`}
                        </p>
                        <div className="text-center mt-3">
                          <span className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-medium">
                            Dejar mi opinión →
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {getSolicitudMessage(showSendModal.solicitud)}
                        {'\n\n'}
                        <span className="text-indigo-600 underline">{getFullUrl(showSendModal.solicitud.slug)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowSendModal(null); setSendData({ recipient: '' }) }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !sendData.recipient.trim()}
                    className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      showSendModal.channel === 'email' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Código QR</h2>
                <button onClick={() => setShowQRModal(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">{showQRModal.name}</p>
                
                <div ref={qrRef} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-center mb-4">
                  <QRCodeSVG 
                    value={showQRModal.url} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="text-xs text-gray-500 text-center mb-4 break-all">
                  {showQRModal.url}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(showQRModal.url)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copiar URL</span>
                  </button>
                  <button
                    onClick={downloadQR}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
