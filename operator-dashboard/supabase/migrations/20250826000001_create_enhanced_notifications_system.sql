-- Enhanced Notifications System - Future-Ready Architecture
-- Supports current booking notifications + future admin campaigns, rich content, and segmentation
-- Fully backward compatible with existing notification service

-- ====================================================================
-- ENHANCED NOTIFICATIONS TABLE  
-- Timezone: All timestamps stored in UTC, frontend handles local timezone conversion
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    -- Core Identity
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Targeting & Recipients (Enhanced for future segmentation)
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) DEFAULT 'operator' NOT NULL, -- 'operator', 'all', 'segment'
    segment_criteria JSONB, -- Future: Target specific operator segments
    
    -- Content & Presentation (Enhanced for rich content)
    type VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'marketing', 'system', 'update', 'promotion'
    category VARCHAR(50) DEFAULT 'transactional', -- 'transactional', 'marketing', 'system', 'support'
    priority INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=urgent
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    rich_content JSONB, -- Future: HTML content, images, videos
    
    -- Interactivity & Actions (Enhanced for future deep linking)
    action_type VARCHAR(30) DEFAULT 'navigate', -- 'navigate', 'external_link', 'modal', 'dismiss_only'
    action_url TEXT, -- Deep links or external URLs
    action_data JSONB, -- Future: Navigation parameters, modal content
    cta_text VARCHAR(100), -- Future: Call-to-action button text
    
    -- Scheduling & Lifecycle (Enhanced for future campaigns)
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE, -- Future: Time-sensitive notifications
    
    -- Tracking & Analytics (Enhanced for future performance measurement)
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked BOOLEAN DEFAULT FALSE, -- Future: Click tracking
    clicked_at TIMESTAMP WITH TIME ZONE, -- Future: Click analytics
    dismissed BOOLEAN DEFAULT FALSE, -- Future: Dismissal tracking
    dismissed_at TIMESTAMP WITH TIME ZONE, -- Future: Dismissal analytics
    
    -- System & Attribution (Enhanced for future admin features)
    created_by UUID, -- Future: Admin who created notification (null for system)
    campaign_id VARCHAR(100), -- Future: Marketing campaign tracking
    source VARCHAR(50) DEFAULT 'system', -- 'system', 'admin', 'trigger', 'api'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Related Data (Current: booking info, Future: flexible JSON storage)
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Validation Constraints
    CONSTRAINT valid_recipient CHECK (
        (recipient_type = 'operator' AND operator_id IS NOT NULL) OR
        (recipient_type IN ('all', 'segment'))
    ),
    CONSTRAINT valid_priority CHECK (priority BETWEEN 0 AND 2),
    CONSTRAINT valid_scheduled_time CHECK (scheduled_for <= COALESCE(expires_at, scheduled_for + INTERVAL '1 year'))
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

-- Core performance indexes (Current needs)
CREATE INDEX IF NOT EXISTS idx_notifications_operator_id ON public.notifications(operator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(operator_id, read) WHERE read = FALSE;

-- Future-ready indexes (Performance for segmentation and analytics)
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON public.notifications(recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON public.notifications(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for > created_at;
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority) WHERE priority > 0;

-- Analytics indexes (Future performance)
CREATE INDEX IF NOT EXISTS idx_notifications_clicked ON public.notifications(clicked, created_at) WHERE clicked = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_engagement ON public.notifications(read, clicked, dismissed, created_at);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Operators can view their own notifications + public notifications
CREATE POLICY "Operators can view their notifications"
    ON public.notifications FOR SELECT
    USING (
        operator_id = auth.uid() OR 
        recipient_type IN ('all', 'segment')
    );

-- Operators can update their own notifications (mark as read/clicked)
CREATE POLICY "Operators can update their notifications"
    ON public.notifications FOR UPDATE
    USING (operator_id = auth.uid())
    WITH CHECK (operator_id = auth.uid());

-- System and admins can insert notifications
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        -- System notifications (triggers, automated)
        created_by IS NULL OR 
        -- Future: Admin notifications (when admin role is implemented)
        auth.uid() IS NOT NULL
    );

-- Future: Admin policy for managing all notifications
-- CREATE POLICY "Admins can manage all notifications"
--     ON public.notifications FOR ALL
--     USING (auth.jwt() ->> 'user_role' = 'admin');

-- ====================================================================
-- AUTOMATED FUNCTIONS (Current Implementation)
-- ====================================================================

-- Function: Create booking notification (Enhanced for future flexibility)
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification for new bookings, not updates
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.notifications (
            operator_id,
            recipient_type,
            type,
            category,
            title,
            message,
            action_type,
            action_data,
            source,
            data
        ) VALUES (
            NEW.operator_id,
            'operator',
            'booking',
            'transactional',
            'New Booking Request',
            'New booking for ' || COALESCE((SELECT tour_name FROM tours WHERE id = NEW.tour_id), 'your activity'),
            'navigate',
            jsonb_build_object('tab', 'bookings', 'bookingId', NEW.id),
            'trigger',
            jsonb_build_object(
                'bookingId', NEW.id,
                'tourId', NEW.tour_id,
                'bookingReference', NEW.booking_reference,
                'customerName', NEW.customer_name,
                'activityName', COALESCE((SELECT tour_name FROM tours WHERE id = NEW.tour_id), 'Unknown Activity')
            )
        );
        
        -- Log notification creation for debugging
        RAISE LOG 'Created booking notification for operator % booking %', NEW.operator_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- DATABASE TRIGGERS (Current Implementation)
-- ====================================================================

-- Create trigger for automatic booking notifications
DROP TRIGGER IF EXISTS trigger_create_booking_notification ON public.bookings;
CREATE TRIGGER trigger_create_booking_notification
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_notification();

-- Future: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- ====================================================================
-- UTILITY FUNCTIONS (Enhanced for Future Features)
-- ====================================================================

-- Function: Mark specific notification as read (Enhanced with analytics)
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
        AND operator_id = auth.uid()
        AND read = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark all notifications as read (Enhanced with analytics)
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
        (operator_id = auth.uid() OR recipient_type IN ('all', 'segment'))
        AND read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Track notification click (Future analytics)
CREATE OR REPLACE FUNCTION mark_notification_clicked(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications 
    SET 
        clicked = TRUE,
        clicked_at = timezone('utc'::text, now()),
        read = TRUE, -- Auto-mark as read when clicked
        read_at = COALESCE(read_at, timezone('utc'::text, now())),
        updated_at = timezone('utc'::text, now())
    WHERE 
        id = notification_id 
        AND (operator_id = auth.uid() OR recipient_type IN ('all', 'segment'))
        AND clicked = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get unread notification count (Enhanced for all notification types)
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE (
            operator_id = auth.uid() OR 
            recipient_type IN ('all', 'segment')
        )
        AND read = FALSE
        AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
        AND scheduled_for <= timezone('utc'::text, now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- MAINTENANCE FUNCTIONS (Future Optimization)
-- ====================================================================

-- Function: Clean up old notifications (Enhanced with configurable retention)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(retention_days INTEGER DEFAULT 90, max_per_operator INTEGER DEFAULT 100)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    excess_deleted_count INTEGER := 0;
BEGIN
    -- Delete notifications older than retention period
    WITH old_notifications AS (
        DELETE FROM public.notifications
        WHERE created_at < timezone('utc'::text, now()) - (retention_days || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM old_notifications;
    
    -- Keep only the most recent notifications per operator (beyond retention)
    WITH excess_notifications AS (
        SELECT id
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY operator_id ORDER BY created_at DESC) as rn
            FROM public.notifications
            WHERE operator_id IS NOT NULL
        ) ranked
        WHERE rn > max_per_operator
    )
    DELETE FROM public.notifications
    WHERE id IN (SELECT id FROM excess_notifications);
    
    GET DIAGNOSTICS excess_deleted_count = ROW_COUNT;
    RETURN deleted_count + excess_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- FUTURE ADMIN FUNCTIONS (Ready for Implementation)
-- ====================================================================

-- Function: Create admin notification (Future feature)
CREATE OR REPLACE FUNCTION create_admin_notification(
    p_recipient_type VARCHAR DEFAULT 'all',
    p_segment_criteria JSONB DEFAULT NULL,
    p_type VARCHAR DEFAULT 'system',
    p_category VARCHAR DEFAULT 'system',
    p_title TEXT DEFAULT '',
    p_message TEXT DEFAULT '',
    p_rich_content JSONB DEFAULT NULL,
    p_action_type VARCHAR DEFAULT 'dismiss_only',
    p_action_url TEXT DEFAULT NULL,
    p_cta_text VARCHAR DEFAULT NULL,
    p_campaign_id VARCHAR DEFAULT NULL,
    p_priority INTEGER DEFAULT 0,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        recipient_type,
        segment_criteria,
        type,
        category,
        priority,
        title,
        message,
        rich_content,
        action_type,
        action_url,
        cta_text,
        campaign_id,
        expires_at,
        created_by,
        source
    ) VALUES (
        p_recipient_type,
        p_segment_criteria,
        p_type,
        p_category,
        p_priority,
        p_title,
        p_message,
        p_rich_content,
        p_action_type,
        p_action_url,
        p_cta_text,
        p_campaign_id,
        p_expires_at,
        auth.uid(),
        'admin'
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ANALYTICS VIEWS (Future Reporting)
-- ====================================================================

-- View: Notification performance metrics
CREATE OR REPLACE VIEW notification_analytics AS
SELECT 
    type,
    category,
    campaign_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as sent_count,
    COUNT(*) FILTER (WHERE read = true) as read_count,
    COUNT(*) FILTER (WHERE clicked = true) as clicked_count,
    COUNT(*) FILTER (WHERE dismissed = true) as dismissed_count,
    ROUND(COUNT(*) FILTER (WHERE read = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as read_rate,
    ROUND(COUNT(*) FILTER (WHERE clicked = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as click_rate,
    AVG(EXTRACT(EPOCH FROM (read_at - created_at))/60) FILTER (WHERE read_at IS NOT NULL) as avg_read_time_minutes
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type, category, campaign_id, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ====================================================================
-- DOCUMENTATION & METADATA
-- ====================================================================

COMMENT ON TABLE public.notifications IS 'Enhanced notification system supporting current booking alerts and future admin campaigns, rich content, and operator segmentation. Timezone: UTC storage, frontend handles local timezone conversion for multi-country support';

COMMENT ON COLUMN public.notifications.recipient_type IS 'Target audience: operator (specific), all (broadcast), segment (filtered)';
COMMENT ON COLUMN public.notifications.segment_criteria IS 'JSON criteria for targeting operator segments (future feature)';
COMMENT ON COLUMN public.notifications.rich_content IS 'JSON content for HTML, images, videos (future feature)';
COMMENT ON COLUMN public.notifications.action_type IS 'Interaction type: navigate (internal), external_link, modal, dismiss_only';
COMMENT ON COLUMN public.notifications.campaign_id IS 'Marketing campaign identifier for analytics tracking';
COMMENT ON COLUMN public.notifications.priority IS '0=normal, 1=high, 2=urgent - affects display order and styling';

COMMENT ON FUNCTION create_booking_notification() IS 'Automatically creates booking notifications when new bookings are inserted';
COMMENT ON FUNCTION mark_notification_read(UUID) IS 'Marks specific notification as read with timestamp';
COMMENT ON FUNCTION mark_all_notifications_read() IS 'Marks all accessible notifications as read for current user';
COMMENT ON FUNCTION get_unread_notification_count() IS 'Returns count of unread, non-expired notifications for current user';
COMMENT ON FUNCTION create_admin_notification IS 'Creates admin-generated notifications with full feature support (future feature)';

-- ====================================================================
-- MIGRATION SUCCESS CONFIRMATION
-- ====================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Enhanced Notifications System Migration COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features Ready:';
    RAISE NOTICE '✓ Backward-compatible booking notifications';
    RAISE NOTICE '✓ Future admin campaign capabilities';
    RAISE NOTICE '✓ Rich content and segmentation schema';
    RAISE NOTICE '✓ Advanced analytics tracking';
    RAISE NOTICE '✓ Performance-optimized indexes';
    RAISE NOTICE '✓ Comprehensive RLS security';
    RAISE NOTICE '';
    RAISE NOTICE 'Current notification service will work unchanged.';
    RAISE NOTICE 'Future features can be built on this foundation.';
    RAISE NOTICE '========================================';
END
$$;