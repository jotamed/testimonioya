import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Negocio
              </label>
              <input
                id="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="input-field"
                placeholder="Mi Empresa"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industria
              </label>
              <input
                id="industry"
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input-field"
                placeholder="Ej: Restaurante, Consultoría, E-commerce"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Brand Color */}
            <div>
              <label htmlFor="brand_color" className="block text-sm font-medium text-gray-700 mb-2">
                Color de Marca
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="brand_color"
                  type="color"
                  value={formData.brand_color}
                  onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                  className="h-12 w-24 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brand_color}
                  onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                  className="input-field flex-1"
                  placeholder="#4f46e5"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Este color se usará en tu formulario de testimonios y muro público
              </p>
            </div>

            {/* Welcome Message */}
            <div>
              <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje de Bienvenida
              </label>
              <textarea
                id="welcome_message"
                rows={4}
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                className="input-field"
                placeholder="¡Gracias por tu tiempo! Tu opinión es muy importante para nosotros."
              />
              <p className="mt-1 text-xs text-gray-500">
                Este mensaje aparecerá en el formulario de recolección de testimonios
              </p>
            </div>

            {/* Business Slug (Read-only) */}
            {business && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Enlace Único
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm">
                    {window.location.origin}/wall/{business.slug}
                  </code>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Este es tu muro público de testimonios
                </p>
              </div>
            )}

            {/* Plan Info */}
            {business && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-900">Plan Actual</p>
                    <p className="text-2xl font-bold text-indigo-600 capitalize mt-1">
                      {business.plan}
                    </p>
                  </div>
                  {business.plan === 'free' && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => alert('Próximamente: actualización de plan')}
                    >
                      Mejorar Plan
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
