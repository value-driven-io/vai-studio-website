-- stripe_payment_fields_to_bookings_table.sql
-- Add Stripe payment fields to bookings table
-- Timezone-safe with explicit TIMESTAMP WITH TIME ZONE

BEGIN;

-- Add Stripe payment tracking fields
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMP WITH TIME ZONE;

-- Update payment_status constraint to include 'authorized'
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_payment_status_check 
CHECK (payment_status::text = ANY(ARRAY[
  'pending'::character varying, 
  'authorized'::character varying,  -- NEW for Stripe auth/capture
  'paid'::character varying, 
  'refunded'::character varying, 
  'failed'::character varying
]::text[]));

-- Add indexes for payment lookups (timezone-aware)
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent_id 
ON bookings(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_captured 
ON bookings(payment_captured_at) 
WHERE payment_captured_at IS NOT NULL;

-- Update confirmation deadline to 24 hours for payment integration
-- This ensures proper timezone handling for Polynesian operators
COMMENT ON COLUMN bookings.confirmation_deadline IS 
'Operator must confirm by this UTC timestamp. Typically 24-48 hours from booking creation.';

COMMIT;