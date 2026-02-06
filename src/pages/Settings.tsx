import { useEffect, useState } from 'react'
import { 
  Save, Crown, Check, Mic, Video, Palette, 
  Key, Webhook, Users, Building2, Download, 
  MessageSquare, Zap, Lock, Settings2
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'
import { PLANS } from '../lib/stripe'
import { PlanType } from '../lib/plans'

type SettingsTab = 'general' | 'nps' | 'automation' | 'branding' | 'integrations' | 'team' | 'billing'

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

  // Tab configuration
  const tabs: { id: SettingsTab; label: string; icon: any; requiresPlan?: PlanType }[] = [
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'nps', label: 'NPS', icon: MessageSquare, requiresPlan: 'pro' },
    { id: 'automation', label: 'Automatización', icon: Zap, requiresPlan: 'pro' },
    { id: 'branding', label: 'Marca', icon: Palette, requiresPlan: 'pro' },
    { id: 'integrations', label: 'Integraciones', icon: Webhook, requiresPlan: 'premium' },
    { id: 'team', label: 'Equipo', icon: Users, requiresPlan: 'premium' },
    { id: 'billing', label: 'Plan', icon: Crown },
  ]

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

                  {isPro && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Facturación</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Gestiona tus facturas, método de pago y cancela tu suscripción.
                      </p>
                      <button type="button" className="btn-secondary text-sm">
                        Abrir portal de facturación
                      </button>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Exportar datos</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Descarga todos tus testimonios y datos NPS en CSV.
                    </p>
                    <button type="button" className="btn-secondary text-sm flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Exportar todo</span>
                    </button>
                  </div>
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
