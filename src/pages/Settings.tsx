import { useEffect, useState } from 'react'
import { Save, Crown, Check } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'
import { PLANS } from '../lib/stripe'

export default function Settings() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    website: '',
    brand_color: '#4f46e5',
    welcome_message: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

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

      alert('¡Configuración guardada correctamente!')
      loadData()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar la configuración')
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
      console.error('Error creating checkout:', error)
      alert('Error al iniciar el pago: ' + error.message)
    } finally {
      setUpgrading(false)
    }
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
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Datos del negocio</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre del Negocio
              </label>
              <input
                id="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Industria
                </label>
                <input
                  id="industry"
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                  placeholder="Restaurante, Clínica, Gym..."
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sitio Web
                </label>
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                  placeholder="https://tuempresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="brand_color" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mensaje de Bienvenida
              </label>
              <textarea
                id="welcome_message"
                rows={3}
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="input-field"
                placeholder="¡Gracias por tu tiempo! Tu opinión es muy importante."
              />
              <p className="mt-1 text-xs text-gray-500">Se muestra en el formulario de recolección</p>
            </div>

            {business && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu Muro Público</label>
                <code className="block bg-gray-50 px-4 py-2.5 rounded-lg text-sm text-indigo-600 border border-gray-200">
                  {window.location.origin}/wall/{business.slug}
                </code>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Plan & Billing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Crown className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Plan y Facturación</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
              const isCurrent = business?.plan === key
              const isUpgrade = !isCurrent && key !== 'free'

              return (
                <div
                  key={key}
                  className={`rounded-xl border-2 p-5 transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    €{plan.price}<span className="text-sm font-normal text-gray-500">/mes</span>
                  </p>
                  <ul className="space-y-2 mb-5 text-sm">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <Check className="h-3.5 w-3.5 text-green-500 mr-1.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isUpgrade && plan.priceId && (
                    <button
                      onClick={() => handleUpgrade(plan.priceId!)}
                      disabled={upgrading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {upgrading ? 'Redirigiendo...' : `Upgrade a ${plan.name}`}
                    </button>
                  )}
                  {isCurrent && key !== 'free' && (
                    <p className="text-center text-xs text-gray-500">
                      Gestionar en portal de facturación
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
