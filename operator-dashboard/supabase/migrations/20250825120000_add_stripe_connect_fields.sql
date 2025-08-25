-- Add Stripe Connect fields to operators table
-- For Express account management and commission tracking

BEGIN;

-- Add Stripe Connect fields to operators table
ALTER TABLE operators 
ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_connect_status VARCHAR(50) DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,4) DEFAULT 0.11, -- VAI takes 11%
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraint for Stripe Connect status
ALTER TABLE operators 
ADD CONSTRAINT operators_stripe_connect_status_check 
CHECK (stripe_connect_status IN ('not_connected', 'pending', 'connected', 'rejected'));

-- Add booking completion tracking fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS tour_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_transfer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payout_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS operator_amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER;

-- Add constraint for payout status
ALTER TABLE bookings
ADD CONSTRAINT bookings_payout_status_check
CHECK (payout_status IN ('pending', 'scheduled', 'processing', 'paid', 'failed'));

-- Create indexes for Stripe Connect lookups
CREATE INDEX IF NOT EXISTS idx_operators_stripe_account 
ON operators(stripe_connect_account_id)
WHERE stripe_connect_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_payout_scheduled
ON bookings(payout_scheduled_at)
WHERE payout_scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_tour_completed
ON bookings(tour_completed_at)
WHERE tour_completed_at IS NOT NULL;

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_operators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_operators_updated_at
    BEFORE UPDATE ON operators
    FOR EACH ROW
    EXECUTE FUNCTION update_operators_updated_at();

COMMIT;