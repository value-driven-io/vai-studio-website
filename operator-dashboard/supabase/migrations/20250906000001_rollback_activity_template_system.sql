-- ROLLBACK Migration: Activity Template System (Phase 1)
-- Description: Complete rollback of activity template system migration
-- WARNING: This will destroy all activity templates and tour instances data
-- Created: 2025-09-06
-- Rollback for Migration ID: 20250906000001

-- ==============================================================================
-- SAFETY CHECKS
-- ==============================================================================

-- Check if any bookings reference tour instances
DO $$
DECLARE
    instance_bookings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO instance_bookings_count
    FROM public.bookings 
    WHERE instance_id IS NOT NULL;
    
    IF instance_bookings_count > 0 THEN
        RAISE EXCEPTION 'Cannot rollback: % bookings reference tour instances. Data migration required first.', instance_bookings_count;
    END IF;
    
    RAISE NOTICE 'Safety check passed: No bookings reference tour instances';
END $$;

-- ==============================================================================
-- ROLLBACK PHASE 8: REMOVE GRANTS AND PERMISSIONS
-- ==============================================================================

-- Revoke permissions for functions
REVOKE EXECUTE ON FUNCTION public.generate_activity_instances_from_schedule(UUID) FROM authenticated;

-- Revoke permissions for views
REVOKE SELECT ON public.active_activity_templates_with_operators FROM authenticated, anon;
REVOKE SELECT ON public.active_activity_instances_with_details FROM authenticated, anon;

-- Revoke permissions for tables
REVOKE ALL ON public.activity_instances FROM authenticated;
REVOKE SELECT ON public.activity_instances FROM anon;
REVOKE ALL ON public.activity_templates FROM authenticated;
REVOKE SELECT ON public.activity_templates FROM anon;

-- ==============================================================================
-- ROLLBACK PHASE 7: REMOVE ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Drop RLS policies for activity_instances
DROP POLICY IF EXISTS activity_instances_public_read ON public.activity_instances;
DROP POLICY IF EXISTS activity_instances_operator_policy ON public.activity_instances;

-- Drop RLS policies for activity_templates
DROP POLICY IF EXISTS activity_templates_public_read ON public.activity_templates;
DROP POLICY IF EXISTS activity_templates_operator_policy ON public.activity_templates;

-- Disable RLS on tables
ALTER TABLE public.activity_instances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- ROLLBACK PHASE 6: REMOVE TRIGGERS
-- ==============================================================================

-- Drop tour instance triggers
DROP TRIGGER IF EXISTS update_tour_instance_spots_trigger ON public.activity_instances;

-- Drop updated_at triggers
DROP TRIGGER IF EXISTS update_activity_instances_updated_at ON public.activity_instances;
DROP TRIGGER IF EXISTS update_activity_templates_updated_at ON public.activity_templates;

-- Drop trigger functions (only if not used elsewhere)
-- Note: update_updated_at_column might be used by other tables, so we keep it
DROP FUNCTION IF EXISTS public.update_tour_instance_spots();

-- ==============================================================================
-- ROLLBACK PHASE 5: REMOVE HELPER FUNCTIONS
-- ==============================================================================

-- Drop instance generation function
DROP FUNCTION IF EXISTS public.generate_activity_instances_from_schedule(UUID);

-- ==============================================================================
-- ROLLBACK PHASE 4: REMOVE ENHANCED VIEWS
-- ==============================================================================

-- Drop views
DROP VIEW IF EXISTS public.active_activity_instances_with_details;
DROP VIEW IF EXISTS public.active_activity_templates_with_operators;

-- ==============================================================================
-- ROLLBACK PHASE 3: REVERT SCHEDULES TABLE CHANGES
-- ==============================================================================

-- Remove template_id from schedules table
DROP INDEX IF EXISTS idx_schedules_template_id;
ALTER TABLE public.schedules DROP COLUMN IF EXISTS template_id;

-- ==============================================================================
-- ROLLBACK PHASE 2: REMOVE TOUR INSTANCES TABLE
-- ==============================================================================

-- Drop tour instances indexes
DROP INDEX IF EXISTS idx_activity_instances_active_available;
DROP INDEX IF EXISTS idx_activity_instances_available;
DROP INDEX IF EXISTS idx_activity_instances_status;
DROP INDEX IF EXISTS idx_activity_instances_datetime;
DROP INDEX IF EXISTS idx_activity_instances_date;
DROP INDEX IF EXISTS idx_activity_instances_operator_id;
DROP INDEX IF EXISTS idx_activity_instances_schedule_id;
DROP INDEX IF EXISTS idx_activity_instances_template_id;

-- Drop tour instances table
DROP TABLE IF EXISTS public.activity_instances CASCADE;

-- ==============================================================================
-- ROLLBACK PHASE 1: REMOVE ACTIVITY TEMPLATES TABLE
-- ==============================================================================

-- Drop activity templates indexes
DROP INDEX IF EXISTS idx_activity_templates_featured;
DROP INDEX IF EXISTS idx_activity_templates_type;
DROP INDEX IF EXISTS idx_activity_templates_island;
DROP INDEX IF EXISTS idx_activity_templates_status;
DROP INDEX IF EXISTS idx_activity_templates_operator_id;

-- Drop activity templates table
DROP TABLE IF EXISTS public.activity_templates CASCADE;

-- ==============================================================================
-- CLEANUP AND LOGGING
-- ==============================================================================

-- Log rollback completion
INSERT INTO public.audit_logs (
    event_type, 
    table_name, 
    actor_type, 
    additional_info
) VALUES (
    'MIGRATION_ROLLED_BACK',
    'activity_template_system',
    'system',
    jsonb_build_object(
        'original_migration_id', '20250906000001',
        'rollback_timestamp', NOW(),
        'description', 'Complete rollback of Activity Template System',
        'tables_removed', ARRAY['activity_templates', 'activity_instances'],
        'views_removed', ARRAY['active_activity_templates_with_operators', 'active_activity_instances_with_details'],
        'functions_removed', ARRAY['generate_activity_instances_from_schedule', 'update_tour_instance_spots'],
        'impact', 'System restored to pre-migration state'
    )
);

-- Verify rollback completion
DO $$
BEGIN
    -- Check that tables are gone
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_templates') THEN
        RAISE EXCEPTION 'Rollback failed: activity_templates table still exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_instances') THEN
        RAISE EXCEPTION 'Rollback failed: activity_instances table still exists';
    END IF;
    
    -- Check that schedules table column is removed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedules' AND column_name = 'template_id'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: schedules.template_id column still exists';
    END IF;
    
    RAISE NOTICE 'ROLLBACK COMPLETED SUCCESSFULLY - Activity Template System removed';
    RAISE NOTICE 'System restored to pre-migration state';
    RAISE NOTICE 'All activity templates and tour instances data has been destroyed';
END $$;