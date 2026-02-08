import { useEffect, useState, useRef } from 'react'
import { Plus, Copy, Check, QrCode, ExternalLink, Trash2, AlertTriangle, Download, X, Eye, Send } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../components/Toast'
import { supabase, Business, CollectionLink } from '../lib/supabase'
import { canCreateCollectionLink, PlanType } from '../lib/plans'

export default function CollectionLinks() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [links, setLinks] = useState<CollectionLink[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState<{ url: string; name: string } | null>(null)
  const [newLinkName, setNewLinkName] = useState('')
  const [loading, setLoading] = useState(true)
  const [linkLimit, setLinkLimit] = useState<{ allowed: boolean; current: number; limit: number } | null>(null)
  const toast = useToast()
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load business
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

        // Load links
        const { data: linksData } = await supabase
          .from('collection_links')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false })

        setLinks(linksData || [])

        // Check link limit
        const limitCheck = await canCreateCollectionLink(businessData.id, businessData.plan as PlanType)
        setLinkLimit(limitCheck)
      }
    } catch (error) {
      console.error('Error loading links:', error)
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

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    // Check limit before creating
    const limitCheck = await canCreateCollectionLink(business.id, business.plan as PlanType)
    if (!limitCheck.allowed) {
      toast.warning('Límite alcanzado', 'Actualiza a Pro para crear enlaces ilimitados.')
      setShowCreateModal(false)
      return
    }

    try {
      const slug = generateSlug(newLinkName)
      const { error } = await supabase
        .from('collection_links')
        .insert({
          business_id: business.id,
          name: newLinkName,
          slug,
        })

      if (error) throw error

      setNewLinkName('')
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      console.error('Error creating link:', error)
      toast.error('Error al crear el enlace')
    }
  }

  const toggleLinkStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('collection_links')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error updating link:', error)
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este enlace?')) return

    try {
      const { error } = await supabase
        .from('collection_links')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Error al eliminar el enlace')
    }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)

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
      ctx?.fillStyle && (ctx.fillStyle = '#ffffff')
      ctx?.fillRect(0, 0, 512, 512)
      ctx?.drawImage(img, 0, 0, 512, 512)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${showQRModal?.name || 'testimonio'}.png`
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
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enlaces de Recolección</h1>
            {linkLimit && linkLimit.limit !== Infinity && (
              <p className="text-sm text-gray-500 mt-1">
                {linkLimit.current} / {linkLimit.limit} enlaces usados
              </p>
            )}
          </div>
          {linkLimit && !linkLimit.allowed ? (
            <a
              href="/dashboard/settings"
              className="btn-primary flex items-center space-x-2 bg-amber-600 hover:bg-amber-700"
            >
              <AlertTriangle className="h-5 w-5" />
              <span>Upgrade para más enlaces</span>
            </a>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Enlace</span>
            </button>
          )}
        </div>

        {links.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No tienes enlaces aún
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer enlace para comenzar a recolectar testimonios
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Crear Primer Enlace
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {links.map((link) => (
              <div
                key={link.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all ${
                  link.is_active ? 'border-gray-200 hover:border-indigo-200' : 'border-gray-100 opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${link.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                  </div>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                {/* URL */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <code className="text-xs text-gray-600 font-mono truncate flex-1">
                    {getFullUrl(link.slug)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(getFullUrl(link.slug), link.id)}
                    className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 ${
                      copiedId === link.id
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-200 text-gray-500'
                    }`}
                  >
                    {copiedId === link.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <span className="flex items-center space-x-1.5 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span>{link.views_count} vistas</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-gray-500">
                    <Send className="h-4 w-4" />
                    <span>{link.submissions_count} envíos</span>
                  </span>
                  {link.views_count > 0 && (
                    <span className="text-indigo-600 font-medium text-xs">
                      {Math.round((link.submissions_count / link.views_count) * 100)}% conv.
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <a
                    href={getFullUrl(link.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Abrir</span>
                  </a>
                  <button
                    onClick={() => setShowQRModal({ url: getFullUrl(link.slug), name: link.name })}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>QR</span>
                  </button>
                  <button
                    onClick={() => toggleLinkStatus(link.id, link.is_active)}
                    className={`ml-auto px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      link.is_active
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {link.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Crear Nuevo Enlace
              </h2>
              
              <form onSubmit={createLink}>
                <div className="mb-4">
                  <label htmlFor="linkName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Enlace
                  </label>
                  <input
                    id="linkName"
                    type="text"
                    required
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="input-field"
                    placeholder="Ej: Campaña Verano 2024"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Dale un nombre descriptivo para identificar este enlace
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewLinkName('')
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Crear Enlace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Código QR
                </h2>
                <button
                  onClick={() => setShowQRModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {showQRModal.name}
              </p>
              
              <div ref={qrRef} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center mb-4">
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
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    copyToClipboard(showQRModal.url)
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar URL</span>
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
