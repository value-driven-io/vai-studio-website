-- Add individual tour status options: paused and hidden
-- This allows granular control at the tour level (different from schedule-level pause)

-- Drop the existing constraint first
ALTER TABLE tours DROP CONSTRAINT IF EXISTS tours_status_check;

-- Add the updated constraint with new status values
ALTER TABLE tours ADD CONSTRAINT tours_status_check 
CHECK (status IN ('active', 'sold_out', 'cancelled', 'completed', 'paused', 'hidden'));

-- Add comment explaining the status options
COMMENT ON COLUMN tours.status IS 'Individual tour status: active (available), sold_out (full capacity), cancelled (not happening), completed (finished), paused (temporarily unavailable), hidden (not visible to customers)';

-- Verify constraint works
DO $$
DECLARE
  test_tour_id UUID;
BEGIN
  -- Find one active tour to test with
  SELECT id INTO test_tour_id FROM tours WHERE status = 'active' LIMIT 1;
  
  IF test_tour_id IS NOT NULL THEN
    -- Test that we can use the new status values
    UPDATE tours SET status = 'paused' WHERE id = test_tour_id;
    UPDATE tours SET status = 'active' WHERE id = test_tour_id;
  END IF;
  
  RAISE NOTICE 'Individual tour status constraint updated successfully - paused and hidden now available';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update tour status constraint: %', SQLERRM;
END $$;