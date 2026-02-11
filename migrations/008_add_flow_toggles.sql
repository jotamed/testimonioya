-- Add opt-in toggles for unified flow and recovery flow
-- Migration: 008_add_flow_toggles.sql
-- Date: 2026-02-11

-- Add columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS use_unified_flow BOOLEAN DEFAULT FALSE;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS use_recovery_flow BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN businesses.use_unified_flow IS 'Enables the unified NPS→Testimonial flow (Pro+ feature)';
COMMENT ON COLUMN businesses.use_recovery_flow IS 'Enables the recovery flow for detractors (Business plan feature)';
