-- 🔐 HYBRID RLS SECURITY FIX
-- Implements secure booking function + granular RLS policies
-- Timestamp: 2025-09-21 17:00:00 UTC

-- ================================
-- STEP 1: IMMEDIATE FIX - Make booking function SECURITY DEFINER
-- ================================
SELECT 'APPLYING SECURITY DEFINER TO BOOKING FUNCTION' as step;

ALTER FUNCTION create_booking_atomic(jsonb, uuid) SECURITY DEFINER;

-- Verify the change
SELECT
    proname as function_name,
    prosecdef as is_security_definer,
    'Fixed: Function now runs with creator privileges' as status
FROM pg_proc
WHERE proname = 'create_booking_atomic';

-- ================================
-- STEP 2: GRANULAR RLS POLICIES FOR APPLICATION ACCESS
-- ================================
SELECT 'CREATING GRANULAR RLS POLICIES' as step;

-- ================================
-- TOURS TABLE POLICIES
-- ================================

-- Policy 1: Public can view active tours (for discovery/browsing)
CREATE POLICY "public_active_tours" ON tours FOR SELECT
TO authenticated, anon
USING (
    status = 'active'
    AND is_template = false
    AND available_spots > 0
    AND tour_date >= CURRENT_DATE
);

-- Policy 2: Operators can manage their own tours
CREATE POLICY "operators_manage_tours" ON tours FOR ALL
TO authenticated
USING (
    operator_id IN (
        SELECT id FROM operators
        WHERE auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
        OR auth.email() = email
    )
);

-- Policy 3: Admin access (for admin panel)
CREATE POLICY "admin_full_tours_access" ON tours FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- BOOKINGS TABLE POLICIES
-- ================================

-- Policy 1: Users can view their own bookings
CREATE POLICY "users_own_bookings" ON bookings FOR SELECT
TO authenticated
USING (
    tourist_user_id = auth.uid()
    OR customer_email = auth.email()
    OR auth.jwt() ->> 'email' = customer_email
);

-- Policy 2: Operators can view bookings for their tours
CREATE POLICY "operators_tour_bookings" ON bookings FOR SELECT
TO authenticated
USING (
    operator_id IN (
        SELECT id FROM operators
        WHERE auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
        OR auth.email() = email
    )
);

-- Policy 3: Operators can update booking status
CREATE POLICY "operators_update_bookings" ON bookings FOR UPDATE
TO authenticated
USING (
    operator_id IN (
        SELECT id FROM operators
        WHERE auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
        OR auth.email() = email
    )
)
WITH CHECK (
    operator_id IN (
        SELECT id FROM operators
        WHERE auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
        OR auth.email() = email
    )
);

-- Policy 4: Admin access to all bookings
CREATE POLICY "admin_full_bookings_access" ON bookings FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- OPERATORS TABLE POLICIES
-- ================================

-- Policy 1: Public can view active operator info (for tour display)
CREATE POLICY "public_operator_info" ON operators FOR SELECT
TO authenticated, anon
USING (
    status = 'active'
);

-- Policy 2: Operators can manage their own profile
CREATE POLICY "operators_own_profile" ON operators FOR ALL
TO authenticated
USING (
    auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
    OR auth.email() = email
);

-- Policy 3: Admin access to all operators
CREATE POLICY "admin_operators_access" ON operators FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- TOURIST_USERS TABLE POLICIES
-- ================================

-- Policy 1: Users can manage their own profile
CREATE POLICY "users_own_profile" ON tourist_users FOR ALL
TO authenticated
USING (auth_user_id = auth.uid());

-- Policy 2: Admin access to user profiles
CREATE POLICY "admin_users_access" ON tourist_users FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- SCHEDULES TABLE POLICIES
-- ================================

-- Policy 1: Public can view active schedules (for schedule-based tours)
CREATE POLICY "public_active_schedules" ON schedules FOR SELECT
TO authenticated, anon
USING (
    is_paused = false
    AND end_date >= CURRENT_DATE
);

-- Policy 2: Operators can manage their schedules
CREATE POLICY "operators_manage_schedules" ON schedules FOR ALL
TO authenticated
USING (
    operator_id IN (
        SELECT id FROM operators
        WHERE auth.uid()::text = ANY(string_to_array(coalesce(auth.jwt() ->> 'operator_ids', ''), ','))
        OR auth.email() = email
    )
);

-- Policy 3: Admin access to all schedules
CREATE POLICY "admin_schedules_access" ON schedules FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'role' = 'service_role'
);

-- ================================
-- STEP 3: VERIFICATION
-- ================================
SELECT 'VERIFYING SECURITY CONFIGURATION' as step;

-- Check function security definer status
SELECT
    'create_booking_atomic' as function_name,
    prosecdef as is_security_definer,
    CASE WHEN prosecdef THEN 'SECURE ✅' ELSE 'NEEDS FIX ❌' END as status
FROM pg_proc
WHERE proname = 'create_booking_atomic';

-- Check RLS is still enabled on critical tables
SELECT
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tours', 'bookings', 'operators', 'tourist_users', 'schedules')
ORDER BY tablename;

-- Count policies per table
SELECT
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('tours', 'bookings', 'operators', 'tourist_users', 'schedules')
GROUP BY schemaname, tablename
ORDER BY tablename;

SELECT 'RLS SECURITY FIX COMPLETE' as status;
SELECT 'Booking function now has SECURITY DEFINER privileges' as result;
SELECT 'Granular RLS policies implemented for application access' as result;