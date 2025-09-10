-- Script to mark all migrations in the operator-dashboard/supabase/migrations folder as applied
-- Run this script in your Supabase SQL editor to update the migration history

-- First, let's check the structure of the schema_migrations table
-- Uncomment and run this line first to see the table structure:
-- SELECT * FROM information_schema.columns WHERE table_name = 'schema_migrations' AND table_schema = 'supabase_migrations';

-- Insert migration records into the schema_migrations table
-- This tells Supabase that these migrations have already been applied
-- Using only the version column since inserted_at doesn't exist

INSERT INTO supabase_migrations.schema_migrations (version) VALUES
('20250802123841'),
('20250804035313'),
('20250817191903'),
('20250825120000'),
('20250826000001'),
('20250906000001'),
('20250907000001'),
('20250907000002'),
('20250909000002'),
('20250909000003'),
('20250909114200'),
('20250909114800')
ON CONFLICT (version) DO NOTHING;

-- Verify the migrations are now marked as applied
SELECT * 
FROM supabase_migrations.schema_migrations 
ORDER BY version;