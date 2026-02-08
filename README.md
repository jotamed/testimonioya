# TestimonioYa 🌟

Plataforma para recolectar y mostrar testimonios de clientes. Con sistema NPS inteligente que filtra detractores y solo pide reseñas a promotores.

**Stack:** React 18 + Vite + Tailwind CSS + Supabase + TypeScript

## 🚀 Características

- ✅ **NPS inteligente** — Filtra clientes insatisfechos antes de pedirles reseñas
- 📝 **Testimonios multimedia** — Texto, audio y video
- 🔗 **Enlaces de recolección** — Personalizados por campaña
- 🏆 **Wall of Love** — Página pública de testimonios
- 🔧 **Widget embebible** — `<script>` para cualquier sitio web
- 📊 **Dashboard & Analytics** — Métricas, NPS score, tendencias
- 📧 **Email automation** — Notificaciones vía Resend
- 🎨 **Personalización** — Colores de marca, mensajes custom
- 💳 **Planes** — Free / Pro con Stripe
- 🔐 **Auth completa** — Login, registro, verificación email, password recovery
- 📱 **Mobile-first** — Responsive design
- 🌐 **SEO optimizado** — Meta tags, Open Graph, páginas de comparación
- ⚡ **Code splitting** — Lazy loading de todas las rutas

## 📋 Requisitos

- Node.js 18+
- Cuenta de [Supabase](https://supabase.com)
- (Opcional) Cuenta de [Stripe](https://stripe.com) para pagos
- (Opcional) Cuenta de [Resend](https://resend.com) para emails

## 🛠️ Setup Local

```bash
# 1. Clonar e instalar
cd business/testimonioya
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de Supabase

# 3. Configurar base de datos
# Ejecutar database.sql en tu proyecto Supabase (SQL Editor)

# 4. Iniciar dev server
npm run dev
```

### Variables de Entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx        # Opcional
VITE_RESEND_API_KEY=re_xxx                # Opcional
```

## 🗄️ Base de Datos

El archivo `database.sql` contiene todo el schema. Las tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `businesses` | Negocios registrados (config, plan, branding) |
| `collection_links` | Enlaces de recolección por campaña |
| `testimonials` | Testimonios recibidos (text, audio, video) |
| `nps_responses` | Respuestas NPS con score y feedback |

Row Level Security (RLS) está habilitado en todas las tablas.

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── AudioRecorder    # Grabador de audio con detección de browser
│   ├── VideoRecorder    # Grabador de video con fallbacks
│   ├── AudioPlayer      # Reproductor de audio personalizado
│   ├── DashboardLayout  # Layout del dashboard
│   ├── Toast            # Sistema de notificaciones toast
│   ├── LoadingSkeleton   # Skeleton loaders
│   └── ...
├── pages/               # Páginas/rutas (lazy-loaded)
│   ├── Landing          # Landing principal
│   ├── VerticalLanding  # Landings por vertical (dentistas, gyms, etc)
│   ├── ComparisonPage   # Páginas vs competencia (SEO)
│   ├── Dashboard        # Dashboard principal con métricas
│   ├── NpsDashboard     # Dashboard NPS con scores
│   ├── TestimonialForm  # Formulario público de testimonios
│   ├── WallOfLove       # Muro público de testimonios
│   └── ...
├── lib/                 # Utilidades
│   ├── supabase.ts      # Cliente Supabase + tipos
│   ├── seo.ts           # Helper de meta tags dinámicos
│   ├── plans.ts         # Lógica de planes y límites
│   ├── stripe.ts        # Config de Stripe
│   └── email.ts         # Email automation con Resend
└── dist/
    └── widget.js        # Widget embebible standalone
```

## 🔧 Widget Embebible

```html
<div id="testimonioya-widget" 
     data-slug="tu-negocio"
     data-layout="grid"
     data-theme="light"
     data-max="6"
     data-show-header="true"
     data-brand-color="#6366f1">
</div>
<script src="https://testimonioya.com/widget.js"></script>
```

**Layouts disponibles:** `grid` | `carousel` | `list` | `masonry`
**Temas:** `light` | `dark`

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar env vars en Vercel Dashboard
```

El archivo `vercel.json` ya está configurado para SPA routing.

### Build Manual

```bash
npm run build
# Output en dist/ — servir como SPA (todas las rutas → index.html)
```

## 📱 Compatibilidad de Navegadores

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari |
|---------|--------|---------|--------|------|------------|
| Texto testimonios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audio grabación | ✅ | ✅ | ✅ 14.3+ | ✅ | ✅ 14.3+ |
| Video grabación | ✅ | ✅ | ⚠️ 14.3+ | ✅ | ⚠️ 14.3+ |

Los grabadores de audio/video detectan automáticamente la compatibilidad del navegador y muestran mensajes claros si no es compatible, sugiriendo alternativas.

## 📄 Licencia

Propietario. Todos los derechos reservados.
