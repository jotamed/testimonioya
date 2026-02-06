import { useParams, Link } from 'react-router-dom'
import { MessageSquare, ArrowLeft } from 'lucide-react'

type LegalPage = 'terms' | 'privacy' | 'cookies'

const legalContent: Record<LegalPage, { title: string; content: string }> = {
  terms: {
    title: 'Términos de Servicio',
    content: `
# Términos de Servicio de TestimonioYa

**Última actualización:** Febrero 2026

## 1. Aceptación de los Términos

Al acceder y utilizar TestimonioYa ("el Servicio"), aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el Servicio.

## 2. Descripción del Servicio

TestimonioYa es una plataforma que permite a negocios:
- Recopilar testimonios de clientes mediante encuestas NPS
- Gestionar y mostrar testimonios en su sitio web
- Analizar la satisfacción del cliente

## 3. Registro y Cuenta

- Debes proporcionar información veraz al registrarte
- Eres responsable de mantener la confidencialidad de tu cuenta
- Debes tener al menos 18 años para usar el Servicio
- Una persona o entidad solo puede mantener una cuenta gratuita

## 4. Uso Aceptable

Te comprometes a:
- No usar el Servicio para actividades ilegales
- No enviar spam ni contenido engañoso
- No falsificar testimonios
- No interferir con el funcionamiento del Servicio
- Respetar los derechos de propiedad intelectual

## 5. Contenido del Usuario

- Mantienes la propiedad de tu contenido
- Nos otorgas licencia para mostrar testimonios según tus configuraciones
- Eres responsable del contenido que publicas
- Podemos eliminar contenido que viole estos términos

## 6. Planes y Pagos

- Los planes de pago se facturan mensualmente
- Puedes cancelar en cualquier momento desde el portal de facturación
- No hay reembolsos por periodos parciales
- Los precios pueden cambiar con 30 días de aviso

## 7. Cancelación

- Puedes cancelar tu cuenta en cualquier momento
- Al cancelar, tus datos serán eliminados según nuestra política de privacidad
- No hay penalización por cancelar

## 8. Limitación de Responsabilidad

- El Servicio se proporciona "tal cual"
- No garantizamos disponibilidad ininterrumpida
- No somos responsables de pérdidas indirectas
- Nuestra responsabilidad máxima está limitada al importe pagado

## 9. Cambios en los Términos

Podemos modificar estos términos. Te notificaremos por email de cambios significativos con 30 días de antelación.

## 10. Contacto

Para dudas sobre estos términos: legal@testimonioya.com
    `,
  },
  privacy: {
    title: 'Política de Privacidad',
    content: `
# Política de Privacidad de TestimonioYa

**Última actualización:** Febrero 2026

## 1. Información que Recopilamos

### Datos de Cuenta
- Email y contraseña (cifrada)
- Nombre del negocio
- Información de facturación (procesada por Stripe)

### Datos de Uso
- Testimonios recibidos
- Respuestas NPS
- Métricas de uso del dashboard

### Datos Técnicos
- Dirección IP
- Tipo de navegador
- Cookies esenciales

## 2. Cómo Usamos la Información

- Proporcionar y mejorar el Servicio
- Procesar pagos
- Enviar notificaciones importantes
- Análisis agregados (anónimos)

## 3. Compartición de Datos

**No vendemos tus datos.** Solo compartimos información con:
- Stripe (procesamiento de pagos)
- Proveedores de infraestructura (Supabase, hosting)
- Cuando sea requerido por ley

## 4. Retención de Datos

- Datos de cuenta: mientras la cuenta esté activa
- Testimonios: hasta que los elimines o canceles
- Logs técnicos: 90 días

## 5. Tus Derechos (GDPR)

Tienes derecho a:
- **Acceso:** Solicitar copia de tus datos
- **Rectificación:** Corregir datos inexactos
- **Eliminación:** Solicitar borrado de tu cuenta
- **Portabilidad:** Exportar tus datos en CSV
- **Oposición:** Oponerte al procesamiento

Para ejercer estos derechos: privacy@testimonioya.com

## 6. Seguridad

- Conexiones cifradas (HTTPS)
- Contraseñas hasheadas
- Acceso restringido a datos
- Copias de seguridad regulares

## 7. Cookies

Usamos cookies esenciales para:
- Mantener tu sesión activa
- Recordar preferencias
- Seguridad

No usamos cookies de seguimiento ni publicidad.

## 8. Menores

El Servicio no está dirigido a menores de 18 años.

## 9. Transferencias Internacionales

Tus datos pueden procesarse en servidores de la UE y EE.UU. con las salvaguardas apropiadas.

## 10. Cambios

Notificaremos cambios significativos por email.

## 11. Contacto

Responsable de datos: privacy@testimonioya.com
    `,
  },
  cookies: {
    title: 'Política de Cookies',
    content: `
# Política de Cookies de TestimonioYa

**Última actualización:** Febrero 2026

## ¿Qué son las Cookies?

Las cookies son pequeños archivos de texto que los sitios web almacenan en tu navegador.

## Cookies que Usamos

### Cookies Esenciales (Necesarias)

| Cookie | Propósito | Duración |
|--------|-----------|----------|
| sb-auth-token | Autenticación de sesión | Sesión |
| sb-refresh-token | Renovación de sesión | 7 días |

Estas cookies son necesarias para que el servicio funcione. No puedes desactivarlas.

### Cookies de Preferencias

| Cookie | Propósito | Duración |
|--------|-----------|----------|
| theme | Modo claro/oscuro | 1 año |
| sidebar | Estado del menú | 1 año |

## Cookies de Terceros

**No usamos cookies de terceros** para publicidad ni seguimiento.

Stripe (procesador de pagos) puede usar sus propias cookies en la página de pago.

## Cómo Gestionar Cookies

Puedes configurar tu navegador para:
- Bloquear todas las cookies
- Eliminar cookies existentes
- Recibir aviso antes de aceptar cookies

Ten en cuenta que bloquear cookies esenciales impedirá usar el servicio.

## Más Información

Para dudas: privacy@testimonioya.com
    `,
  },
}

export default function Legal() {
  const { page } = useParams<{ page: string }>()
  const legalPage = (page || 'terms') as LegalPage
  const content = legalContent[legalPage]

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">TestimonioYa</span>
            </Link>
            <Link 
              to="/" 
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{content.title}</h1>
          
          <div className="prose prose-gray max-w-none">
            {content.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.replace('### ', '')}</h3>
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 text-gray-700">{line.replace('- ', '')}</li>
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-gray-900">{line.replace(/\*\*/g, '')}</p>
              }
              if (line.trim() === '') {
                return <br key={i} />
              }
              return <p key={i} className="text-gray-700 mb-2">{line}</p>
            })}
          </div>
        </div>

        {/* Other legal pages */}
        <div className="mt-8 flex justify-center space-x-6 text-sm">
          <Link 
            to="/legal/terms" 
            className={`${legalPage === 'terms' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Términos
          </Link>
          <Link 
            to="/legal/privacy" 
            className={`${legalPage === 'privacy' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Privacidad
          </Link>
          <Link 
            to="/legal/cookies" 
            className={`${legalPage === 'cookies' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Cookies
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TestimonioYa. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
