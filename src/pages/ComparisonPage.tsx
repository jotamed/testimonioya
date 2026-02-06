import { useParams, Link } from 'react-router-dom'
import { MessageSquare, Check, X, ArrowRight, Zap } from 'lucide-react'

type Competitor = {
  name: string
  tagline: string
  price: string
  priceNum: number
  features: { [key: string]: boolean | string }
  cons: string[]
  description: string
}

const competitors: { [key: string]: Competitor } = {
  'testimonial-to': {
    name: 'Testimonial.to',
    tagline: 'Simple testimonial collection',
    price: '$50/mes',
    priceNum: 50,
    features: {
      'Video testimonios': true,
      'Audio testimonios': false,
      'Texto testimonios': true,
      'Wall of Love': true,
      'Widget embebible': true,
      'NPS integrado': false,
      'Segmentación automática': false,
      'Feedback privado de detractores': false,
      'Email automation': 'Solo Pro ($150)',
      'Español nativo': false,
      'Free tier': 'Trial 7 días',
    },
    cons: [
      'Sin NPS - pides testimonios a ciegas',
      'Precio alto ($50/mes básico)',
      'Solo en inglés',
      'Sin audio testimonios',
      'Feedback negativo puede hacerse público',
    ],
    description: 'Testimonial.to es popular para recopilar testimonios, pero no tiene filtrado inteligente. Pides a todos tus clientes sin saber si están contentos o no.',
  },
  'senja': {
    name: 'Senja',
    tagline: 'Collect and share testimonials',
    price: '$29/mes',
    priceNum: 29,
    features: {
      'Video testimonios': true,
      'Audio testimonios': false,
      'Texto testimonios': true,
      'Wall of Love': true,
      'Widget embebible': true,
      'NPS integrado': false,
      'Segmentación automática': false,
      'Feedback privado de detractores': false,
      'Email automation': true,
      'Español nativo': false,
      'Free tier': '15 testimonios',
      'Import de reviews': '30+ plataformas',
    },
    cons: [
      'Sin NPS - no filtras antes de pedir',
      'Solo en inglés',
      'Sin audio testimonios',
      'Clientes insatisfechos pueden dejar feedback negativo',
    ],
    description: 'Senja ofrece buen import de reviews y widgets, pero carece de la inteligencia NPS para filtrar clientes insatisfechos antes de pedirles testimonio.',
  },
  'delighted': {
    name: 'Delighted',
    tagline: 'NPS & Customer Feedback',
    price: '$224/mes',
    priceNum: 224,
    features: {
      'Video testimonios': false,
      'Audio testimonios': false,
      'Texto testimonios': false,
      'Wall of Love': false,
      'Widget embebible': false,
      'NPS integrado': true,
      'Segmentación automática': true,
      'Feedback privado de detractores': true,
      'Email automation': true,
      'Español nativo': false,
      'Free tier': 'Trial',
      'Analytics NPS': true,
    },
    cons: [
      'MUY caro ($224/mes)',
      'Solo mide NPS, no genera testimonios',
      'No hay Wall of Love',
      'No aprovecha a tus promotores',
    ],
    description: 'Delighted es excelente para medir NPS, pero no convierte a tus promotores en testimonios. Mides satisfacción pero no la aprovechas para marketing.',
  },
  'videoask': {
    name: 'VideoAsk',
    tagline: 'Interactive video conversations',
    price: '$30/mes',
    priceNum: 30,
    features: {
      'Video testimonios': true,
      'Audio testimonios': true,
      'Texto testimonios': true,
      'Wall of Love': false,
      'Widget embebible': 'Limitado',
      'NPS integrado': false,
      'Segmentación automática': false,
      'Feedback privado de detractores': false,
      'Email automation': false,
      'Español nativo': false,
      'Free tier': '20 min/mes',
    },
    cons: [
      'Sin NPS - no filtras',
      'Sin Wall of Love',
      'Límites de minutos de video',
      'Más caro que parece',
    ],
    description: 'VideoAsk es de Typeform y es bueno para video interactivo, pero no está diseñado para testimonios ni tiene filtrado inteligente.',
  },
}

export default function ComparisonPage() {
  const { competitor } = useParams<{ competitor: string }>()
  const comp = competitor ? competitors[competitor] : null

  if (!comp) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Comparador no encontrado</h1>
          <p className="text-gray-600 mb-8">Compara TestimonioYa con:</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(competitors).map(([slug, c]) => (
              <Link 
                key={slug}
                to={`/vs/${slug}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 transition-colors"
              >
                <p className="font-semibold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const testimonioYaFeatures: { [key: string]: boolean | string } = {
    'Video testimonios': true,
    'Audio testimonios': true,
    'Texto testimonios': true,
    'Wall of Love': true,
    'Widget embebible': true,
    'NPS integrado': true,
    'Segmentación automática': true,
    'Feedback privado de detractores': true,
    'Email automation': 'Pro (€19)',
    'Español nativo': true,
    'Free tier': '25 NPS + 10 test/mes',
    'Import de reviews': 'Google Reviews',
    'Analytics NPS': 'Pro (€19)',
  }

  const allFeatures = [...new Set([...Object.keys(comp.features), ...Object.keys(testimonioYaFeatures)])]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
            </Link>
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-4 w-4 mr-1.5" />
            Alternativa #1 en español
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            TestimonioYa vs {comp.name}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {comp.description}
          </p>

          {/* Quick comparison */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-1">{comp.name}</p>
              <p className="text-3xl font-bold text-gray-400">{comp.price}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">vs</span>
            </div>
            <div className="bg-indigo-600 rounded-xl p-6 text-center text-white">
              <p className="text-sm text-indigo-200 mb-1">TestimonioYa Pro</p>
              <p className="text-3xl font-bold">€19/mes</p>
              <p className="text-xs text-indigo-200 mt-1">+ NPS integrado</p>
            </div>
          </div>

          <Link to="/register" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all">
            Probar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Comparación detallada
          </h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="p-4 font-semibold text-gray-700">Feature</div>
              <div className="p-4 font-semibold text-gray-700 text-center border-l border-gray-200">{comp.name}</div>
              <div className="p-4 font-semibold text-indigo-600 text-center border-l border-gray-200 bg-indigo-50">TestimonioYa</div>
            </div>

            {/* Rows */}
            {allFeatures.map((feature, i) => {
              const compValue = comp.features[feature]
              const tyValue = testimonioYaFeatures[feature]
              
              return (
                <div key={feature} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-b-0`}>
                  <div className="p-4 text-gray-700">{feature}</div>
                  <div className="p-4 text-center border-l border-gray-100">
                    {compValue === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : compValue === false ? (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    ) : compValue === undefined ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className="text-sm text-gray-600">{compValue}</span>
                    )}
                  </div>
                  <div className="p-4 text-center border-l border-gray-100 bg-indigo-50/50">
                    {tyValue === true ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : tyValue === false ? (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    ) : tyValue === undefined ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <span className="text-sm text-indigo-600 font-medium">{tyValue}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why TestimonioYa */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Por qué elegir TestimonioYa
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Our advantages */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-green-600 mb-4 flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Lo que {comp.name} no tiene
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>NPS integrado</strong> - Filtra antes de pedir testimonio</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Segmentación automática</strong> - Detractores van a feedback privado</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Español nativo</strong> - UI, copy y soporte en español</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Audio testimonios</strong> - Notas de voz de tus clientes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Precio justo</strong> - €19 vs {comp.price}</span>
                </li>
              </ul>
            </div>

            {/* Their cons */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-red-600 mb-4 flex items-center">
                <X className="h-5 w-5 mr-2" />
                Limitaciones de {comp.name}
              </h3>
              <ul className="space-y-3">
                {comp.cons.map((con, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cero testimonios malos. Garantizado.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Con el sistema NPS-First, solo tus clientes más felices dejan testimonio público.
            Los demás te dan feedback privado para mejorar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700">
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/#pricing" className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50">
              Ver precios
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Sin tarjeta · 25 encuestas NPS gratis/mes
          </p>
        </div>
      </section>

      {/* Other comparisons */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
            Otras comparaciones
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(competitors)
              .filter(([slug]) => slug !== competitor)
              .map(([slug, c]) => (
                <Link 
                  key={slug}
                  to={`/vs/${slug}`}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors"
                >
                  vs {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-gray-900">TestimonioYa</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TestimonioYa
          </p>
        </div>
      </footer>
    </div>
  )
}
