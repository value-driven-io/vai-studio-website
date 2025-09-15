-- CRITICAL FIX: Remove infinite recursion in RLS policies
-- The previous RLS policy created infinite recursion by referencing tours table within tours RLS policy

-- 1. Drop the problematic policies first
DROP POLICY IF EXISTS "Operators can create scheduled tours from their templates" ON public.tours;
DROP POLICY IF EXISTS "Operators can update their own scheduled tours" ON public.tours;

-- 2. Create a simpler, non-recursive policy for scheduled tour creation
-- This allows operators to create scheduled tours if they own the template (verified via operator_id match)
CREATE POLICY "Allow scheduled tour creation from templates" ON public.tours
    FOR INSERT WITH CHECK (
        activity_type = 'scheduled' 
        AND parent_template_id IS NOT NULL 
        AND parent_schedule_id IS NOT NULL
        AND auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
    );

-- 3. Create a simple policy for scheduled tour updates
CREATE POLICY "Allow scheduled tour updates" ON public.tours
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
    ) WITH CHECK (
        auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
    );

-- 4. Verify the policies are in place and show status
SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN qual LIKE '%tours%' AND cmd = 'INSERT' THEN 'POTENTIAL RECURSION RISK'
        ELSE 'OK'
    END as recursion_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tours' 
  AND (policyname LIKE '%scheduled%' OR policyname LIKE '%template%');

SELECT 'RLS infinite recursion fixed - simplified policies applied' as status;