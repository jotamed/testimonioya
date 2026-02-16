-- Migration: Add custom messaging fields to collection_links
-- Date: 2026-02-16
-- Purpose: Support custom WhatsApp and Email messages per solicitud

ALTER TABLE collection_links 
  ADD COLUMN IF NOT EXISTS whatsapp_message text,
  ADD COLUMN IF NOT EXISTS email_subject text,
  ADD COLUMN IF NOT EXISTS email_message text;

-- Add comment for documentation
COMMENT ON COLUMN collection_links.whatsapp_message IS 'Custom WhatsApp message template with {nombre_negocio} and {enlace} variables';
COMMENT ON COLUMN collection_links.email_subject IS 'Custom email subject line';
COMMENT ON COLUMN collection_links.email_message IS 'Custom email body message';
