# TestimonioYa - Plan de Lanzamiento

> Documento creado: 5 Feb 2026  
> Objetivo: Lanzamiento estructurado con QA completo, features por vertical, y go-to-market

---

## 📊 RESUMEN EJECUTIVO

**Estado actual:** MVP funcional con features básicas implementadas  
**Objetivo:** Lanzamiento público Q1 2026  
**Timeline:** 4 semanas hasta lanzamiento soft, 6 semanas hasta Product Hunt

---

## 1. 🧪 CRASH TEST / QA

### 1.1 Checklist Funcional

#### Autenticación
- [ ] Registro con email/password
- [ ] Registro con Google OAuth
- [ ] Login con email/password
- [ ] Login con Google
- [ ] Recuperación de contraseña
- [ ] Logout
- [ ] Sesión persistente (refresh token)

#### Onboarding
- [ ] Flujo completo nuevo usuario → negocio creado
- [ ] Selección de industria funciona
- [ ] Mensaje de bienvenida personalizado por industria
- [ ] Creación automática de primer enlace de colección

#### Dashboard
- [ ] Carga correcta de datos del negocio
- [ ] Contador de testimonios actualizado
- [ ] Barra de uso (límite plan)
- [ ] Links de navegación funcionan

#### Testimonios
- [ ] Recepción de testimonio texto
- [ ] Recepción de testimonio audio
- [ ] Aprobación/rechazo funciona
- [ ] Destacar testimonio funciona
- [ ] Filtros funcionan (todos/pendientes/aprobados/rechazados)
- [ ] Reproductor de audio funciona

#### Enlaces de Colección
- [ ] Crear nuevo enlace
- [ ] Editar enlace existente
- [ ] Activar/desactivar enlace
- [ ] Copiar URL
- [ ] QR code se genera correctamente
- [ ] QR code descarga como PNG

#### Formulario Público (/t/slug)
- [ ] Carga con datos del negocio
- [ ] Validación de campos requeridos
- [ ] Selector texto/audio (si está habilitado)
- [ ] Grabación de audio funciona en móvil
- [ ] Grabación de audio funciona en desktop
- [ ] Envío de testimonio texto
- [ ] Envío de testimonio audio
- [ ] Mensaje de confirmación
- [ ] Límite de plan bloquea envíos correctamente

#### Wall of Love (/wall/slug)
- [ ] Muestra testimonios aprobados
- [ ] Destacados aparecen primero
- [ ] Rating promedio calculado
- [ ] Reproductor de audio en cards
- [ ] Responsive mobile/desktop
- [ ] Branding "Powered by" solo en plan free

#### Settings
- [ ] Editar nombre de negocio
- [ ] Editar industria
- [ ] Cambiar color de marca
- [ ] Cambiar mensaje de bienvenida
- [ ] Toggle audio testimonios
- [ ] Ver muro público

#### Pagos (Stripe)
- [ ] Checkout Pro funciona
- [ ] Checkout Premium funciona
- [ ] Webhook procesa pagos
- [ ] Plan se actualiza tras pago
- [ ] Límites se actualizan según plan

#### Analytics (Premium)
- [ ] Gráfico de vistas
- [ ] Tasa de conversión
- [ ] Rating promedio
- [ ] Datos por enlace

### 1.2 Edge Cases

- [ ] Usuario sin negocio → redirige a onboarding
- [ ] Enlace inactivo → muestra mensaje apropiado
- [ ] Enlace inexistente → 404 amigable
- [ ] Negocio en límite → bloquea nuevos testimonios
- [ ] Audio muy largo (>2min) → se corta
- [ ] Nombre de negocio con caracteres especiales
- [ ] Slug duplicado → genera único
- [ ] Sesión expirada → redirige a login

### 1.3 Testing por Dispositivo

| Dispositivo | Chrome | Safari | Firefox |
|-------------|--------|--------|---------|
| Desktop Mac | [ ] | [ ] | [ ] |
| Desktop Win | [ ] | N/A | [ ] |
| iPhone | [ ] | [ ] | N/A |
| Android | [ ] | N/A | [ ] |

### 1.4 Testing de Carga

- [ ] 100 testimonios en un negocio
- [ ] 50 enlaces de colección
- [ ] Wall con 100+ testimonios (paginación?)
- [ ] Upload de audio 10MB

---

## 2. 🎯 FEATURES POR VERTICAL

### 2.1 Análisis de Necesidades

| Vertical | Necesidad Principal | Feature Clave | Prioridad |
|----------|--------------------|--------------| --------|
| Coach/Consultor | Credibilidad | Video testimonios | Alta |
| Fitness | Transformaciones | Antes/después fotos | Alta |
| Belleza | Portfolio visual | Galería de trabajos | Media |
| Salud | Confianza | Verificación paciente | Baja |
| Restaurante | Reviews rápidas | Integración Google | Alta |
| Formación | Resultados | Métricas de alumnos | Media |
| Inmobiliaria | Social proof | Casos de éxito | Media |
| E-commerce | Conversión | Widget en producto | Alta |

### 2.2 Features Pendientes - Priorizadas

#### P0 - Críticas para lanzamiento
1. **Widget embebible** - Código para insertar testimonios en cualquier web
2. **Video testimonios** - Subir/grabar video además de audio
3. **Importar de Google Reviews** - Traer reviews existentes

#### P1 - Importantes post-lanzamiento
4. **Integración WhatsApp Business** - Envío automático de solicitudes
5. **Email automático post-compra** - Trigger para pedir testimonio
6. **Plantillas de email** - Personalizar solicitudes

#### P2 - Nice to have
7. **Antes/después** - Subir 2 fotos comparativas
8. **Widget carrusel** - Mostrar testimonios rotativos
9. **Exportar a imagen** - Crear gráfico para redes

#### P3 - Futuro
10. **API pública** - Para integraciones custom
11. **Zapier/Make** - Conectar con otras apps
12. **Multi-idioma** - EN, PT además de ES

### 2.3 Estimación de Desarrollo

| Feature | Esfuerzo | Impacto | Score |
|---------|----------|---------|-------|
| Widget embebible | 2 días | Alto | ⭐⭐⭐⭐⭐ |
| Video testimonios | 3 días | Alto | ⭐⭐⭐⭐⭐ |
| Importar Google | 2 días | Alto | ⭐⭐⭐⭐ |
| WhatsApp Business | 4 días | Alto | ⭐⭐⭐⭐ |
| Email automático | 2 días | Medio | ⭐⭐⭐ |
| Antes/después | 1 día | Medio | ⭐⭐⭐ |

---

## 3. 🚀 GO-TO-MARKET

### 3.1 Posicionamiento

**Tagline:** "Convierte clientes felices en tu mejor marketing"

**Diferenciadores:**
- Español-first (mercado España/LATAM desatendido)
- Audio/video testimonios (no solo texto)
- QR físico incluido
- Precio agresivo (€19 vs $30-50 competencia)
- Simplicidad brutal (setup en 2 min)

**Target inicial:**
- Coaches y consultores España
- Gimnasios/entrenadores personales
- Pequeños restaurantes/cafeterías

### 3.2 SEO

#### Keywords principales
| Keyword | Vol. Estimado | Dificultad | Prioridad |
|---------|---------------|------------|-----------|
| recopilar testimonios clientes | Media | Baja | ⭐⭐⭐⭐⭐ |
| software testimonios | Media | Media | ⭐⭐⭐⭐ |
| reseñas de clientes | Alta | Alta | ⭐⭐⭐ |
| social proof herramienta | Baja | Baja | ⭐⭐⭐⭐ |
| wall of love testimonios | Baja | Baja | ⭐⭐⭐⭐⭐ |

#### Landing pages por vertical (crear)
- [ ] /para/coaches - "Testimonios para Coaches"
- [ ] /para/gimnasios - "Testimonios para Gimnasios"
- [ ] /para/restaurantes - "Reseñas para Restaurantes"
- [ ] /para/clinicas - "Testimonios para Clínicas"
- [ ] /para/ecommerce - "Reviews para Tiendas Online"

#### Blog posts (planificar)
1. "Cómo pedir testimonios a tus clientes sin ser pesado"
2. "5 formas de usar testimonios para vender más"
3. "Por qué los video testimonios convierten 3x más"
4. "Guía: Crear un Wall of Love que venda"

### 3.3 Captación Inicial (Primeros 100 usuarios)

#### Semana 1-2: Validación cercana
- [ ] 10 conocidos/contactos directos que tengan negocio
- [ ] Feedback detallado de cada uno
- [ ] Iterar según feedback

#### Semana 3-4: Comunidades
- [ ] Post en Indie Hackers (español)
- [ ] Post en forobetas.com
- [ ] Grupos Facebook emprendedores España
- [ ] Slack/Discord de startups españolas

#### Semana 5-6: Lanzamiento público
- [ ] Product Hunt launch
- [ ] Twitter thread de Jorge anunciando
- [ ] LinkedIn post
- [ ] Hacker News (Show HN)

### 3.4 Promoción Continua

#### Twitter/X de Jorge (@jorgeundressed)
- Compartir insights del desarrollo
- Mostrar métricas transparentes (#buildinpublic)
- Casos de uso reales
- Tips de testimonios/social proof

#### Contenido
- 1 blog post / semana
- 3 tweets / semana sobre el tema
- 1 video demo / mes

### 3.5 Partnerships

- Integradores web/WordPress freelancers
- Agencias de marketing digital
- Consultores de negocio

---

## 4. 📈 ESCALABILIDAD TÉCNICA

### 4.1 Estado Actual

| Componente | Tecnología | Límite Actual |
|------------|------------|---------------|
| Frontend | React + Vite | ∞ (estático) |
| Hosting | GitHub Pages | ∞ (CDN) |
| Backend | Supabase | 500MB DB, 1GB storage |
| Auth | Supabase Auth | 50k MAU free |
| Storage | Supabase Storage | 1GB free |
| Pagos | Stripe | Sin límite |

### 4.2 Cuellos de Botella Potenciales

1. **Storage de audio/video** - 1GB se llena rápido
   - Solución: Upgrade Supabase o S3
   
2. **Base de datos** - 500MB límite
   - Solución: Upgrade a Pro ($25/mes)
   
3. **Edge functions** - 500k invocaciones/mes
   - Solución: Suficiente para empezar

### 4.3 Preparar Antes de Escalar

- [ ] Monitorización de uso (dashboard interno)
- [ ] Alertas de límites
- [ ] Plan de migración a Supabase Pro
- [ ] Backup automático de DB
- [ ] CDN para assets estáticos (ya con GitHub Pages)

### 4.4 Costes Proyectados

| Usuarios | DB | Storage | Auth | Total/mes |
|----------|-----|---------|------|-----------|
| 0-100 | Free | Free | Free | €0 |
| 100-500 | Pro $25 | Pro | Free | ~€25 |
| 500-2000 | Pro $25 | $0.02/GB | Free | ~€30-50 |
| 2000+ | Team | Team | Pro | ~€100+ |

---

## 5. 📅 TIMELINE

### Semana 1 (6-12 Feb)
- [ ] **Lun-Mar:** Crash test completo
- [ ] **Mié-Jue:** Fixes de bugs encontrados
- [ ] **Vie:** Widget embebible v1

### Semana 2 (13-19 Feb)
- [ ] **Lun-Mar:** Video testimonios
- [ ] **Mié-Jue:** Importar Google Reviews
- [ ] **Vie:** Landing pages por vertical

### Semana 3 (20-26 Feb)
- [ ] **Lun-Mar:** Testing con 10 usuarios beta
- [ ] **Mié-Jue:** Iteración según feedback
- [ ] **Vie:** Preparar assets para lanzamiento

### Semana 4 (27 Feb - 5 Mar)
- [ ] **Lun:** Soft launch en comunidades
- [ ] **Mar-Jue:** Monitorizar y ajustar
- [ ] **Vie:** Preparar Product Hunt

### Semana 5-6 (6-19 Mar)
- [ ] **Semana 5:** Product Hunt launch
- [ ] **Semana 6:** PR y contenido post-lanzamiento

---

## 6. 📋 ACCIONES INMEDIATAS (Esta Semana)

### Hoy (Jueves 6 Feb)
- [ ] Revisar este plan con Jorge
- [ ] Priorizar ajustes
- [ ] Empezar crash test

### Viernes 7 Feb
- [ ] Completar crash test auth + onboarding
- [ ] Documentar bugs encontrados

### Fin de semana
- [ ] Crash test completo de flujos principales
- [ ] Lista de fixes priorizados

### Lunes 10 Feb
- [ ] Empezar fixes
- [ ] Comenzar widget embebible

---

## 7. 📊 MÉTRICAS DE ÉXITO

### Lanzamiento (Mes 1)
- 100 usuarios registrados
- 50 negocios activos
- 500 testimonios recolectados
- 5 usuarios de pago

### Mes 3
- 500 usuarios registrados
- 200 negocios activos
- 5,000 testimonios
- 25 usuarios de pago
- MRR: €500

### Mes 6
- 2,000 usuarios registrados
- 800 negocios activos
- 25,000 testimonios
- 100 usuarios de pago
- MRR: €2,000

---

## 8. 💡 NOTAS Y DECISIONES PENDIENTES

### Por decidir
- ¿Freemium o trial de 14 días?
- ¿Límite de 10 testimonios/mes es correcto?
- ¿Añadir plan intermedio (€9)?
- ¿Priorizar España o ir global desde el inicio?

### Ideas aparcadas
- App móvil nativa
- Marketplace de servicios de video
- White-label para agencias

---

*Última actualización: 5 Feb 2026 22:15*

---

## 9. 📣 PROMOCIÓN Y CAPTACIÓN DE LEADS

### 9.1 Lead Magnets

#### Recursos gratuitos (para captar emails)
1. **Guía PDF:** "10 Emails para pedir testimonios que funcionan"
   - Templates copy-paste
   - Asunto + cuerpo optimizados
   - Captura email para descargar

2. **Checklist:** "Checklist de Social Proof para tu web"
   - Donde poner testimonios
   - Formatos que convierten
   - Quick wins

3. **Mini-curso email (5 días):**
   - Día 1: Por qué los testimonios venden
   - Día 2: Cuándo pedir un testimonio
   - Día 3: Cómo pedir sin ser pesado
   - Día 4: Dónde mostrar testimonios
   - Día 5: Automatiza el proceso (CTA TestimonioYa)

### 9.2 Canales de Captación

#### Orgánico (0€)
| Canal | Acción | Frecuencia |
|-------|--------|------------|
| Twitter/X | Hilos sobre social proof, tips testimonios | 3x/semana |
| LinkedIn | Posts profesionales, casos de uso | 2x/semana |
| Blog SEO | Artículos long-tail keywords | 1x/semana |
| YouTube | Tutorial "cómo pedir testimonios" | 1x/mes |
| Grupos FB | Valor en grupos emprendedores ES | Daily |
| Reddit | r/startups_espanol, r/emprendedores | 2x/semana |

#### Colaboraciones
- **Guest posts** en blogs de marketing/startups españoles
- **Podcasts** de emprendimiento (como invitado)
- **Webinars** con comunidades (Notion España, Indie Hackers ES)
- **Cross-promo** con herramientas complementarias (CRMs, email marketing)

#### Paid (fase 2, post-validación)
- Google Ads: Keywords "testimonios clientes", "reseñas web"
- Facebook/IG: Retargeting visitantes landing
- Sponsorship newsletters españolas (Borraja, etc.)

### 9.3 Funnel de Conversión

```
[Contenido/Ads] → [Landing Page]
                        ↓
              [Lead Magnet - Email]
                        ↓
              [Nurture Sequence 5 días]
                        ↓
              [Trial / Free Plan]
                        ↓
              [Onboarding Email]
                        ↓
              [Upgrade a Pro]
```

### 9.4 Email Sequences

#### Sequence 1: Welcome (tras registro)
- Email 1 (inmediato): Bienvenida + primeros pasos
- Email 2 (día 2): Tip para conseguir primer testimonio
- Email 3 (día 5): "¿Ya tienes tu primer testimonio?"
- Email 4 (día 7): Caso de éxito + CTA upgrade

#### Sequence 2: Lead Magnet (descarga sin registro)
- Email 1 (inmediato): Entrega del recurso
- Email 2 (día 2): "¿Te fue útil? Un tip extra..."
- Email 3 (día 4): Historia de cliente
- Email 4 (día 7): Oferta especial / trial extendido

#### Sequence 3: Usuarios inactivos
- Email 1 (día 14 sin login): "Te echamos de menos"
- Email 2 (día 21): "Tu Wall of Love está esperando"
- Email 3 (día 30): Última oportunidad + descuento

### 9.5 Métricas de Captación

| Métrica | Target Mes 1 | Target Mes 3 |
|---------|--------------|--------------|
| Visitas landing | 2,000 | 10,000 |
| Leads (emails) | 200 | 1,000 |
| Registros | 100 | 500 |
| Tasa conversión landing | 5% | 5% |
| Tasa registro → activo | 50% | 60% |
| Churn mensual | <10% | <8% |

### 9.6 Herramientas Recomendadas

- **Email:** Resend (ya tienes) o Loops.so
- **Landing pages:** El propio site + /para/[vertical]
- **Analytics:** Plausible o Umami (privacy-first)
- **Forms:** Tally.so para leads
- **CRM simple:** Notion o Airtable inicialmente

### 9.7 Acciones Inmediatas de Marketing

#### Esta semana
- [ ] Crear landing de lead magnet simple
- [ ] Escribir guía PDF "10 emails para pedir testimonios"
- [ ] Configurar Resend/Loops para nurture
- [ ] Publicar 2-3 tweets sobre testimonios

#### Próxima semana
- [ ] Lanzar lead magnet en Twitter
- [ ] Post en Indie Hackers ES
- [ ] Escribir primer artículo blog SEO
- [ ] Preparar assets para Product Hunt

---

*Sección añadida: 6 Feb 2026*
