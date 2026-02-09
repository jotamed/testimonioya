-- Migración: Renombrar plan 'premium' a 'business'
-- Fecha: 2026-02-09
-- Descripción: Actualiza el modelo de planes para reflejar el cambio de nombre
--              de "Premium" a "Business" en toda la base de datos

BEGIN;

-- 1. Actualizar constraint en tabla profiles
-- Nota: En Supabase/PostgreSQL, necesitamos eliminar el constraint viejo y crear uno nuevo

-- Primero, encontrar el nombre del constraint (puede variar)
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;

-- Crear nuevo constraint que acepta 'business' en vez de 'premium'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check 
  CHECK (plan IN ('free', 'pro', 'business'));

-- 2. Migrar datos existentes en tabla profiles
UPDATE profiles 
SET plan = 'business' 
WHERE plan = 'premium';

-- 3. Migrar datos en tabla businesses (legacy, por si acaso)
-- La columna plan en businesses está deprecated pero puede tener datos
UPDATE businesses 
SET plan = 'business' 
WHERE plan = 'premium';

-- Verificar resultados
-- SELECT plan, COUNT(*) FROM profiles GROUP BY plan;
-- SELECT plan, COUNT(*) FROM businesses WHERE plan IS NOT NULL GROUP BY plan;

COMMIT;

-- NOTA: NO EJECUTAR ESTE SQL MANUALMENTE
-- Esta migración debe ser revisada y ejecutada por el administrador de la base de datos
-- después de verificar que todo el código ha sido actualizado y desplegado.
