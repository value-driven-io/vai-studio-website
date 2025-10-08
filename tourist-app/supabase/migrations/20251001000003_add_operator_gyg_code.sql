-- Migration: Add Operator-Specific GYG Code for Scalable Product IDs
-- Created: 2025-10-01
-- Purpose: Enable automatic product ID generation for 100+ operators
-- Reference: operator-dashboard/documentation/Channel Manager/GetYourGuide/SCALABLE_PRODUCT_ID_STRATEGY.md

-- ============================================================================
-- PART 1: ADD OPERATOR COLUMNS
-- ============================================================================

-- Add operator code column (unique identifier for each operator)
ALTER TABLE operators ADD COLUMN IF NOT EXISTS operator_code_gyg VARCHAR(8) UNIQUE;

-- Add sequence counter (for numbering templates per operator)
ALTER TABLE operators ADD COLUMN IF NOT EXISTS gyg_product_sequence INTEGER DEFAULT 0;

-- Create index for fast operator code lookups
CREATE INDEX IF NOT EXISTS idx_operators_gyg_code
  ON operators(operator_code_gyg)
  WHERE operator_code_gyg IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN operators.operator_code_gyg IS
  'Unique operator code for GetYourGuide product IDs (e.g., MOOADVC7). Auto-generated from company name + UUID suffix.';

COMMENT ON COLUMN operators.gyg_product_sequence IS
  'Sequence counter for GetYourGuide product IDs. Increments with each new template synced to GYG.';

-- ============================================================================
-- PART 2: OPERATOR CODE GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_operator_code(company_name TEXT, operator_id UUID)
RETURNS VARCHAR(8) AS $$
DECLARE
  clean_name TEXT;
  words TEXT[];
  code TEXT := '';
  uuid_suffix TEXT;
BEGIN
  -- Step 1: Clean company name (uppercase, remove special chars)
  clean_name := UPPER(REGEXP_REPLACE(company_name, '[^A-Z0-9\s]', '', 'g'));

  -- Step 2: Split into words
  words := REGEXP_SPLIT_TO_ARRAY(TRIM(clean_name), '\s+');

  -- Step 3: Generate base code from company name
  IF ARRAY_LENGTH(words, 1) >= 2 THEN
    -- Multi-word: First 3 chars of first 2 words
    -- "Moorea Adventures" → "MOOADV"
    code := SUBSTRING(words[1], 1, 3) || SUBSTRING(words[2], 1, 3);
  ELSE
    -- Single word: First 6 chars
    -- "Paradise" → "PARADI"
    code := SUBSTRING(clean_name, 1, 6);
  END IF;

  -- Step 4: Add uniqueness suffix (first 2 chars of UUID without dashes)
  -- UUID: c78f7f64-... → "C7"
  uuid_suffix := UPPER(SUBSTRING(REPLACE(operator_id::TEXT, '-', ''), 1, 2));

  -- Step 5: Combine (max 8 chars total)
  -- "MOOADV" + "C7" = "MOOADVC7"
  RETURN SUBSTRING(code || uuid_suffix, 1, 8);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_operator_code IS
  'Generates a unique 6-8 character operator code from company name and UUID. Used for GYG product ID generation.';

-- ============================================================================
-- PART 3: TOUR TYPE STANDARDIZATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION standardize_tour_type(input_type TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Normalize tour type to standard GYG-compatible format
  RETURN CASE
    WHEN input_type ILIKE '%whale%' THEN 'WHALE_WATCHING'
    WHEN input_type ILIKE '%snorkel%' THEN 'SNORKELING'
    WHEN input_type ILIKE '%div%' THEN 'DIVING'
    WHEN input_type ILIKE '%boat%' THEN 'BOAT_TOUR'
    WHEN input_type ILIKE '%lagoon%' THEN 'LAGOON_TOUR'
    WHEN input_type ILIKE '%kayak%' THEN 'KAYAKING'
    WHEN input_type ILIKE '%surf%' THEN 'SURFING'
    WHEN input_type ILIKE '%hik%' THEN 'HIKING'
    WHEN input_type ILIKE '%cultur%' THEN 'CULTURAL'
    WHEN input_type ILIKE '%cook%' THEN 'COOKING'
    WHEN input_type ILIKE '%4x4%' OR input_type ILIKE '%safari%' THEN 'SAFARI_4X4'
    WHEN input_type ILIKE '%helicopter%' THEN 'HELICOPTER'
    WHEN input_type ILIKE '%island%' THEN 'ISLAND_TOUR'
    ELSE 'EXPERIENCE'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION standardize_tour_type IS
  'Converts free-text tour types to standardized GYG-compatible format (e.g., "Whale Watching" → "WHALE_WATCHING").';

-- ============================================================================
-- PART 4: SEQUENCE INCREMENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_next_gyg_sequence(operator_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  -- Atomically increment and return next sequence number
  UPDATE operators
  SET gyg_product_sequence = gyg_product_sequence + 1
  WHERE id = operator_uuid
  RETURNING gyg_product_sequence INTO next_seq;

  RETURN COALESCE(next_seq, 1);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_gyg_sequence IS
  'Atomically increments and returns the next sequence number for an operator''s GYG products. Thread-safe.';

-- ============================================================================
-- PART 5: COMPLETE PRODUCT ID GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_gyg_product_id(template_uuid UUID)
RETURNS VARCHAR(100) AS $$
DECLARE
  operator_uuid UUID;
  operator_name TEXT;
  operator_code TEXT;
  tour_type_raw TEXT;
  tour_type_standard TEXT;
  location_raw TEXT;
  location_standard TEXT;
  sequence_num INTEGER;
  product_id TEXT;
BEGIN
  -- Step 1: Get template data
  SELECT
    operator_id,
    tour_type,
    location
  INTO
    operator_uuid,
    tour_type_raw,
    location_raw
  FROM tours
  WHERE id = template_uuid
    AND is_template = true;

  IF operator_uuid IS NULL THEN
    RAISE EXCEPTION 'Template not found or not a template: %', template_uuid;
  END IF;

  -- Step 2: Get or generate operator code
  SELECT
    COALESCE(
      operator_code_gyg,  -- Use existing if available
      generate_operator_code(company_name, id)  -- Otherwise generate
    ),
    company_name
  INTO operator_code, operator_name
  FROM operators
  WHERE id = operator_uuid;

  -- Step 3: Store operator code if it was just generated
  IF operator_code IS NULL THEN
    operator_code := generate_operator_code(operator_name, operator_uuid);
    UPDATE operators
    SET operator_code_gyg = operator_code
    WHERE id = operator_uuid;
  END IF;

  -- Step 4: Standardize tour type
  tour_type_standard := standardize_tour_type(tour_type_raw);

  -- Step 5: Standardize location (remove spaces, uppercase)
  location_standard := UPPER(REPLACE(COALESCE(location_raw, 'MULTI'), ' ', ''));

  -- Step 6: Get next sequence number for this operator
  sequence_num := get_next_gyg_sequence(operator_uuid);

  -- Step 7: Construct product ID
  -- Format: VAI_{OPERATOR_CODE}_{TOUR_TYPE}_{LOCATION}_{SEQUENCE}
  product_id := FORMAT(
    'VAI_%s_%s_%s_%s',
    operator_code,
    tour_type_standard,
    location_standard,
    LPAD(sequence_num::TEXT, 3, '0')
  );

  -- Step 8: Validate length (GetYourGuide max is 100 chars)
  IF LENGTH(product_id) > 100 THEN
    -- Truncate if somehow exceeds limit
    product_id := SUBSTRING(product_id, 1, 100);
  END IF;

  RETURN product_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_gyg_product_id IS
  'Generates a unique GetYourGuide product ID for a template. Format: VAI_{OPERATOR_CODE}_{TOUR_TYPE}_{LOCATION}_{SEQ}. Example: VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001';

-- ============================================================================
-- PART 6: AUTO-TRIGGER FOR NEW TEMPLATES
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_assign_gyg_product_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-generate for templates without existing GYG product ID
  IF NEW.is_template = true AND NEW.gyg_product_id IS NULL THEN
    NEW.gyg_product_id := generate_gyg_product_id(NEW.id);
    NEW.gyg_sync_status := 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS trigger_auto_gyg_product_id ON tours;

CREATE TRIGGER trigger_auto_gyg_product_id
  BEFORE INSERT ON tours
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_gyg_product_id();

COMMENT ON FUNCTION auto_assign_gyg_product_id IS
  'Trigger function that automatically generates GYG product ID when a new template is created.';

-- ============================================================================
-- PART 7: POPULATE EXISTING OPERATOR
-- ============================================================================

-- Generate operator code for the existing "Moorea Adventures" operator
UPDATE operators
SET operator_code_gyg = generate_operator_code(company_name, id)
WHERE id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9'
  AND operator_code_gyg IS NULL;

-- Note: Existing hardcoded product IDs in tours table are NOT regenerated
-- They will continue to work as-is
-- New templates will use the auto-generation system

-- ============================================================================
-- PART 8: ADD UNIQUE CONSTRAINT FOR PRODUCT IDs
-- ============================================================================

-- Ensure product IDs are unique across all templates
-- This prevents duplicate product IDs even if auto-generation has a bug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_gyg_product_id'
  ) THEN
    ALTER TABLE tours ADD CONSTRAINT uq_gyg_product_id
      UNIQUE (gyg_product_id);
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================================

-- 1. Verify operator code was generated
-- SELECT id, company_name, operator_code_gyg FROM operators;
-- Expected: operator_code_gyg populated for existing operator

-- 2. Test code generation
-- SELECT generate_operator_code('Bora Bora Eco Tours', 'a1b2c3d4-5678-90ab-cdef-123456789abc'::UUID);
-- Expected: Something like 'BORECO12'

-- 3. Test tour type standardization
-- SELECT standardize_tour_type('Whale Watching'), standardize_tour_type('Snorkeling Tour');
-- Expected: 'WHALE_WATCHING', 'SNORKELING'

-- 4. Test full product ID generation (for existing template)
-- SELECT generate_gyg_product_id('795569b4-1921-4943-976f-4bb48fd75f28'::UUID);
-- Expected: Something like 'VAI_MOOADVC7_WHALE_WATCHING_MOOREA_005'

-- 5. Test trigger by creating new template
-- INSERT INTO tours (tour_name, tour_type, location, is_template, operator_id)
-- VALUES ('Test Sunset Cruise', 'Boat Tour', 'Moorea', true, 'c78f7f64-cab8-4f48-9427-de87e12ec2b9');
-- Then: SELECT gyg_product_id FROM tours WHERE tour_name = 'Test Sunset Cruise';
-- Expected: Auto-generated product ID like 'VAI_MOOADVC7_BOAT_TOUR_MOOREA_006'
