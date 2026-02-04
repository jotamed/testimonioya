# 🚀 Guía de Configuración de TestimonioYa

Esta guía te llevará paso a paso desde cero hasta tener TestimonioYa funcionando.

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - Nombre: "TestimonioYa"
   - Database Password: (guárdalo en un lugar seguro)
   - Region: Elige la más cercana a tus usuarios
5. Espera 2-3 minutos mientras se crea el proyecto

### 1.2 Configurar Base de Datos
1. En el dashboard de Supabase, ve a "SQL Editor"
2. Click en "New query"
3. Abre el archivo `database.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor SQL
5. Click en "Run" (o presiona Ctrl/Cmd + Enter)
6. Deberías ver: "Success. No rows returned"

### 1.3 Obtener Credenciales
1. Ve a "Settings" → "API"
2. Encuentra:
   - **Project URL**: https://xxxxx.supabase.co
   - **anon/public key**: eyJhbGciOiJIUzI1NiIsInR5...
3. Estas credenciales YA están configuradas en el proyecto actual

## Paso 2: Instalar Dependencias

```bash
# Navega al directorio del proyecto
cd business/testimonioya

# Instala las dependencias
npm install
```

Si usas yarn:
```bash
yarn install
```

## Paso 3: Verificar Configuración

El archivo `src/lib/supabase.ts` ya contiene las credenciales:

```typescript
const supabaseUrl = 'https://wnmfanhejnrtfccemlai.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Si creaste un proyecto Supabase diferente**, actualiza estas dos líneas con tus propias credenciales.

## Paso 4: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Deberías ver:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Paso 5: Probar la Aplicación

1. Abre http://localhost:5173
2. Click en "Crear Cuenta Gratis"
3. Completa el formulario:
   - Nombre del Negocio: "Mi Restaurante"
   - Email: tu@email.com
   - Contraseña: (mínimo 6 caracteres)
4. Click en "Crear Cuenta"

Si todo funciona, serás redirigido al dashboard! 🎉

## Paso 6: Crear Tu Primer Enlace

1. En el dashboard, click en "Enlaces" en la barra lateral
2. Click en "Crear Enlace"
3. Nombre: "Clientes General"
4. Click en "Crear Enlace"
5. Copia el enlace y compártelo con un cliente

## Paso 7: Build para Producción

Cuando estés listo para desplegar:

```bash
npm run build
```

Esto creará una carpeta `dist/` con todos los archivos optimizados.

## 🌐 Despliegue

### Opción 1: Vercel (Recomendado)

1. Crea cuenta en https://vercel.com
2. Instala Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Desde el directorio del proyecto:
   ```bash
   vercel
   ```
4. Sigue las instrucciones en pantalla
5. ¡Listo! Tu app estará en línea en segundos

### Opción 2: Netlify

1. Crea cuenta en https://netlify.com
2. Instala Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```
3. Build y deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Opción 3: Manual (Cualquier Servidor)

1. Build:
   ```bash
   npm run build
   ```
2. Sube el contenido de `dist/` a tu servidor
3. Configura tu servidor web (nginx, Apache, etc.) para servir archivos estáticos
4. Asegúrate de que todas las rutas apunten a `index.html` (para React Router)

#### Ejemplo de configuración nginx:

```nginx
server {
    listen 80;
    server_name testimonioya.com;
    root /var/www/testimonioya/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔒 Seguridad para Producción

### 1. Habilitar Email Confirmación en Supabase

1. Ve a Authentication → Settings
2. Habilita "Enable email confirmations"
3. Configura tu dominio SMTP o usa el de Supabase

### 2. Configurar CORS

En Supabase → Settings → API → CORS:
- Agrega tu dominio de producción (ej: https://testimonioya.com)

### 3. Rate Limiting

Supabase incluye rate limiting por defecto, pero considera:
- Implementar reCAPTCHA en el formulario público
- Limitar creación de testimonios por IP

## 🐛 Problemas Comunes

### "Module not found" al hacer npm install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid API key"
- Verifica que copiaste correctamente la anon key de Supabase
- Revisa `src/lib/supabase.ts`

### Testimonios no aparecen en el muro
- Ve al dashboard → Testimonios
- Asegúrate de aprobar los testimonios (estado: "Aprobado")

### Error 403 en Supabase
- Verifica que ejecutaste TODO el script `database.sql`
- Las políticas RLS deben estar configuradas

### Build falla con errores TypeScript
```bash
npm run build -- --mode development
```
Esto mostrará más detalles del error

## 📞 ¿Necesitas Ayuda?

1. Revisa la consola del navegador (F12) para errores
2. Revisa los logs de Supabase en el dashboard
3. Verifica que la base de datos tenga las 3 tablas creadas

## ✅ Checklist de Deployment

- [ ] Base de datos configurada en Supabase
- [ ] Todas las tablas creadas (businesses, testimonials, collection_links)
- [ ] RLS habilitado y políticas creadas
- [ ] `npm run build` ejecuta sin errores
- [ ] Credenciales correctas en `src/lib/supabase.ts`
- [ ] Dominio configurado (si aplica)
- [ ] Email confirmación habilitada (recomendado)
- [ ] CORS configurado en Supabase

---

¡Felicidades! Tu plataforma TestimonioYa está lista para recibir testimonios 🌟
