-- Migration: Fix RLS Policy for Template Creation
-- Description: Update row-level security to allow templates without tour_date/time_slot
-- Issue: Templates fail with RLS violation when tour_date/time_slot are null
-- Created: 2025-09-07

-- ==============================================================================
-- RLS POLICY UPDATES FOR TEMPLATE SUPPORT
-- ==============================================================================

-- First, let's check what RLS policies exist
DO $$
BEGIN
    RAISE NOTICE 'Current RLS policies for tours table:';
END $$;

-- Drop existing restrictive policies that might block templates
-- (We'll create new ones that properly handle templates)

-- Check if there are any overly restrictive INSERT policies
DROP POLICY IF EXISTS tours_insert_policy ON tours;
DROP POLICY IF EXISTS tours_insert_own_tours ON tours;
DROP POLICY IF EXISTS tours_operator_insert ON tours;

-- Create new INSERT policy that allows templates without date/time
CREATE POLICY tours_insert_policy ON tours 
FOR INSERT 
WITH CHECK (
    -- Allow if user owns the operator
    operator_id IN (
        SELECT id FROM operators 
        WHERE auth_user_id = auth.uid()
    )
    -- Additional check: Templates are allowed without date/time
    AND (
        (is_template = true AND tour_date IS NULL AND time_slot IS NULL)
        OR 
        (is_template = false AND tour_date IS NOT NULL AND time_slot IS NOT NULL)
        OR
        (is_template IS NULL) -- Backward compatibility
    )
);

-- Ensure SELECT policy allows templates
DROP POLICY IF EXISTS tours_select_policy ON tours;
DROP POLICY IF EXISTS tours_select_own_tours ON tours;

CREATE POLICY tours_select_policy ON tours 
FOR SELECT 
USING (
    -- Allow if user owns the operator
    operator_id IN (
        SELECT id FROM operators 
        WHERE auth_user_id = auth.uid()
    )
);

-- Update policy allows updating own tours (including templates)
DROP POLICY IF EXISTS tours_update_policy ON tours;
DROP POLICY IF EXISTS tours_update_own_tours ON tours;

CREATE POLICY tours_update_policy ON tours 
FOR UPDATE 
USING (
    operator_id IN (
        SELECT id FROM operators 
        WHERE auth_user_id = auth.uid()
    )
)
WITH CHECK (
    operator_id IN (
        SELECT id FROM operators 
        WHERE auth_user_id = auth.uid()
    )
);

-- Delete policy allows deleting own tours
DROP POLICY IF EXISTS tours_delete_policy ON tours;
DROP POLICY IF EXISTS tours_delete_own_tours ON tours;

CREATE POLICY tours_delete_policy ON tours 
FOR DELETE 
USING (
    operator_id IN (
        SELECT id FROM operators 
        WHERE auth_user_id = auth.uid()
    )
);

-- ==============================================================================
-- ENABLE RLS (in case it was disabled)
-- ==============================================================================

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

-- Verify the policies are created correctly
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'tours';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE 'SUCCESS: RLS policies created for tours table (% policies)', policy_count;
    ELSE
        RAISE WARNING 'WARNING: Expected 4+ policies, found %', policy_count;
    END IF;
END $$;

-- Log the migration
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            event_type, 
            table_name, 
            actor_type, 
            additional_info
        ) VALUES (
            'MIGRATION_EXECUTED',
            'tours',
            'system',
            jsonb_build_object(
                'migration_id', '20250907000002',
                'description', 'Fix RLS Policy for Template Creation',
                'issue', 'Templates failed RLS check with null tour_date/time_slot',
                'solution', 'Updated INSERT policy to allow templates without date/time',
                'policies_updated', ARRAY['INSERT', 'SELECT', 'UPDATE', 'DELETE']
            )
        );
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'RLS POLICY FIX COMPLETED SUCCESSFULLY';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Templates can now be created without tour_date/time_slot';
    RAISE NOTICE 'All CRUD operations properly scoped to operator ownership';
    RAISE NOTICE 'Ready to test template creation';
    RAISE NOTICE '===============================================';
END $$;