-- Rollback Migration: Remove GetYourGuide Product Tracking Fields
-- Created: 2025-10-01
-- Purpose: Safely rollback the GetYourGuide integration if needed
-- Companion to: 20251001000001_add_getyourguide_product_tracking.sql

-- IMPORTANT: Only run this if you need to completely remove GetYourGuide integration
-- This will NOT delete any tour data, only the GYG-specific tracking columns

-- Step 1: Revoke permissions on view
REVOKE SELECT ON gyg_product_sync_status FROM authenticated;
REVOKE SELECT ON gyg_product_sync_status FROM service_role;

-- Step 2: Drop view (depends on columns)
DROP VIEW IF EXISTS gyg_product_sync_status;

-- Step 3: Drop function (uses columns in logic)
DROP FUNCTION IF EXISTS get_gyg_product_id_for_tour(UUID);

-- Step 4: Drop constraint (references gyg_product_id column)
ALTER TABLE tours DROP CONSTRAINT IF EXISTS chk_gyg_product_id_only_templates;

-- Step 5: Drop indexes
DROP INDEX IF EXISTS idx_tours_gyg_sync_status;
DROP INDEX IF EXISTS idx_tours_gyg_product_id;

-- Step 6: Drop columns (order matters due to dependencies)
ALTER TABLE tours DROP COLUMN IF EXISTS gyg_last_sync;
ALTER TABLE tours DROP COLUMN IF EXISTS gyg_sync_status;
ALTER TABLE tours DROP COLUMN IF EXISTS gyg_option_id;
ALTER TABLE tours DROP COLUMN IF EXISTS gyg_product_id;

-- Verification query (should return 0 rows after rollback)
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'tours' AND column_name LIKE 'gyg_%';
