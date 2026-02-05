import { useParams, Link, Navigate } from 'react-router-dom'
import { MessageSquare, Star, Globe, Shield, ArrowRight, Check, ChevronRight, Share2 } from 'lucide-react'

// Vertical configurations
const verticals: Record<string, {
  slug: string
  name: string
  emoji: string
  headline: string
  subheadline: string
  problems: string[]
  testimonials: { name: string; biz: string; text: string; rating: number }[]
  useCases: string[]
  keywords: string[]
}> = {
  restaurantes: {
    slug: 'restaurantes',
    name: 'Restaurantes',
    emoji: '🍽️',
    headline: 'Más reseñas para tu restaurante',
    subheadline: 'Convierte comensales satisfechos en reseñas reales. Sin pedir incómodos favores.',
    problems: [
      '"¿Nos dejas una reseña en Google?" después del postre → silencio incómodo',
      'El cliente dice que sí, pero nunca lo hace',
      'Solo los enfadados dejan reseñas (y malas)',
      'TripAdvisor cobra por responder a reseñas',
    ],
    testimonials: [
      { name: 'Carlos Ruiz', biz: 'Restaurante El Fogón', text: 'Pasamos de 12 a 87 reseñas en 3 meses. Ahora Google nos posiciona mejor y las reservas han subido un 40%.', rating: 5 },
      { name: 'María López', biz: 'La Taberna del Puerto', text: 'El QR en la mesa funciona increíble. Los clientes lo escanean mientras esperan la cuenta.', rating: 5 },
      { name: 'Antonio García', biz: 'Pizzería Napoli', text: 'Simple y efectivo. Lo configuras una vez y funciona solo.', rating: 5 },
    ],
    useCases: [
      'QR en cada mesa',
      'Link en el ticket de compra',
      'Mensaje post-reserva',
      'Tarjeta con el QR para llevar',
    ],
    keywords: ['reseñas restaurante', 'opiniones restaurante', 'testimonios hostelería'],
  },
  coaches: {
    slug: 'coaches',
    name: 'Coaches y Consultores',
    emoji: '💼',
    headline: 'Casos de éxito que venden por ti',
    subheadline: 'Tus clientes ya tienen resultados. Convierte sus historias en tu mejor argumento de venta.',
    problems: [
      'Pedir testimonios se siente incómodo o "vendedor"',
      'Los clientes dicen que sí pero nunca envían nada',
      'Capturas de WhatsApp no se ven profesionales',
      'No tienes tiempo para perseguir testimonios',
    ],
    testimonials: [
      { name: 'Laura Sánchez', biz: 'Coach de Negocios', text: 'Mis casos de estudio ahora se escriben solos. Envío el link al terminar el programa y el 60% responde.', rating: 5 },
      { name: 'Pedro Martínez', biz: 'Consultor de Marketing', text: 'El muro de testimonios en mi web es lo primero que ven los leads. La conversión subió un 35%.', rating: 5 },
      { name: 'Ana Belén', biz: 'Mentora de Emprendedores', text: 'Por fin tengo un sistema. Antes perdía testimonios increíbles por no tener dónde guardarlos.', rating: 5 },
    ],
    useCases: [
      'Al terminar un programa o proyecto',
      'Después de una sesión transformadora',
      'Al renovar un cliente',
      'Automatizado en tu embudo',
    ],
    keywords: ['testimonios coaching', 'casos de éxito consultoría', 'social proof coaches'],
  },
  fitness: {
    slug: 'fitness',
    name: 'Gimnasios y Entrenadores',
    emoji: '💪',
    headline: 'Transforma resultados en nuevos clientes',
    subheadline: 'Tus alumnos consiguen resultados increíbles. Que el mundo los vea.',
    problems: [
      'Tienes transformaciones brutales pero no las documentas',
      'Los alumnos comparten en sus redes pero tú no lo capturas',
      'Pedir reseñas en Google es frío e impersonal',
      'Las capturas de WhatsApp no dan confianza profesional',
    ],
    testimonials: [
      { name: 'Miguel Torres', biz: 'CrossFit Barna', text: 'Después de cada WOD intenso, comparto el link. Los alumnos responden en caliente con sus logros.', rating: 5 },
      { name: 'Carla Jiménez', biz: 'Entrenadora Personal', text: 'Mi muro de transformaciones es mi mejor publicidad. Los leads lo ven y me escriben solos.', rating: 5 },
      { name: 'David Ruiz', biz: 'Yoga Studio', text: 'Testimonios de alumnos que llevan años son oro. Ahora los tengo organizados y visibles.', rating: 5 },
    ],
    useCases: [
      'Al completar un reto o programa',
      'Después de conseguir un PR',
      'Al renovar membresía',
      'Con foto antes/después',
    ],
    keywords: ['testimonios gimnasio', 'reseñas entrenador personal', 'transformaciones fitness'],
  },
  clinicas: {
    slug: 'clinicas',
    name: 'Clínicas y Centros de Salud',
    emoji: '🏥',
    headline: 'La confianza que tus pacientes necesitan',
    subheadline: 'Los pacientes buscan opiniones antes de elegir. Muestra las tuyas con orgullo.',
    problems: [
      'Los pacientes buscan reseñas antes de venir',
      'Google Reviews no transmite profesionalidad médica',
      'Pedir reseñas en consulta es incómodo',
      'Las opiniones negativas pesan más que las positivas',
    ],
    testimonials: [
      { name: 'Dra. María García', biz: 'Clínica Dental Sonríe', text: 'Enviamos el link después de cada tratamiento. Ahora tenemos más de 200 testimonios verificados.', rating: 5 },
      { name: 'Dr. José Martín', biz: 'Centro de Fisioterapia', text: 'Los pacientes nuevos llegan ya con confianza porque leyeron los testimonios en la web.', rating: 5 },
      { name: 'Dra. Ana López', biz: 'Clínica Estética', text: 'El muro de resultados es decisivo. Las consultas de valoración cierran mucho mejor.', rating: 5 },
    ],
    useCases: [
      'Post-tratamiento por email/SMS',
      'Al alta del paciente',
      'En seguimiento a los 3 meses',
      'QR en recepción',
    ],
    keywords: ['opiniones clínica', 'reseñas médico', 'testimonios centro salud'],
  },
  belleza: {
    slug: 'belleza',
    name: 'Belleza y Estética',
    emoji: '💇',
    headline: 'Tus clientas son tu mejor publicidad',
    subheadline: 'Recoge testimonios reales y muestra tu trabajo con orgullo.',
    problems: [
      'Instagram es efímero, los posts desaparecen',
      'Las clientas prometen reseñas pero no las dejan',
      'Las fotos del antes/después se pierden en el móvil',
      'Google Reviews no muestra tu trabajo visual',
    ],
    testimonials: [
      { name: 'Lucía Fernández', biz: 'Salón de Belleza Lux', text: 'Cada clienta que sale contenta recibe el link. El muro de testimonios me llena la agenda.', rating: 5 },
      { name: 'Carmen Ruiz', biz: 'Centro de Uñas', text: 'Las fotos que suben las clientas con sus testimonios son mi mejor portfolio.', rating: 5 },
      { name: 'Marta Sánchez', biz: 'Micropigmentación', text: 'En mi sector la confianza es todo. Los testimonios reales marcan la diferencia.', rating: 5 },
    ],
    useCases: [
      'Justo después del servicio',
      'Con foto del resultado',
      'Tarjeta con QR para que vuelvan',
      'Seguimiento post-servicio',
    ],
    keywords: ['reseñas peluquería', 'opiniones centro estética', 'testimonios belleza'],
  },
}

export default function VerticalLanding() {
  const { vertical } = useParams()
  
  const config = vertical ? verticals[vertical] : null
  
  if (!config) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">TestimonioYa</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Entrar
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="mr-2 text-lg">{config.emoji}</span>
            Testimonios para {config.name}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            {config.headline}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {config.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link to="/register" className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400">Sin tarjeta · Gratis para siempre · 2 min de setup</p>
        </div>
      </section>

      {/* Problems */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ¿Te suena familiar?
          </h2>
          <div className="space-y-4">
            {config.problems.map((problem, i) => (
              <div key={i} className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                <span className="text-red-500 text-xl mt-0.5">✗</span>
                <p className="text-gray-700">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Con TestimonioYa es diferente
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Creas tu enlace personalizado</p>
                  <p className="text-sm text-gray-500">Con tu marca y mensaje para {config.name.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lo compartes en el momento perfecto</p>
                  <p className="text-sm text-gray-500">{config.useCases[0]}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Recibes testimonios auténticos</p>
                  <p className="text-sm text-gray-500">Los apruebas y aparecen en tu muro público</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            {config.name} que ya lo usan
          </h2>
          <p className="text-gray-600 text-center mb-12">Resultados reales de negocios como el tuyo</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {config.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="pt-3 border-t border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Cuándo pedir testimonios
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {config.useCases.map((useCase, i) => (
              <div key={i} className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-gray-700">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <Share2 className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Comparte donde quieras</h3>
              <p className="text-sm text-gray-600">WhatsApp, email, QR, SMS... Un enlace que funciona en todas partes.</p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <Globe className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Tu muro de testimonios</h3>
              <p className="text-sm text-gray-600">Una página pública profesional. Embébela en tu web o compártela.</p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-gray-200">
              <Shield className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Tú tienes el control</h3>
              <p className="text-sm text-gray-600">Aprueba, rechaza o destaca. Solo publicas lo que quieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Empieza a recoger testimonios hoy
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Configúralo en 2 minutos. Gratis para siempre.
          </p>
          <Link to="/register" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200">
            Crear mi cuenta gratis
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
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
            © {new Date().getFullYear()} TestimonioYa. Hecho en Barcelona 🇪🇸
          </p>
        </div>
      </footer>
    </div>
  )
}
