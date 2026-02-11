# Flujo Unificado NPS → Testimonio + Recovery Flow

**Fecha:** 2026-02-11  
**Estado:** Diseño para revisión  
**Autor:** Onofre 🔥

---

## Resumen

Fusionar los flujos de NPS y testimonios en **un solo flujo público**, y añadir un **Recovery Flow** para detractores como feature premium.

### Pricing

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Solicitar testimonio (texto) | ✅ básico actual | ✅ | ✅ |
| Flujo unificado NPS→Testimonio | ❌ | ✅ | ✅ |
| Recovery Flow (detractores) | ❌ | ❌ | ✅ |

---

## 1. Flujo Unificado (Pro+)

### Experiencia del cliente

**URL única:** `/r/{slug}` (nueva ruta, "r" de review/rate)

```
Paso 1: NPS Score (0-10)
    ↓
Paso 2 (si 9-10 promotor):
    → Nombre + email + texto testimonio
    → "Enviar testimonio"
    → Pantalla gracias + botón Google Reviews
    
Paso 2 (si 7-8 pasivo):
    → "Gracias por tu feedback" + campo opcional de comentario
    → Solo se guarda NPS, no se pide testimonio público
    
Paso 2 (si 0-6 detractor):
    → "¿Qué podemos mejorar?" (campo obligatorio)
    → Se guarda como NPS + se crea recovery_case (Business plan)
    → "Gracias, tu feedback nos ayuda a mejorar"
```

### Diferencia con flujo actual

- **Ahora:** NPS (`/nps/:slug`) y Testimonio (`/t/:slug`) son rutas separadas, el dueño elige cuál enviar
- **Nuevo:** Una sola URL (`/r/:slug`), el flujo se adapta automáticamente según la puntuación

### Cambios en el modelo de datos

**NO se tocan** las tablas existentes (`testimonials`, `nps_responses`). El flujo unificado simplemente inserta en ambas según corresponda.

**Nueva tabla: `recovery_cases`** (solo Business plan)

```sql
CREATE TABLE recovery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nps_response_id UUID NOT NULL REFERENCES nps_responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  customer_name TEXT,
  customer_email TEXT,
  -- Conversación: array de mensajes (simple, sin tabla extra)
  messages JSONB NOT NULL DEFAULT '[]',
  -- messages format: [{ role: 'customer'|'business', text: string, created_at: ISO }]
  resolved_score INTEGER, -- si el cliente actualiza su puntuación
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recovery_cases_business ON recovery_cases(business_id);
CREATE INDEX idx_recovery_cases_status ON recovery_cases(business_id, status);

ALTER TABLE recovery_cases ENABLE ROW LEVEL SECURITY;

-- Solo el dueño del negocio puede ver/editar sus casos
CREATE POLICY "Business owners manage recovery cases"
  ON recovery_cases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = recovery_cases.business_id 
    AND businesses.user_id = auth.uid()
  ));
```

**Nueva tabla: `unified_links`** (enlace unificado NPS→Testimonio)

```sql
CREATE TABLE unified_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Enlace principal',
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  -- Config
  nps_threshold_promoter INTEGER DEFAULT 9, -- 9-10 = promotor
  nps_threshold_passive INTEGER DEFAULT 7,  -- 7-8 = pasivo
  ask_google_review BOOLEAN DEFAULT TRUE,
  google_reviews_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unified_links_business ON unified_links(business_id);
CREATE INDEX idx_unified_links_slug ON unified_links(slug);

ALTER TABLE unified_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage unified links"
  ON unified_links FOR ALL
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = unified_links.business_id 
    AND businesses.user_id = auth.uid()
  ));

-- Público: leer links activos (para el formulario público)
CREATE POLICY "Anyone can view active unified links"
  ON unified_links FOR SELECT
  USING (is_active = TRUE);
```

### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `src/pages/UnifiedForm.tsx` | Formulario público `/r/:slug` |
| `src/pages/RecoveryCases.tsx` | Dashboard de casos (Business) |
| `src/components/RecoveryCaseCard.tsx` | Tarjeta de caso en dashboard |
| `supabase/functions/recovery-reply/index.ts` | Edge function: envía respuesta por email |
| `supabase/functions/recovery-webhook/index.ts` | Webhook: recibe respuesta del cliente |
| `migrations/007_unified_flow.sql` | SQL para nuevas tablas |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Añadir ruta `/r/:slug` → `UnifiedForm` |
| `src/App.tsx` | Añadir ruta `/dashboard/recovery` → `RecoveryCases` |
| `src/components/DashboardLayout.tsx` | Nuevo item sidebar "Casos" (solo Business) |
| `src/pages/RequestTestimonial.tsx` | Añadir pestaña "Enlace unificado" para Pro+ |
| `src/lib/plans.ts` | Añadir `hasUnifiedFlow`, `hasRecoveryFlow` |
| `src/lib/supabase.ts` | Añadir tipos `RecoveryCase`, `UnifiedLink` |

### NO se modifica

- `src/pages/NpsForm.tsx` — sigue funcionando como está (Free plan)
- `src/pages/TestimonialForm.tsx` — sigue funcionando como está (Free plan)
- `src/pages/NpsDashboard.tsx` — sigue mostrando datos de `nps_responses` (alimentado por ambos flujos)
- `public/widget.js` — sigue leyendo de `testimonials`
- Todas las edge functions existentes

---

## 2. Recovery Flow (Business plan)

### Flujo completo

```
1. Cliente da NPS 0-6 → se crea recovery_case con status 'open'
   → Mensaje inicial = feedback del cliente
   → Email al dueño: "Tienes un cliente insatisfecho"

2. Dueño ve caso en /dashboard/recovery
   → Escribe respuesta desde el dashboard
   → Se envía email al cliente con la respuesta
   → Status → 'in_progress'

3. Cliente recibe email con respuesta
   → Puede responder via link (NO reply-to, es un formulario web)
   → URL: /recovery/:caseId?token=xxx (token firmado, no auth)
   → Su respuesta se añade a messages[]
   → Email al dueño: "Respuesta del cliente"

4. Máximo 5 intercambios (configurable)
   → Tras 5, se cierra automáticamente

5. En cualquier momento, el dueño puede:
   → Marcar como "resuelto" → status 'resolved'
   → Cerrar sin resolver → status 'closed'

6. Si se resuelve, opcionalmente invitar al cliente a re-puntuar
   → Se guarda resolved_score en el caso
```

### Conversación como JSONB (no tabla extra)

Deliberadamente NO creo una tabla `recovery_messages`. Razones:
- Máximo 5 intercambios → JSONB es suficiente
- Menos JOINs, menos complejidad
- Menos RLS policies que mantener
- El caso completo se carga en una sola query

```typescript
type RecoveryMessage = {
  role: 'customer' | 'business'
  text: string
  created_at: string // ISO
}

type RecoveryCase = {
  id: string
  business_id: string
  nps_response_id: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  customer_name: string | null
  customer_email: string | null
  messages: RecoveryMessage[]
  resolved_score: number | null
  created_at: string
  updated_at: string
}
```

### Edge functions nuevas

**`recovery-reply`** — El dueño responde a un caso
- Input: `{ case_id, message }`
- Auth: requiere JWT del dueño
- Acción: añade mensaje a JSONB, envía email al cliente, actualiza status

**`recovery-webhook`** — El cliente responde (público, con token)
- Input: `{ case_id, token, message }`
- Auth: token firmado (HMAC del case_id + customer_email)
- Acción: añade mensaje, envía email al dueño
- Validación: max 5 mensajes, caso no cerrado

### Emails del Recovery Flow

**Al dueño (nuevo caso):**
```
Subject: ⚠️ Cliente insatisfecho — NPS 3/10
Body: [Nombre] ha puntuado 3/10. Feedback: "..." → [Responder desde dashboard]
```

**Al cliente (respuesta del dueño):**
```
Subject: Respuesta de [Negocio] a tu feedback
Body: "..." → [Responder] (link al formulario web)
```

**Al dueño (respuesta del cliente):**
```
Subject: 💬 Respuesta de [Cliente] en caso #123
Body: "..." → [Ver caso] (link al dashboard)
```

---

## 3. Plan de implementación

### Fase 1: Base de datos + tipos (30 min)
1. Crear migración SQL (`007_unified_flow.sql`)
2. Ejecutar en Supabase
3. Actualizar tipos en `supabase.ts`
4. Actualizar `plans.ts` con nuevos features

### Fase 2: Formulario unificado `/r/:slug` (2h)
1. Crear `UnifiedForm.tsx` — el componente más importante
2. Registrar ruta en `App.tsx`
3. Testear flujo completo: NPS → Testimonio/Feedback

### Fase 3: Integrar en dashboard (1h)
1. Añadir "Enlace unificado" en `RequestTestimonial.tsx`
2. Crear unified_link automáticamente en onboarding (para Pro+)
3. Mostrar en sidebar solo para Pro+

### Fase 4: Recovery Flow (2h)
1. Crear `RecoveryCases.tsx` — dashboard de casos
2. Crear edge function `recovery-reply`
3. Crear formulario público de respuesta del cliente
4. Crear edge function `recovery-webhook`
5. Emails de notificación

### Fase 5: Testing completo (1h)
1. Free plan: solo ve flujos separados (sin regresión)
2. Pro: flujo unificado funciona, no ve recovery
3. Business: todo funciona, recovery completo
4. Verificar build (`npm run build`)
5. Deploy

**Total estimado: ~6h de desarrollo**

---

## 4. Decisiones de diseño

### ¿Por qué `/r/:slug` y no reutilizar `/t/:slug`?
- No romper enlaces existentes que ya circulan
- Separación limpia: `/t/` = testimonio directo (Free), `/r/` = flujo inteligente (Pro+)
- Permite que Free siga funcionando exactamente igual

### ¿Por qué JSONB para mensajes y no tabla separada?
- Max 5 mensajes → no necesita paginación ni queries complejas
- Un caso = un documento completo
- Menos surface area para bugs de RLS

### ¿Por qué formulario web para respuestas y no reply-to email?
- Reply-to requiere webhook de Resend (más complejo, más caro)
- Formulario web nos da control total sobre validación y UX
- Podemos añadir re-puntuación NPS en el mismo formulario
- El link es seguro con token HMAC (no requiere cuenta)

### ¿Por qué no modificar NpsForm.tsx existente?
- Free plan sigue usando el flujo actual sin cambios
- Cero riesgo de regresión
- El flujo unificado es un componente nuevo e independiente

---

## 5. Checklist anti-bugs (lecciones de hoy)

Basado en los 15+ bugs corregidos hoy, cada archivo nuevo debe cumplir:

- [ ] **JWT**: No hacer llamadas auth-dependientes sin refresh previo
- [ ] **Plan lookup**: Siempre desde `profiles`, nunca desde `businesses.plan`
- [ ] **collection_link vs business slug**: Usar la entidad correcta para cada ruta
- [ ] **Race conditions**: No usar setState y leer el estado en la misma función — usar variable local
- [ ] **Edge functions**: Usar ANON_KEY (no JWT del user) para llamadas públicas
- [ ] **form_url validación**: Nunca enviar email con URL vacía
- [ ] **Error translation**: Todos los errores user-facing en español via `translateError()`
- [ ] **No console.log con datos sensibles**: Ni emails, ni tokens, ni IDs de usuario
- [ ] **RLS policies**: Testar SELECT, INSERT, UPDATE, DELETE por separado
- [ ] **Multi-business**: Nunca `.single()` cuando el user puede tener varios negocios
- [ ] **Responsive**: Testar en móvil (los clientes abren el link desde WhatsApp = móvil)
- [ ] **Build verification**: `npm run build` sin errores antes de commit

---

## 6. Mockup del flujo

```
┌─────────────────────────────────────┐
│  ¿Qué probabilidad hay de que       │
│  recomiendes [Negocio]?             │
│                                      │
│  [0][1][2][3][4][5][6][7][8][9][10] │
│  Nada probable ←→ Muy probable       │
└─────────────────────────────────────┘
         ↓ (click en 9)
┌─────────────────────────────────────┐
│  🎉 ¡Genial! ¿Nos cuentas más?     │
│                                      │
│  Nombre: [___________]               │
│  Email:  [___________] (opcional)    │
│                                      │
│  ⭐⭐⭐⭐⭐ (rating)                │
│                                      │
│  Tu experiencia:                     │
│  [                         ]         │
│  [                         ]         │
│                                      │
│  [  Enviar testimonio  ]             │
└─────────────────────────────────────┘
         ↓ (submit)
┌─────────────────────────────────────┐
│  ✅ ¡Muchas gracias!                │
│                                      │
│  ¿También nos dejas una reseña      │
│  en Google? 🙏                       │
│                                      │
│  [ ⭐ Dejar reseña en Google → ]    │
└─────────────────────────────────────┘

--- Si detractor (score 0-6) ---

┌─────────────────────────────────────┐
│  💪 Queremos mejorar                │
│                                      │
│  ¿Qué podríamos hacer mejor?        │
│  [                         ]         │
│  [                         ]         │
│                                      │
│  Email (para que podamos             │
│  contactarte): [___________]         │
│                                      │
│  [  Enviar feedback  ]               │
└─────────────────────────────────────┘
```

---

*Esperando OK de Jorge para empezar a implementar.*
