import { useEffect, useState } from 'react'
import { 
  Save, Crown, Check, Mic, Video, Palette, 
  Key, Webhook, Users, Building2, Download, 
  MessageSquare, Zap, Lock, Settings2, CreditCard,
  Receipt, ExternalLink, Loader2, AlertCircle, Shield,
  Trash2, Mail, Eye, EyeOff
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'
import { PLANS } from '../lib/stripe'
import { PlanType } from '../lib/plans'

type SettingsTab = 'general' | 'nps' | 'automation' | 'branding' | 'integrations' | 'team' | 'security' | 'billing'

export default function Settings() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    website: '',
    brand_color: '#4f46e5',
    welcome_message: '',
    allow_audio_testimonials: true,
    allow_video_testimonials: true,
    // NPS Settings
    nps_delay_hours: 24,
    nps_reminder_days: 3,
    nps_auto_send: false,
    // Email Settings
    email_from_name: '',
    email_reply_to: '',
    // Branding
    logo_url: '',
    custom_domain: '',
  })
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
  
  const navigate = useNavigate()

  const plan = (business?.plan || 'free') as PlanType
  const isPro = plan === 'pro' || plan === 'premium'
  const isPremium = plan === 'premium'

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
        .single()

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
          nps_delay_hours: businessData.nps_delay_hours ?? 24,
          nps_reminder_days: businessData.nps_reminder_days ?? 3,
          nps_auto_send: businessData.nps_auto_send ?? false,
          email_from_name: businessData.email_from_name ?? '',
          email_reply_to: businessData.email_reply_to ?? '',
          logo_url: businessData.logo_url ?? '',
          custom_domain: businessData.custom_domain ?? '',
        })
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
      alert('¡Configuración guardada!')
      loadData()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    setUpgrading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://wnmfanhejnrtfccemlai.supabase.co'}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ priceId }),
        }
      )
      const { url, error } = await response.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (error: any) {
      alert('Error: ' + error.message)
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
        `${import.meta.env.VITE_SUPABASE_URL || 'https://wnmfanhejnrtfccemlai.supabase.co'}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
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
    { id: 'nps', label: 'NPS', icon: MessageSquare, requiresPlan: 'pro' },
    { id: 'automation', label: 'Automatización', icon: Zap, requiresPlan: 'pro' },
    { id: 'branding', label: 'Marca', icon: Palette, requiresPlan: 'pro' },
    { id: 'integrations', label: 'Integraciones', icon: Webhook, requiresPlan: 'premium' },
    { id: 'team', label: 'Equipo', icon: Users, requiresPlan: 'premium' },
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
      alert('Error: ' + err.message)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const canAccessTab = (tab: typeof tabs[0]) => {
    if (!tab.requiresPlan) return true
    if (tab.requiresPlan === 'pro') return isPro
    if (tab.requiresPlan === 'premium') return isPremium
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
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          {isPro && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
              <Crown className="h-4 w-4 mr-1" />
              {plan === 'premium' ? 'Premium' : 'Pro'}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
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
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
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
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
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
                      <code className="block bg-gray-50 px-4 py-2.5 rounded-lg text-sm text-indigo-600 border">
                        {window.location.origin}/wall/{business.slug}
                      </code>
                    </div>
                  )}

                  <SaveButton saving={saving} />
                </div>
              )}

              {/* NPS Tab */}
              {activeTab === 'nps' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPro && <LockedOverlay plan="Pro" />}
                  
                  <h2 className="text-xl font-bold text-gray-900">Configuración NPS</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enviar NPS después de
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={formData.nps_delay_hours}
                          onChange={(e) => setFormData({ ...formData, nps_delay_hours: parseInt(e.target.value) })}
                          className="input-field w-24"
                        />
                        <span className="text-gray-500">horas post-compra</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Reminder si no responde
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={formData.nps_reminder_days}
                          onChange={(e) => setFormData({ ...formData, nps_reminder_days: parseInt(e.target.value) })}
                          className="input-field w-24"
                        />
                        <span className="text-gray-500">días después</span>
                      </div>
                    </div>
                  </div>

                  <ToggleRow
                    icon={Zap}
                    label="Envío automático de NPS"
                    description="Enviar NPS automáticamente tras recibir un webhook"
                    enabled={formData.nps_auto_send}
                    onChange={(v) => setFormData({ ...formData, nps_auto_send: v })}
                  />

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="font-medium text-indigo-900 mb-2">Enlaces NPS</h4>
                    <code className="block bg-white px-3 py-2 rounded text-sm text-indigo-600 border border-indigo-200">
                      {window.location.origin}/nps/{business?.slug}
                    </code>
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}

              {/* Automation Tab */}
              {activeTab === 'automation' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPro && <LockedOverlay plan="Pro" />}
                  
                  <h2 className="text-xl font-bold text-gray-900">Email Automation</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nombre del remitente
                      </label>
                      <input
                        type="text"
                        value={formData.email_from_name}
                        onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
                        className="input-field"
                        placeholder={formData.business_name || 'Tu Negocio'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email de respuesta
                      </label>
                      <input
                        type="email"
                        value={formData.email_reply_to}
                        onChange={(e) => setFormData({ ...formData, email_reply_to: e.target.value })}
                        className="input-field"
                        placeholder="hola@tuempresa.com"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Templates de email</h4>
                    <div className="space-y-2">
                      <EmailTemplateRow title="Solicitud NPS" description="Email inicial pidiendo puntuación" />
                      <EmailTemplateRow title="Reminder NPS" description="Recordatorio si no responde" />
                      <EmailTemplateRow title="Gracias promotor" description="Confirmación de testimonio recibido" />
                    </div>
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}

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

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dominio personalizado
                      {!isPremium && <span className="ml-2 text-xs text-gray-400">(Premium)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.custom_domain}
                      onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
                      className="input-field"
                      placeholder="testimonios.tuempresa.com"
                      disabled={!isPremium}
                    />
                    {!isPremium && (
                      <p className="text-xs text-gray-400 mt-1">Actualiza a Premium para usar tu propio dominio</p>
                    )}
                  </div>

                  <SaveButton saving={saving} />
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPremium && <LockedOverlay plan="Premium" />}
                  
                  <h2 className="text-xl font-bold text-gray-900">Integraciones</h2>

                  <div className="space-y-4">
                    <IntegrationCard 
                      name="API Keys"
                      description="Acceso programático a tus datos"
                      icon={Key}
                      status="Configurar"
                    />
                    <IntegrationCard 
                      name="Webhooks"
                      description="Recibe eventos en tu servidor"
                      icon={Webhook}
                      status="Configurar"
                    />
                    <IntegrationCard 
                      name="Zapier"
                      description="Conecta con 5000+ apps"
                      icon={Zap}
                      status="Próximamente"
                      disabled
                    />
                    <IntegrationCard 
                      name="Stripe"
                      description="Trigger NPS tras pago"
                      icon={Building2}
                      status="Próximamente"
                      disabled
                    />
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 relative">
                  {!isPremium && <LockedOverlay plan="Premium" />}
                  
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Equipo</h2>
                    <button type="button" className="btn-secondary text-sm">
                      + Invitar miembro
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Miembro</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Rol</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">TU</span>
                              </div>
                              <span className="text-sm text-gray-900">Tú (Owner)</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">Admin</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Activo
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Security Tab */}
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
                            placeholder="Mínimo 6 caracteres"
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
                        <p className="font-medium text-gray-900">{business?.user_id ? 'email@ejemplo.com' : 'Cargando...'}</p>
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
                      const isCurrent = business?.plan === key
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
                          <p className="font-semibold text-gray-900">{plan === 'premium' ? 'Premium' : 'Pro'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Precio</p>
                          <p className="font-semibold text-gray-900">€{plan === 'premium' ? '49' : '19'}/mes</p>
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
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      )}
    </div>
  )
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <div className="flex justify-end pt-4 border-t border-gray-200">
      <button
        type="submit"
        disabled={saving}
        className="btn-primary flex items-center space-x-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
      </button>
    </div>
  )
}

function EmailTemplateRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div>
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button type="button" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
        Editar
      </button>
    </div>
  )
}

function IntegrationCard({ 
  name, 
  description, 
  icon: Icon, 
  status, 
  disabled = false 
}: { 
  name: string
  description: string
  icon: any
  status: string
  disabled?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg ${disabled ? 'opacity-60' : 'hover:border-gray-300'}`}>
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button 
        type="button"
        disabled={disabled}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
        }`}
      >
        {status}
      </button>
    </div>
  )
}
