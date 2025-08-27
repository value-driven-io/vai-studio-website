-- Create Example Multilingual Notifications
-- Run this after the multilingual migration to test the i18n system

-- Example 1: System announcement (for all operators)
INSERT INTO public.notifications (
    recipient_type,
    type,
    category,
    priority,
    title,
    message,
    title_i18n,
    message_i18n,
    action_type,
    source
) VALUES (
    'all',
    'system',
    'system',
    1,
    'Platform Update Available',
    'New features have been added to improve your experience',
    jsonb_build_object(
        'en', 'Platform Update Available',
        'fr', 'Mise à Jour de la Plateforme Disponible'
    ),
    jsonb_build_object(
        'en', 'New features have been added to improve your experience',
        'fr', 'De nouvelles fonctionnalités ont été ajoutées pour améliorer votre expérience'
    ),
    'dismiss_only',
    'admin'
);

-- Example 2: Marketing promotion (for all operators)
INSERT INTO public.notifications (
    recipient_type,
    type,
    category,
    priority,
    title,
    message,
    title_i18n,
    message_i18n,
    action_type,
    source,
    expires_at
) VALUES (
    'all',
    'promotion',
    'marketing',
    0,
    'Special Summer Promotion',
    'Boost your bookings with our summer marketing campaign',
    jsonb_build_object(
        'en', 'Special Summer Promotion',
        'fr', 'Promotion Spéciale d''Été'
    ),
    jsonb_build_object(
        'en', 'Boost your bookings with our summer marketing campaign',
        'fr', 'Augmentez vos réservations avec notre campagne marketing d''été'
    ),
    'external_link',
    'admin',
    timezone('utc'::text, now()) + INTERVAL '30 days'
);

-- Example 3: Specific operator notification (replace with actual operator_id)
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
    source
) 
SELECT 
    id as operator_id,
    'operator',
    'system',
    'support',
    'Account Verification Required',
    'Please complete your account verification to continue receiving bookings',
    jsonb_build_object(
        'en', 'Account Verification Required',
        'fr', 'Vérification de Compte Requise'
    ),
    jsonb_build_object(
        'en', 'Please complete your account verification to continue receiving bookings',
        'fr', 'Veuillez compléter la vérification de votre compte pour continuer à recevoir des réservations'
    ),
    'navigate',
    jsonb_build_object('tab', 'profile'),
    'admin'
FROM operators 
WHERE status = 'active'
LIMIT 1;

-- Example 4: Urgent system maintenance notice
INSERT INTO public.notifications (
    recipient_type,
    type,
    category,
    priority,
    title,
    message,
    title_i18n,
    message_i18n,
    action_type,
    source,
    scheduled_for
) VALUES (
    'all',
    'system',
    'system',
    2,
    'Scheduled Maintenance Tonight',
    'System will be unavailable from 2:00 AM to 4:00 AM UTC for maintenance',
    jsonb_build_object(
        'en', 'Scheduled Maintenance Tonight',
        'fr', 'Maintenance Programmée Ce Soir'
    ),
    jsonb_build_object(
        'en', 'System will be unavailable from 2:00 AM to 4:00 AM UTC for maintenance',
        'fr', 'Le système sera indisponible de 2h00 à 4h00 UTC pour maintenance'
    ),
    'dismiss_only',
    'admin',
    timezone('utc'::text, now()) + INTERVAL '1 hour'
);

-- Show the created notifications
SELECT 
    id,
    recipient_type,
    type,
    title,
    title_i18n,
    message,
    message_i18n,
    created_at
FROM public.notifications 
WHERE source = 'admin'
ORDER BY created_at DESC;

-- Test the localization function with different languages
SELECT 
    'English Version:' as language,
    localized_title,
    localized_message
FROM public.notifications n,
LATERAL get_localized_notification_content(n, 'en') 
WHERE n.type = 'system' 
LIMIT 1;

SELECT 
    'French Version:' as language,
    localized_title,
    localized_message
FROM public.notifications n,
LATERAL get_localized_notification_content(n, 'fr') 
WHERE n.type = 'system' 
LIMIT 1;