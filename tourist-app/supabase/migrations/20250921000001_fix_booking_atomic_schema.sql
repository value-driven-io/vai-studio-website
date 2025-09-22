-- 🚨 MINIMAL SCHEMA-CORRECT EMERGENCY FIX
-- Fix only the schema issue, keep exact same function signature
-- Timestamp: 2025-09-21 16:30:00 UTC

-- Check current function
SELECT 'CHECKING CURRENT FUNCTION' as status;
SELECT proname, prorettype::regtype as return_type, prosrc
FROM pg_proc
WHERE proname = 'create_booking_atomic';

-- MINIMAL FIX: Only change the problematic query to match actual schema
CREATE OR REPLACE FUNCTION create_booking_atomic(
    booking_data JSONB,
    tour_id UUID
) RETURNS JSONB AS $$
DECLARE
    tour_record RECORD;
    booking_id UUID;
    participants INTEGER;
    result JSONB;
BEGIN
    -- Extract participant count
    participants := (booking_data->>'num_adults')::INTEGER +
                   COALESCE((booking_data->>'num_children')::INTEGER, 0);

    -- FIXED: Use correct schema (no tour_schedules table)
    -- Lock tour row for atomic availability check using actual tours table
    SELECT id, status, available_spots, max_capacity, operator_id
    INTO tour_record
    FROM tours
    WHERE id = tour_id
    FOR UPDATE;

    -- Comprehensive validation (unchanged from original)
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tour not found',
            'error_code', 'TOUR_NOT_FOUND'
        );
    END IF;

    IF tour_record.status != 'active' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tour not available for booking',
            'error_code', 'TOUR_INACTIVE'
        );
    END IF;

    IF tour_record.available_spots < participants THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient spots available',
            'error_code', 'INSUFFICIENT_CAPACITY',
            'requested', participants,
            'available', tour_record.available_spots
        );
    END IF;

    -- Create booking with complete data (using actual bookings schema)
    INSERT INTO bookings (
        tour_id, operator_id, schedule_id,
        customer_name, customer_email, customer_phone, customer_whatsapp,
        num_adults, num_children, adult_price, child_price,
        subtotal, commission_amount, booking_reference,
        confirmation_deadline, special_requirements, dietary_restrictions,
        accessibility_needs, applied_commission_rate, booking_date,
        tourist_user_id, payment_intent_id
    ) VALUES (
        tour_id,
        tour_record.operator_id,
        NULLIF(booking_data->>'schedule_id', '')::UUID,
        booking_data->>'customer_name',
        booking_data->>'customer_email',
        COALESCE(booking_data->>'customer_phone', ''),
        COALESCE(booking_data->>'customer_whatsapp', ''),
        (booking_data->>'num_adults')::INTEGER,
        COALESCE((booking_data->>'num_children')::INTEGER, 0),
        (booking_data->>'adult_price')::INTEGER,
        COALESCE((booking_data->>'child_price')::INTEGER, 0),
        (booking_data->>'subtotal')::INTEGER,
        (booking_data->>'commission_amount')::INTEGER,
        booking_data->>'booking_reference',
        (booking_data->>'confirmation_deadline')::TIMESTAMP WITH TIME ZONE,
        booking_data->>'special_requirements',
        booking_data->>'dietary_restrictions',
        booking_data->>'accessibility_needs',
        COALESCE((booking_data->>'applied_commission_rate')::NUMERIC, 11.00),
        COALESCE((booking_data->>'booking_date')::DATE, CURRENT_DATE),
        NULLIF(booking_data->>'tourist_user_id', '')::UUID,
        booking_data->>'stripe_payment_intent_id'
    ) RETURNING id INTO booking_id;

    -- Reduce available spots atomically
    UPDATE tours
    SET available_spots = available_spots - participants
    WHERE id = tour_id;

    -- Success result (same format as original)
    RETURN json_build_object(
        'success', true,
        'booking_id', booking_id,
        'spots_reserved', participants
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql;

-- Verification
SELECT 'FUNCTION UPDATED' as status;
SELECT proname, prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'create_booking_atomic';