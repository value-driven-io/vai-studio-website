-- Test queries to verify notification migration
-- Run these in Supabase SQL Editor after the main migration

-- 1. Check if notifications table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 2. Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'notifications';

-- 3. Check if RLS policies exist
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';

-- 4. Check if functions exist
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('create_booking_notification', 'mark_notification_read', 'mark_all_notifications_read', 'get_unread_notification_count');

-- 5. Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_booking_notification';

-- 6. Test notification insertion (replace with real operator_id)
-- INSERT INTO notifications (operator_id, type, title, message, data) 
-- VALUES ('your-operator-uuid', 'system', 'Test Notification', 'Migration successful!', '{"test": true}');

-- 7. Test read functions (uncomment after inserting test notification)
-- SELECT get_unread_notification_count();
-- SELECT * FROM notifications WHERE operator_id = auth.uid() LIMIT 5;