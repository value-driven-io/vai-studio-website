-- FIX: Row Level Security Policy for Tour Generation During Schedule Updates
-- The issue is that tour generation during schedule updates might not satisfy RLS policies

-- 1. First, let's check the current RLS policies on tours table
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'tours';

-- 2. Check if there are issues with the current tour creation RLS policy
-- The likely issue is that the policy expects auth.uid() to match operators.auth_user_id
-- but during schedule updates, the context might be different

-- 3. Add a more permissive policy for tour generation from schedules
-- This allows operators to create scheduled tours from their own templates
CREATE POLICY "Operators can create scheduled tours from their templates" ON public.tours
    FOR INSERT WITH CHECK (
        activity_type = 'scheduled' 
        AND parent_template_id IS NOT NULL 
        AND parent_schedule_id IS NOT NULL
        AND auth.uid() IN (
            SELECT o.auth_user_id 
            FROM operators o 
            WHERE o.id = tours.operator_id
        )
        AND parent_template_id IN (
            SELECT t.id 
            FROM tours t 
            JOIN operators o ON t.operator_id = o.id
            WHERE t.is_template = true 
            AND o.auth_user_id = auth.uid()
        )
    );

-- 4. Also ensure operators can update their own scheduled tours
CREATE POLICY "Operators can update their own scheduled tours" ON public.tours
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

-- 5. Verify the policies are in place
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tours' 
  AND policyname LIKE '%scheduled%';

SELECT 'RLS policies updated for tour generation from schedule updates' as status;