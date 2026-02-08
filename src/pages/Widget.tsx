import { useEffect, useState, useRef } from 'react'
import { Copy, Check, Code, Layout, Columns, List, Moon, Sun, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase, Business, Testimonial } from '../lib/supabase'

type WidgetLayout = 'grid' | 'carousel' | 'list'
type WidgetTheme = 'light' | 'dark'

const SAMPLE_TESTIMONIALS: Partial<Testimonial>[] = [
  { customer_name: 'María García', rating: 5, text_content: 'Servicio excepcional, muy recomendado. Volveré sin duda.', created_at: '2026-02-01T10:00:00Z' },
  { customer_name: 'Carlos López', rating: 5, text_content: 'La mejor experiencia que he tenido. Profesionales de primera.', created_at: '2026-01-28T15:00:00Z' },
  { customer_name: 'Ana Martínez', rating: 4, text_content: 'Muy buen trato y resultado. Solo un pequeño detalle pero en general genial.', created_at: '2026-01-25T09:00:00Z' },
  { customer_name: 'Pedro Ruiz', rating: 5, text_content: 'Increíble atención al cliente. Se nota que les importa.', created_at: '2026-01-20T12:00:00Z' },
]

function TestimonialCard({ t, isDark }: { t: Partial<Testimonial>; isDark: boolean }) {
  const initials = (t.customer_name || '?').charAt(0).toUpperCase()
  const date = new Date(t.created_at || '').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  return (
    <div className={`rounded-xl p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className={`font-semibold text-sm truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{t.customer_name}</p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{date}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < (t.rating || 0) ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-200'}`} />
        ))}
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.text_content}</p>
    </div>
  )
}

function LivePreview({ testimonials, layout, theme, maxItems, isFree }: {
  testimonials: Partial<Testimonial>[]
  layout: WidgetLayout
  theme: WidgetTheme
  maxItems: number
  isFree: boolean
}) {
  const [carouselIdx, setCarouselIdx] = useState(0)
  const isDark = theme === 'dark'
  const items = testimonials.slice(0, maxItems)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => { setCarouselIdx(0) }, [layout, maxItems])

  useEffect(() => {
    if (layout === 'carousel' && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCarouselIdx(prev => (prev + 1) % items.length)
      }, 4000)
      return () => clearInterval(intervalRef.current)
    }
  }, [layout, items.length])

  if (items.length === 0) {
    return (
      <div className={`rounded-xl p-8 text-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No hay testimonios aún</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((t, i) => <TestimonialCard key={i} t={t} isDark={isDark} />)}
        </div>
      )}

      {layout === 'list' && (
        <div className="flex flex-col gap-3">
          {items.map((t, i) => <TestimonialCard key={i} t={t} isDark={isDark} />)}
        </div>
      )}

      {layout === 'carousel' && (
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <TestimonialCard t={items[carouselIdx] || items[0]} isDark={isDark} />
          </div>
          {items.length > 1 && (
            <>
              <button
                onClick={() => setCarouselIdx((carouselIdx - 1 + items.length) % items.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-indigo-600/90 text-white rounded-full p-1.5 hover:bg-indigo-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCarouselIdx((carouselIdx + 1) % items.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600/90 text-white rounded-full p-1.5 hover:bg-indigo-700 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="flex justify-center gap-1.5 mt-3">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === carouselIdx ? 'bg-indigo-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {isFree && (
        <p className={`text-center text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Powered by <a href="https://testimonioya.com" className="underline">TestimonioYa</a>
        </p>
      )}
    </div>
  )
}

export default function Widget() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [testimonials, setTestimonials] = useState<Partial<Testimonial>[]>([])
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
        if (savedId) query = query.eq('id', savedId)
        
        const { data: biz } = await query.limit(1).single()
        if (biz) {
          setBusiness(biz)
          const { data: tData } = await supabase
            .from('testimonials')
            .select('*')
            .eq('business_id', biz.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(20)
          
          if (tData && tData.length > 0) {
            setTestimonials(tData)
          } else {
            setTestimonials(SAMPLE_TESTIMONIALS)
          }
        }
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
<script src="https://testimonioya.com/widget.js" async><\/script>`
  }

  const getIframeCode = () => {
    if (!business) return ''
    return `<!-- TestimonioYa Iframe -->
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

  const usingSample = testimonials === SAMPLE_TESTIMONIALS

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Widget Embebido</h1>
        <p className="text-gray-600 mb-6">Muestra tus testimonios en cualquier web</p>

        {/* Live Preview - FIRST on mobile */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Vista Previa</h2>
            {usingSample && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                Datos de ejemplo
              </span>
            )}
          </div>
          <LivePreview
            testimonials={testimonials}
            layout={layout}
            theme={theme}
            maxItems={maxItems}
            isFree={business.plan === 'free'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personalización</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Diseño</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['grid', Layout, 'Cuadrícula'], ['carousel', Columns, 'Carrusel'], ['list', List, 'Lista']] as const).map(([value, Icon, label]) => (
                    <button
                      key={value}
                      onClick={() => setLayout(value as WidgetLayout)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                        layout === value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs sm:text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'light' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="h-5 w-5" />
                    <span>Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'dark' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="h-5 w-5" />
                    <span>Oscuro</span>
                  </button>
                </div>
              </div>

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

            {business.plan === 'free' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  ⚠️ <strong>Plan Gratis:</strong> El widget mostrará "Powered by TestimonioYa".
                </p>
              </div>
            )}
          </div>

          {/* Code */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  <span className="text-sm sm:text-base">Widget JS</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Recomendado</span>
                </h2>
                <button
                  onClick={() => copyCode(getWidgetCode(), 'widget')}
                  className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition-all ${
                    copiedWidget ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copiedWidget ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copiedWidget ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="bg-gray-950 rounded-lg p-4 text-sm text-emerald-400 font-mono whitespace-pre-wrap leading-5 overflow-x-auto border border-gray-800">
                <code>{getWidgetCode()}</code>
              </pre>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  <span className="text-sm sm:text-base">Iframe</span>
                </h2>
                <button
                  onClick={() => copyCode(getIframeCode(), 'iframe')}
                  className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition-all ${
                    copiedIframe ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {copiedIframe ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline">{copiedIframe ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="bg-gray-950 rounded-lg p-4 text-sm text-sky-400 font-mono whitespace-pre-wrap leading-5 overflow-x-auto border border-gray-800">
                <code>{getIframeCode()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
