-- HOTFIX: Remove NOT NULL constraint from schedules.tour_id
-- This is needed to fix the template-first schedule creation

-- Remove the NOT NULL constraint from tour_id column
ALTER TABLE schedules ALTER COLUMN tour_id DROP NOT NULL;

-- Verification query - this should show NULL for tour_id is now allowed
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND column_name IN ('tour_id', 'template_id');