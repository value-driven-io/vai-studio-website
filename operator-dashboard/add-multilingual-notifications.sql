-- Add Multi-Language Support to Notifications
-- Industry Standard: JSON fields for title/message in multiple languages
-- Fallback: Use default language if user's language not available

-- Add multilingual title and message fields
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS title_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS message_i18n JSONB DEFAULT '{}';

-- Create function to get localized notification content
CREATE OR REPLACE FUNCTION get_localized_notification_content(
    notification_row notifications,
    user_language TEXT DEFAULT 'en'
)
RETURNS TABLE(
    localized_title TEXT,
    localized_message TEXT
) AS $$
BEGIN
    RETURN QUERY SELECT
        COALESCE(
            notification_row.title_i18n ->> user_language,  -- Try user language
            notification_row.title_i18n ->> 'en',           -- Fallback to English
            notification_row.title                          -- Fallback to original title
        ) as localized_title,
        COALESCE(
            notification_row.message_i18n ->> user_language,  -- Try user language
            notification_row.message_i18n ->> 'en',           -- Fallback to English
            notification_row.message                          -- Fallback to original message
        ) as localized_message;
END;
$$ LANGUAGE plpgsql;

-- Update the booking notification trigger to support multilingual content
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
    tour_name TEXT;
BEGIN
    -- Only create notification for new bookings, not updates
    IF TG_OP = 'INSERT' THEN
        -- Get tour name
        SELECT tour_name INTO tour_name 
        FROM tours WHERE id = NEW.tour_id;
        
        INSERT INTO public.notifications (
            operator_id,
            recipient_type,
            type,
            category,
            title,
            message,
            title_i18n,
            message_i18n,
            action_type,
            action_data,
            source,
            data
        ) VALUES (
            NEW.operator_id,
            'operator',
            'booking',
            'transactional',
            'New Booking Request', -- Default English title
            'New booking for ' || COALESCE(tour_name, 'your activity'), -- Default English message
            -- Multilingual titles
            jsonb_build_object(
                'en', 'New Booking Request',
                'fr', 'Nouvelle Demande de Réservation'
            ),
            -- Multilingual messages  
            jsonb_build_object(
                'en', 'New booking for ' || COALESCE(tour_name, 'your activity'),
                'fr', 'Nouvelle réservation pour ' || COALESCE(tour_name, 'votre activité')
            ),
            'navigate',
            jsonb_build_object('tab', 'bookings', 'bookingId', NEW.id),
            'trigger',
            jsonb_build_object(
                'bookingId', NEW.id,
                'tourId', NEW.tour_id,
                'bookingReference', NEW.booking_reference,
                'customerName', NEW.customer_name,
                'activityName', COALESCE(tour_name, 'Unknown Activity')
            )
        );
        
        RAISE LOG 'Created multilingual booking notification for operator % booking %', NEW.operator_id, NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add example admin function for creating multilingual notifications
CREATE OR REPLACE FUNCTION create_multilingual_admin_notification(
    p_recipient_type VARCHAR DEFAULT 'all',
    p_title_i18n JSONB DEFAULT '{}',
    p_message_i18n JSONB DEFAULT '{}',
    p_type VARCHAR DEFAULT 'system',
    p_category VARCHAR DEFAULT 'system',
    p_priority INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    default_title TEXT;
    default_message TEXT;
BEGIN
    -- Extract default English content
    default_title := COALESCE(p_title_i18n ->> 'en', 'System Notification');
    default_message := COALESCE(p_message_i18n ->> 'en', 'System message');
    
    INSERT INTO public.notifications (
        recipient_type,
        type,
        category,
        priority,
        title,
        message,
        title_i18n,
        message_i18n,
        created_by,
        source
    ) VALUES (
        p_recipient_type,
        p_type,
        p_category,
        p_priority,
        default_title,
        default_message,
        p_title_i18n,
        p_message_i18n,
        auth.uid(),
        'admin'
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN notifications.title_i18n IS 'JSON object with localized titles: {"en": "English Title", "fr": "Titre Français"}';
COMMENT ON COLUMN notifications.message_i18n IS 'JSON object with localized messages: {"en": "English message", "fr": "Message français"}';
COMMENT ON FUNCTION get_localized_notification_content IS 'Returns localized title and message based on user language preference with fallbacks';

-- Example usage for future admin notifications:
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Multi-Language Notification Support Added';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '✓ title_i18n and message_i18n JSONB columns added';
    RAISE NOTICE '✓ get_localized_notification_content() function created';
    RAISE NOTICE '✓ Booking notifications now include French translations';
    RAISE NOTICE '✓ Admin can create multilingual notifications';
    RAISE NOTICE '';
    RAISE NOTICE 'Frontend Integration:';
    RAISE NOTICE '• Use title_i18n[currentLanguage] || title as fallback';
    RAISE NOTICE '• Current booking notifications auto-include EN/FR';
    RAISE NOTICE '• Ready for any language expansion';
    RAISE NOTICE '========================================';
END
$$;