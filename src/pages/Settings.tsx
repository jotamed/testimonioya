import { useEffect, useState } from 'react'
import { 
  Save, Crown, Check, Mic, Video, Palette, 
  Key, Download, 
  MessageSquare, Lock, Settings2, CreditCard,
  Receipt, ExternalLink, Loader2, AlertCircle, Shield,
  Trash2, Mail, Eye, EyeOff, Bell
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../components/Toast'
import { supabase, Business } from '../lib/supabase'
import { PLANS } from '../lib/stripe'
import { PlanType } from '../lib/plans'
import { useUserPlan } from '../lib/useUserPlan'
import TwoFactorSetup from '../components/TwoFactorSetup'
import { SUPPORTED_LANGUAGES } from '../lib/i18n'

type SettingsTab = 'general' | 'notifications' | 'nps' | 'branding' | 'security' | 'billing'

export default function Settings() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    const validTabs: SettingsTab[] = ['general', 'notifications', 'nps', 'branding', 'security', 'billing']
    return validTabs.includes(tab as SettingsTab) ? (tab as SettingsTab) : 'general'
  })
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    website: '',
    brand_color: '#4f46e5',
    welcome_message: '',
    allow_audio_testimonials: true,
    allow_video_testimonials: true,
    // Notification preferences
    notify_new_testimonial: true,
    notify_nps_response: true,
    notify_weekly_digest: false,
    notify_monthly_report: false,
    // NPS Settings
    // Email Settings
    // Branding
    logo_url: '',
    google_reviews_url: '',
    google_reviews_nps_threshold: 9,
    google_reviews_star_threshold: 4,
    default_language: 'es',
  })
  const [_apiKey, _setApiKey] = useState<string | null>(null)
  const [_generatingKey, _setGeneratingKey] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)
  
  // Security state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // 2FA state
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(true)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [disablingMfa, setDisablingMfa] = useState(false)
  
  const navigate = useNavigate()
  const toast = useToast()
  const { plan: userPlan } = useUserPlan()

  const plan = userPlan
  const isPro = plan === 'pro' || plan === 'business'
  const isBusiness = plan === 'business'

  useEffect(() => {
    loadData()
    loadMfaStatus()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserEmail(user.email || '')

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
        setFormData({
          business_name: businessData.business_name,
          industry: businessData.industry || '',
          website: businessData.website || '',
          brand_color: businessData.brand_color,
          welcome_message: businessData.welcome_message,
          allow_audio_testimonials: businessData.allow_audio_testimonials ?? true,
          allow_video_testimonials: businessData.allow_video_testimonials ?? true,
          notify_new_testimonial: businessData.notify_new_testimonial ?? true,
          notify_nps_response: businessData.notify_nps_response ?? true,
          notify_weekly_digest: businessData.notify_weekly_digest ?? false,
          notify_monthly_report: businessData.notify_monthly_report ?? false,
          logo_url: businessData.logo_url ?? '',
          google_reviews_url: businessData.google_reviews_url ?? '',
          google_reviews_nps_threshold: businessData.google_reviews_nps_threshold ?? 9,
          google_reviews_star_threshold: businessData.google_reviews_star_threshold ?? 4,
          default_language: businessData.default_language ?? 'es',
        })
        _setApiKey(businessData.api_key || null)
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', business.id)

      if (error) throw error
      toast.success('¡Configuración guardada!')
      loadData()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Error al guardar', 'No se pudieron guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    if (!priceId) {
      toast.error('Error', 'Price ID no configurado')
      return
    }
    setUpgrading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Sesión expirada', 'Vuelve a iniciar sesión')
        navigate('/login')
        return
      }
      const response = await fetch(
        'https://wnmfanhejnrtfccemlai.supabase.co/functions/v1/create-checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc',
          },
          body: JSON.stringify({ priceId }),
        }
      )
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      if (!result.url) throw new Error('No se recibió URL de checkout')
      window.location.href = result.url
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error('Error al iniciar checkout', error.message || 'Inténtalo de nuevo')
    } finally {
      setUpgrading(false)
    }
  }

  const openBillingPortal = async () => {
    setOpeningPortal(true)
    setPortalError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        'https://wnmfanhejnrtfccemlai.supabase.co/functions/v1/create-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubWZhbmhlam5ydGZjY2VtbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY5NjMsImV4cCI6MjA4NTgwMjk2M30.bhTUh5Ks9nWjuMF4qK0og7gVuw7vlMZeaNGi5NJ0crc',
          },
          body: JSON.stringify({ 
            returnUrl: window.location.href 
          }),
        }
      )
      const { url, error } = await response.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (error: any) {
      console.error('Portal error:', error)
      setPortalError(error.message)
    } finally {
      setOpeningPortal(false)
    }
  }

  // Tab configuration
  const tabs: { id: SettingsTab; label: string; icon: any; requiresPlan?: PlanType }[] = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'nps', label: 'NPS', icon: MessageSquare, requiresPlan: 'pro' },
    { id: 'branding', label: 'Marca', icon: Palette, requiresPlan: 'pro' },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'billing', label: 'Plan', icon: Crown },
  ]

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
      setPasswordError('Debe incluir mayúscula, minúscula, número y carácter especial')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') return
    
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://wnmfanhejnrtfccemlai.supabase.co'}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ confirmation: deleteConfirmation }),
        }
      )
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      
      // Sign out and redirect
      await supabase.auth.signOut()
      navigate('/')
    } catch (err: any) {
      toast.error('Error al eliminar cuenta', err.message)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const loadMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (!error && data?.totp && data.totp.length > 0) {
        setMfaEnabled(true)
      }
    } catch (e) {
      console.error('Error loading MFA status:', e)
    } finally {
      setMfaLoading(false)
    }
  }

  const handleDisableMfa = async () => {
    setDisablingMfa(true)
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const factor = data?.totp?.[0]
      if (factor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (error) throw error
        setMfaEnabled(false)
        toast.success('2FA desactivado')
      }
    } catch (err: any) {
      toast.error('Error al desactivar 2FA', err.message)
    } finally {
      setDisablingMfa(false)
    }
  }

  const canAccessTab = (tab: typeof tabs[0]) => {
    if (!tab.requiresPlan) return true
    if (tab.requiresPlan === 'pro') return isPro
    if (tab.requiresPlan === 'business') return isBusiness
    return false
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

  const LockedOverlay = ({ plan: requiredPlan }: { plan: string }) => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center p-6">
        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="font-medium text-gray-900 mb-1">Disponible en plan {requiredPlan}</p>
        <button 
          onClick={() => setActiveTab('billing')}
          className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
        >
          Actualizar plan →
        </button>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración</h1>
          {isPro && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
              <Crown className="h-4 w-4 mr-1" />
              {plan === 'business' ? 'Business' : 'Pro'}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 p-2 space-y-0 lg:space-y-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const accessible = canAccessTab(tab)
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => accessible && setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : accessible 
                          ? 'text-gray-700 hover:bg-gray-50' 
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-2 lg:space-x-3 whitespace-nowrap">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-sm lg:text-base">{tab.label}</span>
                    </div>
                    {!accessible && <Lock className="h-4 w-4" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Datos del negocio</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Industria
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="input-field"
                        placeholder="Restaurante, Clínica..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Sitio Web
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="input-field"
                        placeholder="https://tuempresa.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mensaje de Bienvenida
                    </label>
                    <textarea
                      rows={3}
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      className="input-field"
                      placeholder="¡Gracias por tu tiempo!"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Tipos de testimonio</h3>
                    
                    <ToggleRow
                      icon={Mic}
                      label="Audio testimonios"
                      description="Notas de voz de tus clientes"
                      enabled={formData.allow_audio_testimonials}
                      onChange={(v) => setFormData({ ...formData, allow_audio_testimonials: v })}
                      locked={!isPro}
                    />
                    
                    <ToggleRow
                      icon={Video}
                      label="Video testimonios"
                      description="Videos grabados desde el móvil"
                      enabled={formData.allow_video_testimonials}
                      onChange={(v) => setFormData({ ...formData, allow_video_testimonials: v })}
                      locked={!isPro}
                    />
                  </div>

                  {business && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu Muro Público</label>
                      <code className="block bg-gray-50 px-4 py-2.5 rounded-lg text-sm text-indigo-600 border break-all overflow-hidden">
                        {window.location.origin}/wall/{business.slug}
                      </code>
                    </div>
                  )}

                  {/* Google Reviews URL */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Google Reviews</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        URL de Google Reviews
                      </label>
                      <input
                        type="url"
                        value={formData.google_reviews_url}
                        onChange={(e) => setFormData({ ...formData, google_reviews_url: e.target.value })}
                        className="input-field"
                        placeholder="https://g.page/r/tu-negocio/review"
                      />
                      <p className="mt-1.5 text-xs text-gray-500">
                        Cuando un cliente deje una reseña positiva, le sugeriremos dejar una reseña en Google.
                        Para encontrar tu link: busca tu negocio en Google Maps → Comparte → Copiar enlace.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Recomendar Google Reviews a partir de puntuación NPS:
                        </label>
                        <select
                          value={formData.google_reviews_nps_threshold}
                          onChange={(e) => setFormData({ ...formData, google_reviews_nps_threshold: parseInt(e.target.value) })}
                          className="input-field"
                        >
                          {[7, 8, 9, 10].map((v) => (
                            <option key={v} value={v}>{v}+</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Clientes con NPS ≥ este valor verán la sugerencia de Google Reviews
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Recomendar Google Reviews a partir de estrellas:
                        </label>
                        <select
                          value={formData.google_reviews_star_threshold}
                          onChange={(e) => setFormData({ ...formData, google_reviews_star_threshold: parseInt(e.target.value) })}
                          className="input-field"
                        >
                          {[3, 4, 5].map((v) => (
                            <option key={v} value={v}>{v}+ estrellas</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Testimonios con ≥ estas estrellas verán la sugerencia
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Default Language */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Idioma por defecto</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Idioma de los formularios públicos
                      </label>
                      <select
                        value={formData.default_language}
                        onChange={(e) => setFormData({ ...formData, default_language: e.target.value })}
                        className="input-field"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Se usará si no se detecta el idioma del navegador del cliente. Los formularios se muestran automáticamente en el idioma del visitante.
                      </p>
                    </div>
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}


              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Notificaciones por email</h2>
                    <p className="text-sm text-gray-500 mt-1">Elige qué emails quieres recibir</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">Actividad</h3>
                    
                    <ToggleRow
                      icon={Mail}
                      label="Nuevo testimonio recibido"
                      description="Recibe un email cada vez que un cliente deja un testimonio"
                      enabled={formData.notify_new_testimonial}
                      onChange={(v) => setFormData({ ...formData, notify_new_testimonial: v })}
                    />
                    
                    <ToggleRow
                      icon={MessageSquare}
                      label="Respuesta NPS recibida"
                      description="Recibe un email cuando alguien responde tu encuesta NPS"
                      enabled={formData.notify_nps_response}
                      onChange={(v) => setFormData({ ...formData, notify_nps_response: v })}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">Resúmenes</h3>
                    
                    <ToggleRow
                      icon={Mail}
                      label="Resumen semanal"
                      description="Cada lunes: testimonios recibidos, pendientes y rating medio"
                      enabled={formData.notify_weekly_digest}
                      onChange={(v) => setFormData({ ...formData, notify_weekly_digest: v })}
                    />
                    
                    <ToggleRow
                      icon={Mail}
                      label="Informe mensual"
                      description="El 1 de cada mes: métricas completas con comparación"
                      enabled={formData.notify_monthly_report}
                      onChange={(v) => setFormData({ ...formData, notify_monthly_report: v })}
                    />
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}

              {/* NPS Tab */}
              {activeTab === 'nps' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPro && <LockedOverlay plan="Pro" />}
                  
                  <h2 className="text-xl font-bold text-gray-900">Configuración NPS</h2>

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">Enlaces NPS</h4>
                    <code className="block bg-white px-3 py-2 rounded text-sm text-indigo-600 border border-indigo-200 break-all overflow-hidden">
                      {window.location.origin}/nps/{business?.slug}
                    </code>
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}

              {/* Automation Tab */}
              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPro && <LockedOverlay plan="Pro" />}
                  
                  <h2 className="text-xl font-bold text-gray-900">Personalización de marca</h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Color de Marca
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.brand_color}
                        onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                        className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.brand_color}
                        onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                        className="input-field w-32"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="input-field"
                      placeholder="https://tuempresa.com/logo.png"
                    />
                    {formData.logo_url && (
                      <div className="mt-2">
                        <img src={formData.logo_url} alt="Logo preview" className="h-12 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Live Branding Preview */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="h-10 mx-auto object-contain" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg mx-auto flex items-center justify-center text-white font-bold" style={{ backgroundColor: formData.brand_color }}>
                          {(formData.business_name || 'T')[0].toUpperCase()}
                        </div>
                      )}
                      <p className="font-semibold text-gray-900">{formData.business_name || 'Tu Negocio'}</p>
                      <p className="text-sm text-gray-500">{formData.welcome_message || '¡Cuéntanos tu experiencia!'}</p>
                      <div className="flex justify-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-xl" style={{ color: formData.brand_color }}>★</span>
                        ))}
                      </div>
                      <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: formData.brand_color }}>
                        Enviar testimonio
                      </button>
                    </div>
                  </div>


                  <SaveButton saving={saving} />
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
                        <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nueva contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input-field pr-10"
                            placeholder="Abc123!..."
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="input-field"
                          placeholder="Repite la contraseña"
                          required
                        />
                      </div>

                      {passwordError && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm">
                          <Check className="h-4 w-4" />
                          <span>Contraseña actualizada correctamente</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="btn-primary disabled:opacity-50"
                      >
                        {changingPassword ? 'Guardando...' : 'Cambiar contraseña'}
                      </button>
                    </form>
                  </div>

                  
                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Autenticación en dos pasos (2FA)</h2>
                        <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
                      </div>
                      {!mfaLoading && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {mfaEnabled ? '✓ Activado' : 'Desactivado'}
                        </span>
                      )}
                    </div>

                    {mfaLoading ? (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando estado de 2FA...</span>
                      </div>
                    ) : mfaEnabled ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-green-800">
                            Tu cuenta está protegida con autenticación en dos pasos.
                            Se te pedirá un código TOTP cada vez que inicies sesión.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDisableMfa}
                          disabled={disablingMfa}
                          className="text-red-600 text-sm font-medium hover:text-red-700 disabled:opacity-50"
                        >
                          {disablingMfa ? 'Desactivando...' : 'Desactivar 2FA'}
                        </button>
                      </div>
                    ) : showMfaSetup ? (
                      <TwoFactorSetup
                        onComplete={() => {
                          setShowMfaSetup(false)
                          setMfaEnabled(true)
                          toast.success('¡2FA activado correctamente!')
                        }}
                        onCancel={() => setShowMfaSetup(false)}
                      />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Protege tu cuenta con un código temporal generado por una app como
                          Google Authenticator o Authy.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowMfaSetup(true)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Activar 2FA</span>
                        </button>
                      </div>
                    )}
                  </div>

{/* Email */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Email de la cuenta</h2>
                        <p className="text-sm text-gray-500">Tu dirección de email actual</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{userEmail || 'Cargando...'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Para cambiar tu email, contacta a soporte</p>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-red-900">Eliminar cuenta</h2>
                        <p className="text-sm text-red-700">Esta acción es irreversible</p>
                      </div>
                    </div>

                    <p className="text-sm text-red-800 mb-4">
                      Al eliminar tu cuenta se borrarán permanentemente todos tus datos: 
                      testimonios, respuestas NPS, enlaces, configuración y archivos multimedia.
                      Esta acción no se puede deshacer.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Eliminar mi cuenta
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Account Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
                  <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                        ¿Eliminar cuenta permanentemente?
                      </h3>
                      <p className="text-gray-600 text-center text-sm mb-6">
                        Se eliminarán todos tus testimonios, respuestas NPS, y datos asociados. 
                        Esta acción no se puede deshacer.
                      </p>
                      
                      <div className="mb-6">
                        <label className="block text-sm text-gray-700 mb-2">
                          Escribe <span className="font-mono font-bold text-red-600">ELIMINAR</span> para confirmar:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="ELIMINAR"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteModal(false)
                            setDeleteConfirmation('')
                          }}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'ELIMINAR' || deleting}
                          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting ? 'Eliminando...' : 'Eliminar cuenta'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Plan y Facturación</h2>

                  <div className="grid md:grid-cols-3 gap-4">
                    {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, planInfo]) => {
                      const isCurrent = plan === key
                      const isUpgrade = !isCurrent && key !== 'free'

                      return (
                        <div
                          key={key}
                          className={`rounded-xl border-2 p-5 transition-all ${
                            isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-900">{planInfo.name}</h3>
                            {isCurrent && (
                              <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                ACTUAL
                              </span>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-4">
                            €{planInfo.price}<span className="text-sm font-normal text-gray-500">/mes</span>
                          </p>
                          <ul className="space-y-2 mb-5 text-sm">
                            {planInfo.features.map((f, i) => (
                              <li key={i} className="flex items-center text-gray-600">
                                <Check className="h-3.5 w-3.5 text-green-500 mr-1.5 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          {isUpgrade && planInfo.priceId && (
                            <button
                              type="button"
                              onClick={() => handleUpgrade(planInfo.priceId!)}
                              disabled={upgrading}
                              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {upgrading ? 'Redirigiendo...' : `Upgrade a ${planInfo.name}`}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Billing Portal Section - Only for paying customers */}
                  {isPro && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Portal de Facturación</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Gestiona tu suscripción, método de pago y descarga facturas.
                            </p>
                            
                            {portalError && (
                              <div className="flex items-center space-x-2 text-red-600 text-sm mb-3">
                                <AlertCircle className="h-4 w-4" />
                                <span>{portalError}</span>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-3">
                              <button 
                                type="button" 
                                onClick={openBillingPortal}
                                disabled={openingPortal}
                                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {openingPortal ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Abriendo...</span>
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="h-4 w-4" />
                                    <span>Abrir portal</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick billing info */}
                      <div className="mt-6 pt-4 border-t border-indigo-200 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Plan actual</p>
                          <p className="font-semibold text-gray-900">{plan === 'business' ? 'Business' : 'Pro'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Precio</p>
                          <p className="font-semibold text-gray-900">€{plan === 'business' ? '49' : '19'}/mes</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Estado</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Activo
                          </span>
                        </div>
                      </div>
                      
                      {/* What you can do in portal */}
                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <p className="text-xs text-gray-500 mb-2">En el portal puedes:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                            <Receipt className="h-3 w-3" />
                            <span>Ver facturas</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                            <CreditCard className="h-3 w-3" />
                            <span>Cambiar tarjeta</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                            <Crown className="h-3 w-3" />
                            <span>Cambiar plan</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                            <AlertCircle className="h-3 w-3" />
                            <span>Cancelar</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Export Data */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Download className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">Exportar datos</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Descarga todos tus testimonios y datos NPS en CSV.
                        </p>
                        <button type="button" className="btn-secondary text-sm">
                          Exportar todo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  {isPro && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Zona de peligro</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Para cancelar tu suscripción o eliminar tu cuenta, accede al portal de facturación.
                      </p>
                      <button 
                        type="button" 
                        onClick={openBillingPortal}
                        className="text-red-600 text-sm font-medium hover:text-red-700"
                      >
                        Gestionar en portal →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Helper Components
function ToggleRow({ 
  icon: Icon, 
  label, 
  description, 
  enabled, 
  onChange,
  locked = false 
}: { 
  icon: any
  label: string
  description: string
  enabled: boolean
  onChange: (v: boolean) => void
  locked?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {locked ? (
        <Lock className="h-5 w-5 text-gray-400" />
      ) : (
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            enabled ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      )}
    </div>
  )
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200 mt-6 flex justify-end md:static md:bg-transparent md:backdrop-blur-none md:mx-0 md:px-0">
      <button
        type="submit"
        disabled={saving}
        className="btn-primary flex items-center space-x-2 disabled:opacity-50 w-full md:w-auto justify-center"
      >
        <Save className="h-4 w-4" />
        <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
      </button>
    </div>
  )
}

// Removed unused EmailTemplateRow and IntegrationCard components
