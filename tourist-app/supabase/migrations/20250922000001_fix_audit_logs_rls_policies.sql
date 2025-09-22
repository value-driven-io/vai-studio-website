-- 🔐 AUDIT LOGS RLS POLICIES FIX
-- Fix for audit_logs table having RLS enabled but no policies defined
-- This was causing 403 errors when operators tried to decline bookings

SELECT 'CREATING AUDIT LOGS RLS POLICIES' as step;

-- ================================
-- AUDIT LOGS TABLE POLICIES
-- ================================

-- Policy 1: Allow authenticated users to insert audit logs
-- This is needed for triggers that log booking changes
CREATE POLICY "authenticated_users_can_insert_audit_logs" ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Allow authenticated users to read their own audit logs
-- Optional: Users can only see logs related to their actions
CREATE POLICY "users_can_read_own_audit_logs" ON audit_logs FOR SELECT
TO authenticated
USING (
    actor_id = auth.uid()
    OR actor_type = 'system'
    OR auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- Policy 3: Admin full access to audit logs
CREATE POLICY "admin_full_audit_logs_access" ON audit_logs FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- VERIFICATION
-- ================================

-- Check that RLS is enabled and policies are active
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'audit_logs') as policy_count
FROM pg_tables
WHERE tablename = 'audit_logs';

SELECT 'AUDIT LOGS RLS POLICIES CREATED SUCCESSFULLY' as status;
SELECT 'Operators should now be able to decline bookings without 403 errors' as result;