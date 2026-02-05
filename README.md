# TestimonioYa 🌟

Una plataforma completa para recolectar y mostrar testimonios de clientes por WhatsApp. Construido con React, Vite, Tailwind CSS y Supabase.

## 🚀 Características

- ✅ Autenticación con Supabase Auth
- 📝 Dashboard completo para gestionar testimonios
- 🔗 Enlaces de recolección personalizados
- ⭐ Sistema de calificación con estrellas
- 🎨 Personalización de marca (colores, logo, mensajes)
- 📱 Diseño mobile-first y responsive
- 💬 Integración con WhatsApp
- 🏆 Muro público de testimonios
- 🔧 Widget embebido para sitios web
- 🔐 Row Level Security (RLS) habilitado

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   cd business/testimonioya
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura la base de datos en Supabase**
   
   a. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
   
   b. Abre el SQL Editor
   
   c. Copia y pega el contenido de `database.sql`
   
   d. Ejecuta el script

4. **Configura las variables de entorno** (ya configuradas en el código)
   
   Las credenciales de Supabase ya están incluidas en `src/lib/supabase.ts`:
   - URL: https://wnmfanhejnrtfccemlai.supabase.co
   - Anon Key: (incluida en el archivo)

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**
   
   Visita `http://localhost:5173`

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en el directorio `dist/`.

Para previsualizar el build:
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
testimonioya/
├── src/
│   ├── components/
│   │   └── DashboardLayout.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── Landing.tsx           # Página de inicio
│   │   ├── Login.tsx              # Inicio de sesión
│   │   ├── Register.tsx           # Registro
│   │   ├── Dashboard.tsx          # Panel principal
│   │   ├── Testimonials.tsx       # Gestión de testimonios
│   │   ├── CollectionLinks.tsx    # Enlaces de recolección
│   │   ├── Settings.tsx           # Configuración
│   │   ├── Widget.tsx             # Widget embebido
│   │   ├── TestimonialForm.tsx    # Formulario público
│   │   └── WallOfLove.tsx         # Muro de testimonios
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── database.sql                    # Schema de base de datos
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🎯 Rutas de la Aplicación

### Públicas
- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro
- `/t/:slug` - Formulario de testimonio
- `/wall/:slug` - Muro público de testimonios

### Privadas (requieren autenticación)
- `/dashboard` - Panel principal
- `/dashboard/testimonials` - Lista de testimonios
- `/dashboard/links` - Gestión de enlaces
- `/dashboard/settings` - Configuración
- `/dashboard/widget` - Widget embebido

## 💾 Base de Datos

El schema incluye 3 tablas principales:

1. **businesses** - Información de negocios
2. **testimonials** - Testimonios de clientes
3. **collection_links** - Enlaces de recolección

Todas las tablas tienen Row Level Security (RLS) habilitado para proteger los datos.

## 🎨 Personalización

### Colores
El color principal se puede cambiar en `/dashboard/settings`. Por defecto es `#4f46e5` (indigo-600).

### Mensaje de Bienvenida
Personaliza el mensaje que verán los clientes en el formulario desde `/dashboard/settings`.

## 📱 Integración con WhatsApp

El formulario incluye un botón "Enviar por WhatsApp" que genera un enlace `wa.me` con el testimonio pre-formateado.

## 🔧 Widget Embebido

Para integrar testimonios en tu sitio web:

1. Ve a `/dashboard/widget`
2. Copia el código proporcionado
3. Pégalo en tu HTML donde quieras mostrar los testimonios

## 🎭 Planes

- **Gratis**: Hasta 10 testimonios/mes, 1 enlace, marca TestimonioYa visible
- **Pro (€19/mes)**: Testimonios ilimitados, sin marca, widget embebido
- **Premium (€49/mes)**: Todo lo anterior + 5 negocios, analíticas, API

## 🐛 Solución de Problemas

### Error al iniciar el servidor
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error de compilación TypeScript
```bash
npm run build
```

Si hay errores, revisa los tipos en `src/lib/supabase.ts`

### Error de conexión a Supabase
Verifica que las credenciales en `src/lib/supabase.ts` sean correctas.

## 📄 Licencia

Copyright © 2024 TestimonioYa. Todos los derechos reservados.

## 🤝 Soporte

Para soporte, contacta a: soporte@testimonioya.com
# Trigger deploy
