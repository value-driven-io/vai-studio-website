-- Migration: Add GetYourGuide Product Tracking Fields
-- Created: 2025-10-01
-- Purpose: Enable bidirectional product mapping between VAI Studio and GetYourGuide
-- Reference: operator-dashboard/documentation/Channel Manager/GetYourGuide/VAI_TO_GYG_PRODUCT_MAPPING.md

-- Add GetYourGuide-specific columns to tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gyg_product_id VARCHAR(100);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gyg_option_id INTEGER;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gyg_sync_status VARCHAR(50) DEFAULT 'not_synced';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS gyg_last_sync TIMESTAMP WITH TIME ZONE;

-- Create index for fast product ID lookups (used by n8n workflows)
CREATE INDEX IF NOT EXISTS idx_tours_gyg_product_id ON tours(gyg_product_id) WHERE gyg_product_id IS NOT NULL;

-- Create index for sync status monitoring
CREATE INDEX IF NOT EXISTS idx_tours_gyg_sync_status ON tours(gyg_sync_status) WHERE gyg_sync_status != 'not_synced';

-- Add helpful comments for developers
COMMENT ON COLUMN tours.gyg_product_id IS 'GetYourGuide external product ID (e.g., VAI_WHALE_WATCHING_MOOREA_001). Used for all GYG API calls.';
COMMENT ON COLUMN tours.gyg_option_id IS 'GetYourGuide internal option ID (assigned by GYG API after product creation). Used for product updates.';
COMMENT ON COLUMN tours.gyg_sync_status IS 'Sync status with GetYourGuide: not_synced, pending, synced, error, inactive';
COMMENT ON COLUMN tours.gyg_last_sync IS 'Timestamp of last successful sync with GetYourGuide API';

-- Add constraint to ensure only templates can have GYG product IDs
-- (scheduled instances inherit from their parent template)
ALTER TABLE tours ADD CONSTRAINT chk_gyg_product_id_only_templates
  CHECK (
    (is_template = true AND gyg_product_id IS NOT NULL) OR
    (is_template = false AND gyg_product_id IS NULL) OR
    (gyg_product_id IS NULL)
  );

-- Populate initial product IDs for existing active templates
-- Based on mapping defined in VAI_TO_GYG_PRODUCT_MAPPING.md
UPDATE tours
SET gyg_product_id = 'VAI_WHALE_WATCHING_MOOREA_001',
    gyg_sync_status = 'pending'
WHERE id = '795569b4-1921-4943-976f-4bb48fd75f28'
  AND is_template = true;

UPDATE tours
SET gyg_product_id = 'VAI_DIVING_TAHITI_001',
    gyg_sync_status = 'pending'
WHERE id = 'db896f3d-da54-4304-bdf4-9a8499c2a7de'
  AND is_template = true;

UPDATE tours
SET gyg_product_id = 'VAI_COOKING_TAHITI_001',
    gyg_sync_status = 'pending'
WHERE id = 'b8ce19ea-4361-4077-b5de-c63324e56e6a'
  AND is_template = true;

UPDATE tours
SET gyg_product_id = 'VAI_LAGOON_TOUR_MOOREA_001',
    gyg_sync_status = 'pending'
WHERE id = 'e8fd6a14-953f-4f92-b64c-632fa4df6a01'
  AND is_template = true;

-- Create helper function to get GYG product ID from template
-- This will be used by n8n workflows and database triggers
CREATE OR REPLACE FUNCTION get_gyg_product_id_for_tour(tour_id UUID)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  product_id VARCHAR(100);
  template_id UUID;
BEGIN
  -- Get the tour record
  SELECT
    CASE
      WHEN is_template THEN gyg_product_id
      ELSE (
        SELECT gyg_product_id
        FROM tours
        WHERE id = tours.parent_template_id
          AND is_template = true
      )
    END,
    parent_template_id
  INTO product_id, template_id
  FROM tours
  WHERE id = tour_id;

  RETURN product_id;
END;
$$;

COMMENT ON FUNCTION get_gyg_product_id_for_tour IS 'Returns the GYG product ID for a tour, looking up the parent template if needed. Used by availability sync triggers.';

-- Create validation view to check sync status
CREATE OR REPLACE VIEW gyg_product_sync_status AS
SELECT
  t.id,
  t.tour_name,
  t.tour_type,
  t.location,
  t.gyg_product_id,
  t.gyg_option_id,
  t.gyg_sync_status,
  t.gyg_last_sync,
  COUNT(CASE WHEN i.is_template = false AND i.status = 'active' AND i.tour_date >= CURRENT_DATE THEN 1 END) as active_instances
FROM tours t
LEFT JOIN tours i ON i.parent_template_id = t.id AND i.is_template = false
WHERE t.is_template = true
  AND t.status = 'active'
GROUP BY t.id, t.tour_name, t.tour_type, t.location, t.gyg_product_id, t.gyg_option_id, t.gyg_sync_status, t.gyg_last_sync
ORDER BY t.gyg_sync_status, t.tour_name;

COMMENT ON VIEW gyg_product_sync_status IS 'Monitor GetYourGuide product sync status for all active templates';

-- Grant permissions
GRANT SELECT ON gyg_product_sync_status TO authenticated;
GRANT SELECT ON gyg_product_sync_status TO service_role;
