-- Emergency rollback script - IMPLEMENTATION_CHECKLIST Step 3
-- Created: 2025-09-21 14:30:00 UTC
-- Use this script to revert changes if anything goes wrong

-- Emergency rollback script
DROP TRIGGER IF EXISTS restore_availability_trigger ON bookings;
DROP FUNCTION IF EXISTS restore_tour_availability();
DROP FUNCTION IF EXISTS create_booking_atomic(JSONB, UUID);

-- Note: This will restore the system to the state before implementing fixes
-- After running this, the original booking errors will return
-- Only use in emergency situations