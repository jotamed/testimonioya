import { useEffect, useState } from 'react'
import { Copy, Check, Code, Layout, Columns, List, Moon, Sun } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business } from '../lib/supabase'

type WidgetLayout = 'grid' | 'carousel' | 'list'
type WidgetTheme = 'light' | 'dark'

export default function Widget() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<WidgetLayout>('grid')
  const [theme, setTheme] = useState<WidgetTheme>('light')
  const [maxItems, setMaxItems] = useState(6)
  const [copiedWidget, setCopiedWidget] = useState(false)
  const [copiedIframe, setCopiedIframe] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const savedId = localStorage.getItem('testimonioya_current_business')
        let query = supabase.from('businesses').select('*').eq('user_id', user.id)
        
        if (savedId) {
          query = query.eq('id', savedId)
        }
        
        const { data } = await query.limit(1).single()
        if (data) setBusiness(data)
      } catch (error) {
        console.error('Error loading widget data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getWidgetCode = () => {
    if (!business) return ''
    
    return `<!-- TestimonioYa Widget -->
<div id="testimonioya-widget" 
     data-slug="${business.slug}"
     data-layout="${layout}"
     data-theme="${theme}"
     data-max="${maxItems}">
</div>
<script src="https://testimonioya.com/widget.js" async></script>`
  }

  const getIframeCode = () => {
    if (!business) return ''
    
    return `<!-- TestimonioYa Iframe Widget -->
<iframe 
  src="https://testimonioya.com/wall/${business.slug}?embed=true"
  style="width:100%;height:600px;border:none;border-radius:12px;"
  title="Testimonios de ${business.business_name}">
</iframe>`
  }

  const copyCode = (code: string, type: 'widget' | 'iframe') => {
    navigator.clipboard.writeText(code)
    if (type === 'widget') {
      setCopiedWidget(true)
      setTimeout(() => setCopiedWidget(false), 2000)
    } else {
      setCopiedIframe(true)
      setTimeout(() => setCopiedIframe(false), 2000)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Embebido</h1>
        <p className="text-gray-600 mb-8">Muestra tus testimonios en cualquier web</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            {/* Layout Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personalización</h2>
              
              {/* Layout */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diseño
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      layout === 'grid' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Layout className="h-6 w-6 mb-1" />
                    <span className="text-sm">Cuadrícula</span>
                  </button>
                  <button
                    onClick={() => setLayout('carousel')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      layout === 'carousel' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Columns className="h-6 w-6 mb-1" />
                    <span className="text-sm">Carrusel</span>
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                      layout === 'list' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <List className="h-6 w-6 mb-1" />
                    <span className="text-sm">Lista</span>
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'light' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'dark' 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Oscuro</span>
                  </button>
                </div>
              </div>

              {/* Max Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de testimonios: {maxItems}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={maxItems}
                  onChange={(e) => setMaxItems(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Cómo Integrar
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-7 w-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Elige tus opciones</h3>
                    <p className="text-sm text-gray-600">
                      Selecciona diseño, tema y cantidad de testimonios
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-7 w-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Copia el código</h3>
                    <p className="text-sm text-gray-600">
                      Haz clic en "Copiar" para copiar el código
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-7 w-7 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Pégalo en tu web</h3>
                    <p className="text-sm text-gray-600">
                      Inserta el código donde quieras mostrar los testimonios
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {business.plan === 'free' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  ⚠️ <strong>Plan Gratis:</strong> El widget mostrará "Powered by TestimonioYa". 
                  <a href="#" className="underline ml-1">Actualiza a Pro</a> para quitarlo.
                </p>
              </div>
            )}
          </div>

          {/* Code & Preview */}
          <div className="space-y-6">
            {/* JavaScript Widget Code */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Widget JavaScript</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Recomendado</span>
                </h2>
                <button
                  onClick={() => copyCode(getWidgetCode(), 'widget')}
                  className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    copiedWidget 
                      ? 'bg-green-600 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copiedWidget ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedWidget ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-gray-950 rounded-lg overflow-x-auto border border-gray-800">
                <div className="flex">
                  <div className="py-4 pl-4 pr-2 text-right select-none">
                    {getWidgetCode().split('\n').map((_, i) => (
                      <div key={i} className="text-xs text-gray-600 font-mono leading-5">{i + 1}</div>
                    ))}
                  </div>
                  <pre className="py-4 pr-4 text-sm text-emerald-400 font-mono whitespace-pre-wrap leading-5">
                    <code>{getWidgetCode()}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Iframe Alternative */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Alternativa: Iframe</span>
                </h2>
                <button
                  onClick={() => copyCode(getIframeCode(), 'iframe')}
                  className={`flex items-center space-x-2 text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    copiedIframe
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {copiedIframe ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedIframe ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-gray-950 rounded-lg overflow-x-auto border border-gray-800">
                <div className="flex">
                  <div className="py-4 pl-4 pr-2 text-right select-none">
                    {getIframeCode().split('\n').map((_, i) => (
                      <div key={i} className="text-xs text-gray-600 font-mono leading-5">{i + 1}</div>
                    ))}
                  </div>
                  <pre className="py-4 pr-4 text-sm text-sky-400 font-mono whitespace-pre-wrap leading-5">
                    <code>{getIframeCode()}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vista Previa</h2>
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <iframe
                  src={`${window.location.origin}/wall/${business.slug}?embed=true`}
                  className="w-full h-80 rounded-lg"
                  title="Widget Preview"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                * La vista previa muestra el Wall of Love completo. El widget real respetará tus opciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
