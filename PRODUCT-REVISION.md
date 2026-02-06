# TestimonioYa - Revisión Producto con NPS-First

> Fecha: 6 Feb 2026
> Trigger: Insight de Jorge sobre conectar servicio con envío de petición

---

## 🎯 CAMBIO FUNDAMENTAL DE PROPUESTA

### ANTES (Manual)
```
Negocio copia link → Lo envía manualmente → Cliente rellena → Testimonio
```
**Problema:** Depende del esfuerzo del negocio, baja conversión

### AHORA (NPS-First Automático)
```
Cliente compra → Trigger automático → Encuesta NPS →
  ├─ [0-6] Detractor → Feedback PRIVADO → Alertas al negocio
  ├─ [7-8] Pasivo → Sugerencias internas
  └─ [9-10] Promotor → Solicitud testimonio → Wall of Love
```

**Beneficios:**
1. Solo testimonios de clientes felices (NPS 9-10)
2. Capturas feedback negativo ANTES de que vaya a Google
3. Métricas NPS reales de tu negocio
4. Automatizado = sin esfuerzo del negocio

---

## 📊 PROPUESTA NUEVOS PLANES

### FREE - €0/mes
**Para:** Probar el sistema, negocios muy pequeños

| Feature | Límite |
|---------|--------|
| Encuestas NPS | 25/mes |
| Testimonios (de promotores) | 10/mes |
| Links NPS/Testimonio | 1 |
| Muro público | ✅ |
| Audio/Video | ❌ Solo texto |
| Widget | ❌ |
| Automatización email | ❌ Manual |
| NPS Dashboard | Básico (score) |
| Branding | "Powered by TestimonioYa" |

### PRO - €19/mes
**Para:** Negocios que quieren crecer con social proof

| Feature | Límite |
|---------|--------|
| Encuestas NPS | ∞ |
| Testimonios | ∞ |
| Links | ∞ |
| Muro público | ✅ |
| Audio testimonios | ✅ |
| Video testimonios | ✅ |
| Widget embebible | ✅ |
| Automatización email | ✅ (Resend) |
| NPS Dashboard | Completo |
| Personalización | Total |
| Branding | Sin marca |

### PREMIUM - €49/mes
**Para:** Agencias, multi-negocio, enterprise

| Feature | Límite |
|---------|--------|
| Todo lo de Pro | ✅ |
| Negocios | Hasta 5 |
| Analytics avanzados | ✅ |
| API / Webhooks | ✅ |
| Integraciones | Zapier, Make, etc |
| White-label | ✅ |
| Soporte | Prioritario |
| Custom domain | ✅ |

---

## 🖥️ CAMBIOS EN LANDING PAGE

### Hero Principal
**Antes:**
> "Convierte clientes felices en tu mejor marketing"

**Ahora:**
> "Descubre quién te ama (y quién no) antes de que sea público"

O alternativa:
> "Testimonios de 5 estrellas. Garantizado."

### Propuesta de Valor (3 pasos)
**Antes:**
1. Creas tu enlace
2. Lo compartes
3. Recibes testimonios

**Ahora:**
1. **Conecta tu tienda** (o envía link post-compra)
2. **Pregunta NPS automático** ("¿Cuánto nos recomendarías?")
3. **Solo promotores** dan testimonio público

### Sección "El Problema"
**Añadir:**
- ✗ Pides testimonio a cliente insatisfecho → reseña negativa
- ✗ No sabes quién está contento antes de pedir
- ✗ Feedback negativo termina en Google en vez de en privado

### Sección "Con TestimonioYa"
**Nuevo flujo visual:**
```
[NPS 0-6] → 🔴 Feedback privado → Tu equipo lo ve primero
[NPS 7-8] → 🟡 Sugerencias → Mejora tu servicio
[NPS 9-10] → 🟢 "¡Deja testimonio!" → Wall of Love
```

### Nueva sección: "NPS + Testimonios = Combo Ganador"
- Gráfico mostrando: "Solo el 20% de clientes son promotores, pero generan el 80% de referidos"
- Cita: "Los promotores tienen 5x más probabilidad de dejar testimonio positivo"

---

## 🔄 FLUJO DE USUARIO ACTUALIZADO

### Onboarding
1. Registro → Crear negocio
2. **NUEVO:** Elegir modo de envío:
   - Manual (link para copiar/pegar)
   - Email automático (conectar email post-compra)
   - Integración (Stripe, WooCommerce, etc.) [Premium]

### Dashboard Principal
**Antes:** Solo testimonios
**Ahora:** 
- **NPS Score** prominente (gauge visual)
- Alertas de detractores pendientes
- Testimonios pendientes de aprobar
- Conversión: Encuestas → Promotores → Testimonios

### Nueva página: NPS Dashboard
- Score NPS actual (gauge -100 a +100)
- Evolución temporal
- Breakdown: % Promotores / Pasivos / Detractores
- Lista de detractores con feedback (para atender)
- Lista de promotores sin testimonio (para follow-up)

---

## 📧 AUTOMATIZACIÓN EMAIL

### Trigger de envío NPS
**Opciones por plan:**

| Trigger | Free | Pro | Premium |
|---------|------|-----|---------|
| Link manual | ✅ | ✅ | ✅ |
| Email post-compra (manual template) | ❌ | ✅ | ✅ |
| Webhook recibe compra | ❌ | ❌ | ✅ |
| Integración Stripe | ❌ | ❌ | ✅ |
| Zapier/Make | ❌ | ❌ | ✅ |

### Secuencia email automática (Pro+)
1. **Día X post-compra:** Email NPS ("¿Cuánto nos recomendarías?")
2. **Si no responde (día X+3):** Reminder suave
3. **Si promotor sin testimonio (día X+5):** "¿Nos dejas tu experiencia?"

---

## 🎨 WIDGET ACTUALIZADO

### Opciones de widget
1. **Wall of Love** (ya existe) - Todos los testimonios
2. **NPS Badge** (nuevo) - Muestra tu score NPS
3. **Testimonial Slider** (ya existe) - Carrusel
4. **Social Proof Bar** (nuevo) - "⭐ 4.8 | NPS +67 | 234 clientes felices"

---

## 📁 ARCHIVOS A MODIFICAR

### 1. Landing.tsx
- [ ] Nuevo hero con propuesta NPS-first
- [ ] Nueva sección de flujo visual
- [ ] Actualizar pricing table
- [ ] Añadir sección NPS + Testimonios

### 2. plans.ts
- [ ] Añadir límites de NPS
- [ ] Añadir feature flags para email automation
- [ ] Añadir feature flags para integraciones

### 3. Dashboard.tsx
- [ ] Añadir NPS Score widget
- [ ] Añadir alertas de detractores
- [ ] Restructurar métricas

### 4. Nuevo: NpsDashboard.tsx
- [ ] Crear página completa de analytics NPS

### 5. Settings.tsx
- [ ] Añadir configuración de email automation
- [ ] Añadir timing de envío NPS

### 6. VerticalLandings
- [ ] Actualizar con flujo NPS para cada vertical

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

### Fase 1 (Esta semana)
1. ✅ NpsForm.tsx - Ya hecho
2. [ ] Actualizar Landing.tsx con nuevo messaging
3. [ ] Actualizar plans.ts con nuevos límites
4. [ ] SQL migration para nps_responses

### Fase 2 (Próxima semana)
1. [ ] NPS Dashboard básico
2. [ ] Email automation con Resend
3. [ ] Actualizar Dashboard principal

### Fase 3 (Semana 3)
1. [ ] Integraciones webhook
2. [ ] Widget NPS Badge
3. [ ] Analytics avanzados

---

## 💡 DECISIONES PENDIENTES

1. **¿NPS es core o premium feature?**
   - Recomendación: CORE (todos tienen NPS básico, automation es premium)

2. **¿Timing default de envío NPS?**
   - Recomendación: 24h post-compra, reminder a las 72h

3. **¿Límite de NPS en free?**
   - Recomendación: 25/mes (suficiente para probar, incentiva upgrade)

4. **¿Email automation en Pro o Premium?**
   - Recomendación: Pro (es el driver de valor principal)

---

*Este documento guía la revisión completa del producto*
