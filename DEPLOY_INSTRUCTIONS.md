# Instrucciones de Deploy - Refactorización de Planes

## ⚠️ IMPORTANTE: Orden de ejecución

**NO ejecutar la migración SQL antes del deploy del código**

## Pasos para el deploy

### 1. Verificar compilación TypeScript

```bash
npx tsc --noEmit
```

Debe dar 0 errores.

### 2. Revisar cambios

```bash
git diff HEAD~2
git log --oneline -2
```

### 3. Push a staging

```bash
git push origin staging
```

### 4. Deploy a entorno staging

Usa el método habitual de deploy (Vercel, Netlify, etc.)

### 5. Verificar en staging

- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] Settings muestra solo los tabs: General, Notificaciones, NPS, Marca, Seguridad, Plan
- [ ] Landing page muestra plan "Business" en vez de "Premium"
- [ ] No aparecen referencias a "Premium" en ninguna parte de la UI

### 6. DESPUÉS del deploy exitoso: Ejecutar migración SQL

**Solo después de verificar que todo funciona en staging:**

```sql
-- Conectar a la base de datos de Supabase
-- Ejecutar el contenido de: migrations/rename-premium-to-business.sql
```

### 7. Verificar migración

```sql
-- Verificar que no quedan usuarios con plan 'premium'
SELECT plan, COUNT(*) FROM profiles GROUP BY plan;

-- Debe mostrar solo: free, pro, business
```

### 8. Actualizar variables de entorno

Si usas Stripe, actualizar:

```env
# Cambiar
VITE_STRIPE_PREMIUM_PRICE_ID=price_xxx
# Por
VITE_STRIPE_BUSINESS_PRICE_ID=price_xxx
```

### 9. Deploy a producción

Una vez verificado todo en staging, hacer merge y deploy a producción:

```bash
git checkout main
git merge staging
git push origin main
```

Luego ejecutar la misma migración SQL en la base de datos de producción.

## Rollback (si hay problemas)

Si hay que hacer rollback:

1. Revertir el código:
   ```bash
   git revert HEAD~2..HEAD
   git push origin staging
   ```

2. Revertir la base de datos:
   ```sql
   UPDATE profiles SET plan = 'premium' WHERE plan = 'business';
   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
   ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
     CHECK (plan IN ('free', 'pro', 'premium'));
   ```

## Checklist final

Antes de marcar como completado:

- [ ] Código compila sin errores (tsc --noEmit)
- [ ] UI funciona correctamente en staging
- [ ] No hay referencias a "premium" en el código
- [ ] Tabs eliminados ya no aparecen
- [ ] Plan "Business" aparece correctamente en pricing
- [ ] Migración SQL ejecutada exitosamente
- [ ] Usuarios migrados de 'premium' a 'business'
- [ ] Variables de entorno actualizadas

## Archivos modificados

- `src/lib/plans.ts` - Límites y configuración de planes
- `src/lib/stripe.ts` - Precios e información para Stripe
- `src/lib/supabase.ts` - Tipo PlanType actualizado
- `src/pages/Settings.tsx` - Tabs eliminados y simplificados
- `src/pages/Admin.tsx` - Badges actualizados
- `src/pages/Analytics.tsx` - Mensajes de upgrade
- `src/components/DashboardLayout.tsx` - Navegación
- `src/pages/Landing.tsx` - Pricing section
- `migrations/rename-premium-to-business.sql` - Migración DB

## Contacto

Si hay dudas o problemas durante el deploy, contactar al equipo de desarrollo.
