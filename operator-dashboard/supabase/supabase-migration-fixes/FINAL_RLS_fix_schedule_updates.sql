-- FINAL RLS FIX: Schedule Updates with Customized Tours
-- Issue: Multiple RLS policies causing conflicts during schedule updates
-- Solution: Simplify to one comprehensive policy for all tour operations

-- 1. Drop ALL existing RLS policies for tours to start clean
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tours'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.tours';
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- 2. Create ONE comprehensive RLS policy for all tour operations
-- This policy allows operators to manage all their own tours (templates, scheduled, customized)
CREATE POLICY "Operators manage their own tours" ON public.tours
    FOR ALL 
    TO authenticated
    USING (
        -- Allow operators to see/update/delete their own tours
        auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
    )
    WITH CHECK (
        -- Allow operators to create/update tours under their operator_id
        auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
    );

-- 3. Verify RLS is enabled on the tours table
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

-- 4. Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tours TO authenticated;

-- 5. Verify the policy is working
SELECT 
    policyname,
    cmd,
    permissive,
    'Policy allows operators to manage their own tours' as description
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tours';

SELECT 'RLS policies simplified - one comprehensive policy for all tour operations' as status;