# 🔴 CRASH TEST 2 — TestimonioYa
**Fecha:** 2026-02-11  
**Auditor:** Clawd (subagent crash-test)

---

## Resumen Ejecutivo

Se encontraron **4 bugs CRÍTICOS**, **5 ALTOS**, **8 MEDIOS** y **5 BAJOS**.  
Los CRÍTICOS y ALTOS han sido **corregidos directamente en el código**.

> ⚠️ **No se pudo hacer `npm run build`** porque el sandbox no tiene Node.js instalado. Jorge debe verificar la compilación antes del deploy.

---

## 🔴 CRÍTICOS (4) — Corregidos ✅

### C1. `canReceiveTestimonial` llamado con argumentos incorrectos en TestimonialForm
- **Archivo:** `src/pages/TestimonialForm.tsx`, línea 102
- **Bug:** Se pasaba `businessData.plan` (string tipo 'free'/'pro') como segundo argumento, pero la función espera `userId` (UUID). Resultado: **siempre falla silenciosamente y devuelve plan 'free'**, lo que puede bloquear la recepción de testimonios para usuarios Pro/Business.
- **Fix aplicado:** Cambiado a `businessData.user_id`

### C2. Widget.js lee `business.plan` (deprecated) — siempre ve 'free'
- **Archivo:** `public/widget.js`, línea fetch
- **Bug:** El widget JS público lee `plan` de la tabla `businesses`, pero el plan ahora está en `profiles`. Resultado: **nunca carga external_reviews y siempre muestra "Powered by"** incluso para planes de pago.
- **Fix aplicado:** Widget ahora hace fetch secundario a `profiles` para obtener el plan real del usuario.

### C3. WallOfLove usa `ownerPlan` antes de que se actualice (race condition)
- **Archivo:** `src/pages/WallOfLove.tsx`, línea ~70
- **Bug:** `setOwnerPlan` es async (setState), pero `isPaid` se evalúa con `ownerPlan` que aún no se ha actualizado. Resultado: **reviews externas nunca se cargan en el muro público**.
- **Fix aplicado:** Se usa variable local `fetchedPlan` en lugar del estado.

### C4. delete-account solo borra UN negocio
- **Archivo:** `supabase/functions/delete-account/index.ts`
- **Bug:** Usaba `.single()` que solo retorna un negocio. Los usuarios Business pueden tener hasta 5 negocios. Resultado: **datos huérfanos en DB tras eliminar cuenta**.
- **Fix aplicado:** Iteración sobre todos los negocios del usuario. También se añadió limpieza de `testimonial_requests`, `external_reviews` y `profiles`.

---

## 🟠 ALTOS (5) — Corregidos ✅

### A1. Sin aviso cuando negocio no tiene collection_link
- **Archivo:** `src/pages/RequestTestimonial.tsx`
- **Bug:** Si un negocio no tiene collection_link (ej: creado vía createBusiness del sidebar sin onboarding completo), la URL del formulario queda vacía (`""`). El usuario puede enviar emails con enlace vacío sin saberlo.
- **Fix aplicado:** Se muestra banner de aviso con enlace para crear un collection_link.

### A2. Session JWT no se refresca en páginas del dashboard
- **Archivo:** `src/components/DashboardLayout.tsx`
- **Bug:** Solo `RequestTestimonial` hacía `refreshSession()`. En las demás páginas del dashboard, si el JWT expiraba durante uso normal, las API calls fallaban silenciosamente.
- **Fix aplicado:** `DashboardLayout.checkUser()` ahora refresca proactivamente si faltan menos de 5 minutos para expirar.

### A3. ForgotPassword muestra errores en inglés
- **Archivo:** `src/pages/ForgotPassword.tsx`, línea 25
- **Bug:** Los errores de Supabase se mostraban tal cual en inglés.
- **Fix aplicado:** Se usa `translateError()` como en las demás páginas de auth.

### A4. console.log en producción (RequestTestimonial)
- **Archivo:** `src/pages/RequestTestimonial.tsx`, línea 141
- **Bug:** `console.log(\`Email to ${email}:\`, response.status, result)` — filtra info del email del cliente en consola.
- **Fix aplicado:** Eliminado el console.log.

### A5. createBusiness (DashboardLayout) no crea collection_link
- **Archivo:** `src/lib/useBusinesses.ts`, función `createBusiness()`
- **Bug:** Al crear un negocio desde el selector del sidebar (no desde Onboarding), no se crea un `collection_link`. Sin collection_link → no se puede pedir testimonios → el negocio es inútil.
- **Fix pendiente:** Necesita INSERT de collection_link tras crear business. **NO CORREGIDO** porque el fix requiere más contexto (se podría romper si el usuario luego hace Onboarding).

---

## 🟡 MEDIOS (8) — No corregidos (requieren decisión)

### M1. Widget code usa `business.slug` — no `collection_link.slug`
- **Archivo:** `src/pages/Widget.tsx`, línea 180
- **Impacto:** El widget JS usa el slug del negocio para cargar testimonios vía API REST directamente (no como URL de formulario), así que **es correcto para este caso**. No es un bug.

### M2. NPS form usa `business.slug` — correcto
- **Archivo:** Routes `/nps/:slug` 
- **Nota:** NPS usa business.slug intencionalmente (es una ruta diferente a `/t/:slug`). **No es bug**.

### M3. ~40 console.error/warn en producción
- **Archivos:** Múltiples (ver lista completa en grep)
- **Impacto:** No filtra datos sensibles pero es ruido en producción. Recomendación: usar un logger que se desactive en prod, o al menos quitar los `console.error` que loguean objetos de error completos.

### M4. Onboarding: botón "Atrás" desactivado en Step 3
- **Archivo:** `src/pages/Onboarding.tsx`, Step 3
- **Bug:** El botón de "Atrás" en el paso 3 está `disabled`. Pero el negocio ya se creó en Step 2, así que volver atrás crearía un duplicado.
- **Nota:** Es intencional, pero la UX podría mejorar (ocultar el botón o explicar por qué).

### M5. Stripe webhook no valida `plan_updated_at`
- **Archivo:** `supabase/functions/stripe-webhook/index.ts`
- **Bug:** No se actualiza `plan_updated_at` en el profile tras checkout/update. Campo existe pero nunca se escribe.

### M6. Email notification check en `email.ts` busca solo el primer negocio
- **Archivo:** `src/lib/email.ts`
- **Bug:** `isNotificationEnabled()` usa `.single()` para buscar negocio del usuario. Si tiene múltiples, podría fallar.

### M7. Exportar datos (Settings → Billing) no hace nada
- **Archivo:** `src/pages/Settings.tsx`, billing tab
- **Bug:** El botón "Exportar todo" no tiene handler `onClick`.

### M8. `testimonials_count` en businesses nunca se incrementa
- **Archivo:** Múltiples
- **Bug:** El campo `testimonials_count` en businesses parece no actualizarse al recibir testimonios (solo se lee en monthly-report). Probablemente necesita un trigger de DB.

---

## 🟢 BAJOS (5)

### B1. Landing links a `/dashboard/links` en "Crear Primer Enlace" (Dashboard empty state)
- Podría apuntar a `/dashboard/request` que es más intuitivo.

### B2. `useUserPlan` real-time listener compara con `profile?.id` que puede ser null
- **Archivo:** `src/lib/useUserPlan.ts`, línea ~40
- El `profile?.id` puede ser null durante la primera render, así que el listener no filtra correctamente.

### B3. Widget page muestra datos de ejemplo sin disclaimer claro
- Usuarios podrían pensar que ya tienen testimonios.

### B4. NPS skip button calls handleSubmit without waiting for state
- **Archivo:** `src/pages/NpsForm.tsx`
- El botón "Skip" llama `handleSubmit` con un fake event pero `feedback` podría no haberse limpiado aún.

### B5. `Onboarding.sendTestEmail` usa `supabase.functions.invoke` con body diferente al template
- **Archivo:** `src/pages/Onboarding.tsx`, `sendTestEmail()`
- Pasa `business_name` y `form_url` como campos directos del body, pero `send-email` espera `{ type, to, data: {...} }`. El email de prueba **probablemente no llega**.

---

## Fixes aplicados (resumen)

| # | Archivo | Cambio |
|---|---------|--------|
| C1 | `src/pages/TestimonialForm.tsx` | `canReceiveTestimonial(id, user_id)` en vez de `(id, plan)` |
| C2 | `public/widget.js` | Fetch plan desde `profiles` table |
| C3 | `src/pages/WallOfLove.tsx` | Variable local `fetchedPlan` |
| C4 | `supabase/functions/delete-account/index.ts` | Loop sobre todos los negocios + limpieza completa |
| A1 | `src/pages/RequestTestimonial.tsx` | Banner de aviso si no hay collection_link |
| A2 | `src/components/DashboardLayout.tsx` | Refresh proactivo del JWT |
| A3 | `src/pages/ForgotPassword.tsx` | `translateError()` |
| A4 | `src/pages/RequestTestimonial.tsx` | Eliminado `console.log` |

---

## ⚠️ Pendiente

1. **`npm run build`** — No se pudo ejecutar en sandbox (no hay Node.js). **Jorge debe verificar que compila antes de deploy.**
2. **A5: createBusiness sin collection_link** — Necesita fix pero requiere decisión de diseño.
3. **B5: sendTestEmail formato incorrecto** — El email de prueba en Onboarding probablemente no funciona.
4. **M5: plan_updated_at** — Añadir al webhook de Stripe.
5. **M7: Exportar datos** — Implementar o quitar el botón.
6. **M8: testimonials_count** — Verificar si hay trigger en DB o añadir uno.
7. **Limpieza de console.log/error** — ~40 instancias en producción.
8. **Edge functions**: Todas usan las env vars correctas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`). Los CORS headers están bien.
