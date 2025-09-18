-- Migration: Add operator_logo field to operators table
-- Date: 2025-09-17
-- Purpose: Add logo upload support for operators to personalize their profile and brand representation in tourist app

-- Add operator_logo field to operators table (safe: nullable field, no defaults)
ALTER TABLE operators
ADD COLUMN operator_logo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN operators.operator_logo IS 'Supabase Storage path/URL to operator logo image. Uploaded by operators, displayed in tourist app templates and tour cards. Format: bucket-name/path/logo.jpg or full Storage URL. Falls back to tour type emoji if not provided.';

-- Update any views that select from operators (if they exist and need the logo field)
-- Note: Most views should automatically include new fields, but check if specific views exist

-- Ensure RLS policies include the new field (inherit from operators table RLS)
-- No additional RLS policies needed as the field inherits from operators table policies

-- Index for performance (optional, for faster logo lookups)
CREATE INDEX IF NOT EXISTS idx_operators_logo ON operators(operator_logo)
WHERE operator_logo IS NOT NULL;