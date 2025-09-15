-- Debug RLS Policy Issue for Schedule Updates
-- The RLS policy is still blocking tour creation during schedule updates
-- Let's investigate what's happening

-- 1. Check ALL current RLS policies on tours table
SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN cmd = 'INSERT' THEN 'INSERT POLICY'
        WHEN cmd = 'UPDATE' THEN 'UPDATE POLICY' 
        WHEN cmd = 'ALL' THEN 'ALL OPERATIONS'
        ELSE cmd
    END as policy_type,
    CASE 
        WHEN length(qual) > 80 THEN left(qual, 80) || '...'
        ELSE qual
    END as using_condition,
    CASE 
        WHEN length(with_check) > 80 THEN left(with_check, 80) || '...'
        ELSE with_check
    END as with_check_condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tours'
ORDER BY cmd, policyname;

-- 2. Check if there are any conflicting or overlapping policies
-- Multiple policies can cause conflicts especially with different permissiveness

-- 3. Test policy with a sample operator to understand what's failing
-- Replace with actual operator ID from your data
SELECT 
    'Testing RLS for operator c78f7f64-cab8-4f48-9427-de87e12ec2b9' as test_info;

-- 4. Check if the issue is with the INSERT part of the policy
-- The error suggests INSERT is being blocked specifically

SELECT 'RLS policy debugging queries executed' as status;