-- Create notifications table for cross-device notification sync
-- This replaces localStorage-based notifications with proper server-side storage

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'system', 'message'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Related data (JSON for flexibility)
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes for performance
    UNIQUE(id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_operator_id ON public.notifications(operator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(operator_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Operators can view their own notifications"
    ON public.notifications FOR SELECT
    USING (operator_id = auth.uid());

CREATE POLICY "Operators can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (operator_id = auth.uid());

-- System can insert notifications (for booking triggers)
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Function to create booking notification
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification for new bookings, not updates
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.notifications (
            operator_id,
            type,
            title,
            message,
            data
        ) VALUES (
            NEW.operator_id,
            'booking',
            'New Booking Request',
            'New booking for ' || COALESCE((SELECT tour_name FROM tours WHERE id = NEW.tour_id), 'your activity'),
            jsonb_build_object(
                'bookingId', NEW.id,
                'tourId', NEW.tour_id,
                'bookingReference', NEW.booking_reference,
                'customerName', NEW.customer_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notifications for new bookings
DROP TRIGGER IF EXISTS trigger_create_booking_notification ON public.bookings;
CREATE TRIGGER trigger_create_booking_notification
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_notification();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications 
    SET 
        read = TRUE,
        read_at = NOW()
    WHERE 
        id = notification_id 
        AND operator_id = auth.uid()
        AND read = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for an operator
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications 
    SET 
        read = TRUE,
        read_at = NOW()
    WHERE 
        operator_id = auth.uid()
        AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE operator_id = auth.uid()
        AND read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications (keep last 100 per operator)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH old_notifications AS (
        SELECT id
        FROM public.notifications
        WHERE operator_id = auth.uid()
        ORDER BY created_at DESC
        OFFSET 100
    )
    DELETE FROM public.notifications
    WHERE id IN (SELECT id FROM old_notifications);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.notifications IS 'Cross-device notification system for operators';
COMMENT ON FUNCTION create_booking_notification() IS 'Automatically creates notifications when new bookings are received';
COMMENT ON FUNCTION mark_notification_read(UUID) IS 'Marks a specific notification as read';
COMMENT ON FUNCTION mark_all_notifications_read() IS 'Marks all notifications as read for the current operator';
COMMENT ON FUNCTION get_unread_notification_count() IS 'Returns count of unread notifications for current operator';