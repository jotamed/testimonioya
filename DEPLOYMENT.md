# 🚀 Guía de Deployment - TestimonioYa

Esta guía cubre el deployment completo a producción.

## Pre-requisitos

- [ ] Base de datos Supabase configurada
- [ ] `npm run build` ejecuta sin errores
- [ ] Cuenta en plataforma de hosting (Vercel/Netlify)
- [ ] Dominio personalizado (opcional)

---

## Opción 1: Vercel (Recomendado) ⚡

### Por qué Vercel
- ✅ Deploy automático desde Git
- ✅ CDN global incluido
- ✅ HTTPS automático
- ✅ Preview deployments para PRs
- ✅ Gratis para proyectos personales

### Pasos

#### 1. Conectar desde GitHub

```bash
# 1. Crea repo en GitHub
git init
git add .
git commit -m "Initial commit - TestimonioYa MVP"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/testimonioya.git
git push -u origin main
```

#### 2. Importar en Vercel

1. Ve a https://vercel.com
2. Click "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

¡Listo! Tu app estará en `https://testimonioya.vercel.app`

#### 3. Dominio Personalizado (Opcional)

1. En Vercel, ve a Settings → Domains
2. Agrega tu dominio: `testimonioya.com`
3. Configura DNS según instrucciones:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Espera propagación (5-60 min)

---

## Opción 2: Netlify 🎨

### Por qué Netlify
- ✅ Forms integrados (útil para contacto)
- ✅ Functions serverless
- ✅ Split testing A/B
- ✅ Analytics incluido

### Pasos

#### Via Git

1. Push a GitHub (como arriba)
2. Ve a https://netlify.com
3. "Add new site" → "Import from Git"
4. Selecciona repo
5. Configuración:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy"

#### Via CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Configuración de Redirects

Crea `public/_redirects`:
```
/*    /index.html   200
```

Esto asegura que React Router funcione correctamente.

---

## Opción 3: Servidor Propio (VPS) 🖥️

### Requisitos
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- Nginx
- Certbot (para SSL)

### 1. Preparar Servidor

```bash
# Conectar via SSH
ssh root@tu-servidor.com

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Nginx
apt install -y nginx

# Instalar Certbot
apt install -y certbot python3-certbot-nginx
```

### 2. Subir Archivos

```bash
# En tu máquina local
npm run build

# Comprimir
tar -czf dist.tar.gz dist/

# Subir
scp dist.tar.gz root@tu-servidor.com:/var/www/

# En el servidor
cd /var/www
tar -xzf dist.tar.gz
mv dist testimonioya
chown -R www-data:www-data testimonioya
```

### 3. Configurar Nginx

```bash
# Crear config
nano /etc/nginx/sites-available/testimonioya
```

Contenido:
```nginx
server {
    listen 80;
    server_name testimonioya.com www.testimonioya.com;
    root /var/www/testimonioya;
    index index.html;

    # Comprimir assets
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1024;

    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Activar sitio
ln -s /etc/nginx/sites-available/testimonioya /etc/nginx/sites-enabled/

# Test config
nginx -t

# Recargar
systemctl reload nginx
```

### 4. SSL con Let's Encrypt

```bash
certbot --nginx -d testimonioya.com -d www.testimonioya.com
```

Sigue las instrucciones. Certbot configurará HTTPS automáticamente.

### 5. Auto-renovación SSL

```bash
# Test renovación
certbot renew --dry-run

# Cron ya está configurado automáticamente por certbot
```

---

## Configuración de Supabase para Producción

### 1. Actualizar URLs Permitidas

En Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://testimonioya.com
Redirect URLs:
  https://testimonioya.com/**
  https://www.testimonioya.com/**
```

### 2. Configurar Email Templates

Authentication → Email Templates → Customize:

- **Confirm signup**: Personaliza con tu marca
- **Reset password**: Personaliza
- **Magic link**: Personaliza

### 3. SMTP Personalizado (Opcional)

Authentication → Settings → SMTP Settings

Usa SendGrid, Mailgun o similar para emails profesionales.

### 4. Backup Automático

Settings → Database → Backups

- Habilita backups diarios
- Retención: 7 días (gratis)

---

## Configuración DNS

### Registrar en Namecheap/Cloudflare/etc.

#### Para Vercel/Netlify:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com (o similar)
TTL: Auto
```

#### Para VPS:
```
Type: A
Name: @
Value: IP_DE_TU_SERVIDOR
TTL: 300

Type: A  
Name: www
Value: IP_DE_TU_SERVIDOR
TTL: 300
```

---

## Monitoreo y Analíticas

### 1. Google Analytics

Agregar a `index.html` antes de `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. Plausible (Alternativa privacy-first)

```html
<script defer data-domain="testimonioya.com" src="https://plausible.io/js/script.js"></script>
```

### 3. Sentry (Error Tracking)

```bash
npm install @sentry/react
```

`src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "TU_DSN_AQUI",
  environment: "production",
});
```

---

## Performance Optimización

### 1. Lighthouse Score Target
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 2. Optimizaciones Aplicadas
- ✅ Code splitting (React Router)
- ✅ Tree shaking (Vite)
- ✅ Minificación
- ✅ Gzip/Brotli
- ✅ Image optimization (preparado)
- ✅ Lazy loading (preparado)

### 3. CDN para Assets Estáticos

Considera usar:
- Cloudflare (gratis)
- AWS CloudFront
- Vercel Edge Network (incluido)

---

## Seguridad en Producción

### Checklist

- [ ] HTTPS habilitado
- [ ] CORS configurado en Supabase
- [ ] RLS habilitado en todas las tablas
- [ ] Rate limiting configurado
- [ ] Security headers (CSP, X-Frame-Options, etc.)
- [ ] Secrets nunca en código (usar env vars)
- [ ] Validación de inputs
- [ ] Sanitización de outputs
- [ ] Error messages genéricos (no exponer detalles)

### Variables de Entorno

Para producción, considera mover credenciales a `.env`:

```bash
# .env.production
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Actualizar `src/lib/supabase.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## CI/CD Automático

### GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test # cuando agregues tests
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Rollback Plan

### Si algo falla en producción:

#### Vercel/Netlify:
1. Ve a Deployments
2. Encuentra último deploy funcional
3. Click "Promote to Production"

#### VPS:
```bash
# Revertir a backup
cd /var/www
mv testimonioya testimonioya-broken
tar -xzf backup-FECHA.tar.gz
mv dist testimonioya
systemctl reload nginx
```

---

## Soporte y Mantenimiento

### Daily
- [ ] Revisar logs de errores (Sentry)
- [ ] Verificar uptime (uptimerobot.com)

### Weekly
- [ ] Revisar analíticas
- [ ] Responder a usuarios
- [ ] Aprobar testimonios

### Monthly
- [ ] Actualizar dependencias (`npm update`)
- [ ] Revisar security advisories (`npm audit`)
- [ ] Backup manual de DB
- [ ] Revisar costos de Supabase

---

## Troubleshooting Común

### 404 en rutas
➡️ Configurar redirects para SPA routing

### CORS error
➡️ Agregar dominio en Supabase → Settings → API → CORS

### Build falla
➡️ Verificar `npm run build` local primero

### Emails no llegan
➡️ Revisar Supabase logs, configurar SMTP

### Lentitud
➡️ Activar CDN, optimizar imágenes, revisar queries DB

---

## ✅ Post-Deployment Checklist

Después de deploy, verifica:

- [ ] Landing page carga correctamente
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] Crear enlace funciona
- [ ] Formulario público acepta testimonios
- [ ] Muro muestra testimonios
- [ ] Widget se puede embeber
- [ ] Emails se envían
- [ ] SSL/HTTPS activo
- [ ] Analytics funcionando
- [ ] Sin errores en consola

---

## 🎉 ¡Felicidades!

Tu aplicación está en producción. Ahora enfócate en:

1. **Marketing**: Conseguir primeros usuarios
2. **Feedback**: Escuchar y mejorar
3. **Iteración**: Agregar features solicitadas
4. **Escalabilidad**: Optimizar cuando sea necesario

---

**Última actualización**: Enero 2024
