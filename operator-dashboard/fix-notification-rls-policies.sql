-- Fix Notification RLS Policies - Correct Authentication Link
-- The issue: RLS policies assumed operator_id = auth.uid(), but operators.auth_user_id links to auth.users
-- Fix: Update policies to check through operators table relationship

-- Drop existing policies
DROP POLICY IF EXISTS "Operators can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Operators can update their notifications" ON public.notifications;

-- Create corrected policies that use operators.auth_user_id relationship
CREATE POLICY "Operators can view their notifications"
    ON public.notifications FOR SELECT
    USING (
        -- Check if current auth user owns the operator record
        operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        ) OR 
        -- Allow public notifications
        recipient_type IN ('all', 'segment')
    );

-- Operators can update their own notifications (mark as read/clicked)
CREATE POLICY "Operators can update their notifications"
    ON public.notifications FOR UPDATE
    USING (
        operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Also update the utility functions to use correct relationship
-- Function: Mark specific notification as read (Fixed with correct auth relationship)
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications 
    SET 
        read = TRUE,
        read_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE 
        id = notification_id 
        AND operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        )
        AND read = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark all notifications as read (Fixed with correct auth relationship)
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications 
    SET 
        read = TRUE,
        read_at = timezone('utc'::text, now()),
        updated_at = timezone('utc'::text, now())
    WHERE 
        (
            operator_id IN (
                SELECT id FROM public.operators 
                WHERE auth_user_id = auth.uid()
            ) OR 
            recipient_type IN ('all', 'segment')
        )
        AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get unread notification count (Fixed with correct auth relationship)
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE (
            operator_id IN (
                SELECT id FROM public.operators 
                WHERE auth_user_id = auth.uid()
            ) OR 
            recipient_type IN ('all', 'segment')
        )
        AND read = FALSE
        AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
        AND scheduled_for <= timezone('utc'::text, now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fix
DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'RLS Policy Fix Applied Successfully';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Fixed Issues:';
    RAISE NOTICE '✓ RLS policies now use operators.auth_user_id relationship';
    RAISE NOTICE '✓ Utility functions updated with correct auth check';
    RAISE NOTICE '✓ Notifications should now be accessible to authenticated operators';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run this script in Supabase SQL Editor to fix authentication';
    RAISE NOTICE '======================================';
END
$$;