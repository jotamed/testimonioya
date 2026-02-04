import { useEffect, useState } from 'react'
import { Copy, Code } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'

export default function Widget() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

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
      }
    } catch (error) {
      console.error('Error loading business:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWidgetCode = () => {
    if (!business) return ''
    
    return `<!-- TestimonioYa Widget -->
<div id="testimonioya-widget" data-slug="${business.slug}"></div>
<script>
(function() {
  const widget = document.getElementById('testimonioya-widget');
  const slug = widget.dataset.slug;
  const iframe = document.createElement('iframe');
  iframe.src = '${window.location.origin}/wall/' + slug + '?embed=true';
  iframe.style.width = '100%';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  widget.appendChild(iframe);
})();
</script>`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(getWidgetCode())
    alert('¡Código copiado al portapapeles!')
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

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontró el negocio</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Widget Embebido</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cómo Integrar el Widget
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Copia el código</h3>
                    <p className="text-sm text-gray-600">
                      Haz clic en el botón "Copiar Código" para copiar el snippet
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Pega en tu web</h3>
                    <p className="text-sm text-gray-600">
                      Inserta el código en el HTML de tu página donde quieras mostrar los testimonios
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">¡Listo!</h3>
                    <p className="text-sm text-gray-600">
                      Tus testimonios se mostrarán automáticamente en tu sitio web
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {business.plan === 'free' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  ⚠️ <strong>Plan Gratis:</strong> El widget mostrará "Powered by TestimonioYa" en la parte inferior. 
                  Actualiza a Pro para quitarlo.
                </p>
              </div>
            )}
          </div>

          {/* Code Snippet */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Code className="h-6 w-6" />
                  <span>Código del Widget</span>
                </h2>
                <button
                  onClick={copyCode}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar Código</span>
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{getWidgetCode()}</code>
                </pre>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vista Previa</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <iframe
                  src={`${window.location.origin}/wall/${business.slug}?embed=true`}
                  className="w-full h-96 rounded-lg"
                  title="Widget Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
