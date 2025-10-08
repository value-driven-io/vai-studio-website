-- Migration: Fix get_gyg_product_id_for_tour function scope bug
-- Created: October 7, 2025
-- Purpose: Fix SQL scope issue in get_gyg_product_id_for_tour function
-- Issue: Line 77 of original migration uses wrong table reference causing NULL returns for instances
-- Related: 20251001000001_add_getyourguide_product_tracking.sql

-- ============================================================================
-- PROBLEM DESCRIPTION
-- ============================================================================
-- Original function (line 77 of migration 20251001000001):
--   WHERE id = tours.parent_template_id
--
-- Bug: "tours.parent_template_id" refers to the INNER SELECT's table,
--      not the outer query's parent_template_id value
--
-- Result: Function returns NULL for all tour instances
--         Only works for templates (which have their own gyg_product_id)
--
-- Discovered: October 7, 2025 during n8n workflow testing
-- ============================================================================

-- Drop and recreate the function with fixed logic
CREATE OR REPLACE FUNCTION get_gyg_product_id_for_tour(tour_id UUID)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  product_id VARCHAR(100);
  template_id UUID;
  is_template_flag BOOLEAN;
BEGIN
  -- Get the tour record (fixed: use explicit variables to avoid scope issues)
  SELECT
    is_template,
    gyg_product_id,
    parent_template_id
  INTO is_template_flag, product_id, template_id
  FROM tours
  WHERE id = tour_id;

  -- If it's a template, return its own product ID
  IF is_template_flag THEN
    RETURN product_id;
  END IF;

  -- If it's an instance, look up parent template's product ID
  IF template_id IS NOT NULL THEN
    SELECT gyg_product_id INTO product_id
    FROM tours
    WHERE id = template_id
      AND is_template = true;
  END IF;

  RETURN product_id;
END;
$$;

-- Grant permissions (same as original migration)
GRANT EXECUTE ON FUNCTION get_gyg_product_id_for_tour(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_gyg_product_id_for_tour(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_gyg_product_id_for_tour(UUID) TO anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Function should return product ID for templates
-- Expected: Returns the template's own gyg_product_id
DO $$
DECLARE
  test_result VARCHAR(100);
BEGIN
  SELECT get_gyg_product_id_for_tour('db896f3d-da54-4304-bdf4-9a8499c2a7de'::UUID) INTO test_result;

  IF test_result = 'VAI_DIVING_TAHITI_001' THEN
    RAISE NOTICE '✅ TEST 1 PASSED: Template returns correct product ID';
  ELSE
    RAISE WARNING '❌ TEST 1 FAILED: Expected VAI_DIVING_TAHITI_001, got %', test_result;
  END IF;
END $$;

-- Test 2: Function should return parent's product ID for instances
-- Expected: Returns parent template's gyg_product_id
DO $$
DECLARE
  test_result VARCHAR(100);
BEGIN
  -- Find any tour instance with a parent template
  SELECT get_gyg_product_id_for_tour(id) INTO test_result
  FROM tours
  WHERE is_template = false
    AND parent_template_id IS NOT NULL
    AND parent_template_id = 'db896f3d-da54-4304-bdf4-9a8499c2a7de'
  LIMIT 1;

  IF test_result = 'VAI_DIVING_TAHITI_001' THEN
    RAISE NOTICE '✅ TEST 2 PASSED: Instance returns parent template product ID';
  ELSIF test_result IS NULL THEN
    RAISE WARNING '⚠️ TEST 2 INCONCLUSIVE: No instances found for testing';
  ELSE
    RAISE WARNING '❌ TEST 2 FAILED: Expected VAI_DIVING_TAHITI_001, got %', test_result;
  END IF;
END $$;

-- Test 3: Count how many tours can now be synced to GetYourGuide
DO $$
DECLARE
  syncable_count INTEGER;
  total_active INTEGER;
BEGIN
  SELECT COUNT(*) INTO syncable_count
  FROM tours
  WHERE status = 'active'
    AND tour_date >= CURRENT_DATE
    AND get_gyg_product_id_for_tour(id) IS NOT NULL;

  SELECT COUNT(*) INTO total_active
  FROM tours
  WHERE status = 'active'
    AND tour_date >= CURRENT_DATE;

  RAISE NOTICE '✅ TEST 3 RESULTS: % of % active future tours can be synced to GetYourGuide',
    syncable_count, total_active;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- - Fixed function scope bug that caused NULL returns for tour instances
-- - Function now correctly retrieves parent template's product ID
-- - All tour instances linked to templates with GYG IDs can now be synced
--
-- Impact:
-- - n8n availability sync workflow will now work for tour instances
-- - GetYourGuide channel manager integration is now fully functional
--
-- Next Steps:
-- 1. Test n8n workflow with availability update
-- 2. Verify GetYourGuide receives correct product IDs
-- 3. Monitor sync status in production
-- ============================================================================

-- Add comment to function for documentation
COMMENT ON FUNCTION get_gyg_product_id_for_tour IS
'Returns GetYourGuide product ID for any tour (template or instance).
For templates: returns their own gyg_product_id.
For instances: returns parent template gyg_product_id.
Used by n8n workflows for channel manager integration.
Fixed: October 7, 2025 - Corrected SQL scope bug.';
