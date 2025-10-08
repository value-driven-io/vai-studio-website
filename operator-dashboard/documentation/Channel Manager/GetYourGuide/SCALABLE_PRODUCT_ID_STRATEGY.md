# Scalable Product ID Strategy for Multi-Operator Channel Manager

**Created**: October 1, 2025
**Purpose**: Design automatic product ID generation for 100+ operators
**Current Issue**: Hardcoded IDs don't scale (`VAI_WHALE_WATCHING_MOOREA_001`)

---

## 🚨 THE SCALABILITY PROBLEM

### Current Approach (Hardcoded)
```sql
-- Works for 1 operator with 4 templates ✅
UPDATE tours SET gyg_product_id = 'VAI_WHALE_WATCHING_MOOREA_001'
WHERE id = '795569b4-...';

-- FAILS for 100 operators ❌
-- What if 50 operators offer whale watching in Moorea?
-- Manual mapping becomes impossible
```

### Scaling Challenge

**Scenario**:
- 100 operators
- Each has 5-10 templates
- Total: 500-1,000 product IDs
- Multiple operators offer same activity type in same location

**Conflict Example**:
```
Operator A: "Moorea Adventures" → VAI_WHALE_WATCHING_MOOREA_001 ✅
Operator B: "Moorea Eco Tours"  → VAI_WHALE_WATCHING_MOOREA_001 ❌ DUPLICATE!
```

---

## ✅ SOLUTION: Operator-Scoped Auto-Generated IDs

### Product ID Format

```
{PLATFORM}_{OPERATOR_CODE}_{TOUR_TYPE}_{LOCATION}_{SEQ}
```

**Components**:
1. **PLATFORM**: Always `VAI` (4 chars max)
2. **OPERATOR_CODE**: Unique operator identifier (6-8 chars)
3. **TOUR_TYPE**: Standardized activity type (max 20 chars)
4. **LOCATION**: Island name (max 15 chars)
5. **SEQ**: Sequential number per operator (3 digits)

**Example**:
```
VAI_MOOADV_WHALE_WATCHING_MOOREA_001
│   │      │                │      └── Sequence (001-999)
│   │      │                └────────── Location (MOOREA)
│   │      └─────────────────────────── Tour Type (WHALE_WATCHING)
│   └────────────────────────────────── Operator Code (MOOADV)
└────────────────────────────────────── Platform (VAI)
```

---

## 🏢 OPERATOR CODE GENERATION

### Strategy: Automatic from Company Name

**Algorithm**:
```javascript
function generateOperatorCode(companyName, operatorId) {
  // Step 1: Clean and normalize
  const clean = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special chars
    .trim()

  // Step 2: Extract initials or abbreviation
  const words = clean.split(/\s+/)

  let code = ''

  if (words.length >= 2) {
    // Multi-word: Take first 3 chars of each word
    code = words
      .slice(0, 2)
      .map(w => w.substring(0, 3))
      .join('')
      .substring(0, 6)
  } else {
    // Single word: Take first 6 chars
    code = clean.substring(0, 6)
  }

  // Step 3: Add uniqueness suffix (last 2 chars of UUID)
  const uniqueSuffix = operatorId.replace(/-/g, '').substring(0, 2).toUpperCase()

  return `${code}${uniqueSuffix}` // Max 8 chars
}
```

**Examples**:
| Company Name | Operator ID (last 2) | Generated Code |
|---|---|---|
| Moorea Adventures | c7 | `MOOADVC7` |
| Bora Bora Eco Tours | 3a | `BORECO3A` |
| Tahiti Whale Watching | f2 | `TAHWHAF2` |
| Island Paradise | 9b | `ISLAND9B` |
| Pacific Dreams LLC | d4 | `PACDRELD4` |

**Collision Handling**:
```sql
-- Check for duplicates
SELECT operator_code FROM operators WHERE operator_code = 'MOOADVC7';

-- If exists, append more UUID chars
-- 'MOOADVC7' → 'MOOADVC78F' (use 4 UUID chars instead of 2)
```

---

## 📦 TOUR TYPE STANDARDIZATION

### Mapping Activity Types to GYG Categories

**From Database** (`tour_type` column):
```javascript
const TOUR_TYPE_MAP = {
  // Water Activities
  'Whale Watching': 'WHALE_WATCHING',
  'Snorkeling': 'SNORKELING',
  'Diving': 'DIVING',
  'Boat Tour': 'BOAT_TOUR',
  'Lagoon Tour': 'LAGOON_TOUR',
  'Kayaking': 'KAYAKING',
  'Surfing': 'SURFING',

  // Land Activities
  'Hiking': 'HIKING',
  'Cultural Tour': 'CULTURAL',
  'Island Tour': 'ISLAND_TOUR',
  '4x4 Safari': 'SAFARI_4X4',

  // Culinary
  'Culinary Experience': 'COOKING',
  'Traditional Cooking': 'COOKING',

  // Special
  'Helicopter Tour': 'HELICOPTER',
  'Private Tour': 'PRIVATE',
  'Other': 'EXPERIENCE'
}
```

### Dynamic Mapping Function
```sql
CREATE OR REPLACE FUNCTION standardize_tour_type(input_type TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Normalize and map to standard format
  RETURN CASE
    WHEN input_type ILIKE '%whale%' THEN 'WHALE_WATCHING'
    WHEN input_type ILIKE '%snorkel%' THEN 'SNORKELING'
    WHEN input_type ILIKE '%div%' THEN 'DIVING'
    WHEN input_type ILIKE '%boat%' THEN 'BOAT_TOUR'
    WHEN input_type ILIKE '%lagoon%' THEN 'LAGOON_TOUR'
    WHEN input_type ILIKE '%kayak%' THEN 'KAYAKING'
    WHEN input_type ILIKE '%hik%' THEN 'HIKING'
    WHEN input_type ILIKE '%cultur%' THEN 'CULTURAL'
    WHEN input_type ILIKE '%cook%' THEN 'COOKING'
    WHEN input_type ILIKE '%4x4%' OR input_type ILIKE '%safari%' THEN 'SAFARI_4X4'
    WHEN input_type ILIKE '%helicopter%' THEN 'HELICOPTER'
    ELSE 'EXPERIENCE'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 🏝️ LOCATION STANDARDIZATION

### Island Name Mapping

**From Database** (`location` column):
```javascript
const LOCATION_MAP = {
  // Society Islands
  'Tahiti': 'TAHITI',
  'Moorea': 'MOOREA',
  'Bora Bora': 'BORABORA',
  'Huahine': 'HUAHINE',
  'Raiatea': 'RAIATEA',
  'Taha\'a': 'TAHAA',
  'Maupiti': 'MAUPITI',

  // Tuamotu
  'Rangiroa': 'RANGIROA',
  'Fakarava': 'FAKARAVA',
  'Tikehau': 'TIKEHAU',

  // Marquesas
  'Nuku Hiva': 'NUKUHIVA',

  // Generic
  'Other': 'MULTI',
  'Multiple Islands': 'MULTI'
}
```

---

## 🔢 SEQUENCE MANAGEMENT

### Per-Operator Counter

**Approach**: Each operator has their own sequence counter

**Database Addition**:
```sql
-- Add to operators table
ALTER TABLE operators ADD COLUMN gyg_product_sequence INTEGER DEFAULT 0;

-- Function to get next sequence
CREATE OR REPLACE FUNCTION get_next_gyg_sequence(operator_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  UPDATE operators
  SET gyg_product_sequence = gyg_product_sequence + 1
  WHERE id = operator_uuid
  RETURNING gyg_product_sequence INTO next_seq;

  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```sql
-- Operator A creates template
SELECT get_next_gyg_sequence('c78f7f64-cab8-4f48-9427-de87e12ec2b9');
-- Returns: 1 → VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001

-- Operator A creates another template
SELECT get_next_gyg_sequence('c78f7f64-cab8-4f48-9427-de87e12ec2b9');
-- Returns: 2 → VAI_MOOADVC7_DIVING_TAHITI_002

-- Operator B creates template (different counter)
SELECT get_next_gyg_sequence('a1b2c3d4-...');
-- Returns: 1 → VAI_BORECO3A_WHALE_WATCHING_MOOREA_001
```

---

## 🤖 COMPLETE AUTO-GENERATION FUNCTION

### SQL Implementation

```sql
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
    )
  INTO operator_code
  FROM operators
  WHERE id = operator_uuid;

  -- Step 3: Standardize tour type
  tour_type_standard := standardize_tour_type(tour_type_raw);

  -- Step 4: Standardize location
  location_standard := UPPER(REPLACE(location_raw, ' ', ''));

  -- Step 5: Get next sequence number
  sequence_num := get_next_gyg_sequence(operator_uuid);

  -- Step 6: Construct product ID
  product_id := FORMAT(
    'VAI_%s_%s_%s_%s',
    operator_code,
    tour_type_standard,
    location_standard,
    LPAD(sequence_num::TEXT, 3, '0')
  );

  -- Step 7: Validate length (GYG max is 100 chars)
  IF LENGTH(product_id) > 100 THEN
    -- Truncate if needed
    product_id := SUBSTRING(product_id, 1, 100);
  END IF;

  RETURN product_id;
END;
$$ LANGUAGE plpgsql;
```

### Helper: Generate Operator Code

```sql
CREATE OR REPLACE FUNCTION generate_operator_code(company_name TEXT, operator_id UUID)
RETURNS VARCHAR(8) AS $$
DECLARE
  clean_name TEXT;
  words TEXT[];
  code TEXT := '';
  uuid_suffix TEXT;
BEGIN
  -- Clean company name
  clean_name := UPPER(REGEXP_REPLACE(company_name, '[^A-Z0-9\s]', '', 'g'));
  words := REGEXP_SPLIT_TO_ARRAY(TRIM(clean_name), '\s+');

  -- Generate base code
  IF ARRAY_LENGTH(words, 1) >= 2 THEN
    -- Multi-word: First 3 chars of first 2 words
    code := SUBSTRING(words[1], 1, 3) || SUBSTRING(words[2], 1, 3);
  ELSE
    -- Single word: First 6 chars
    code := SUBSTRING(clean_name, 1, 6);
  END IF;

  -- Add uniqueness suffix (first 2 chars of UUID without dashes)
  uuid_suffix := UPPER(SUBSTRING(REPLACE(operator_id::TEXT, '-', ''), 1, 2));

  -- Combine (max 8 chars)
  RETURN SUBSTRING(code || uuid_suffix, 1, 8);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 📋 DATABASE SCHEMA UPDATES

### Migration: Add Operator Code Column

```sql
-- File: 20251001000003_add_operator_gyg_code.sql

-- Add operator code column
ALTER TABLE operators ADD COLUMN IF NOT EXISTS operator_code_gyg VARCHAR(8) UNIQUE;

-- Add sequence counter
ALTER TABLE operators ADD COLUMN IF NOT EXISTS gyg_product_sequence INTEGER DEFAULT 0;

-- Create index
CREATE INDEX IF NOT EXISTS idx_operators_gyg_code
  ON operators(operator_code_gyg)
  WHERE operator_code_gyg IS NOT NULL;

-- Populate for existing operator
UPDATE operators
SET operator_code_gyg = generate_operator_code(company_name, id)
WHERE operator_code_gyg IS NULL;

-- Add comment
COMMENT ON COLUMN operators.operator_code_gyg IS
  'Unique operator code for GetYourGuide product IDs (e.g., MOOADVC7). Auto-generated from company name.';

COMMENT ON COLUMN operators.gyg_product_sequence IS
  'Sequence counter for GetYourGuide product IDs. Increments with each new template synced.';
```

---

## 🔄 AUTO-TRIGGER ON TEMPLATE CREATION

### Automatic Product ID Assignment

```sql
CREATE OR REPLACE FUNCTION auto_assign_gyg_product_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for templates without existing GYG product ID
  IF NEW.is_template = true AND NEW.gyg_product_id IS NULL THEN
    NEW.gyg_product_id := generate_gyg_product_id(NEW.id);
    NEW.gyg_sync_status := 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_gyg_product_id
  BEFORE INSERT ON tours
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_gyg_product_id();
```

**How It Works**:
```sql
-- Operator creates template (manual)
INSERT INTO tours (tour_name, tour_type, location, is_template, operator_id)
VALUES ('Sunset Cruise', 'Boat Tour', 'Moorea', true, 'c78f7f64-...');

-- Trigger fires automatically ✨
-- Sets gyg_product_id = 'VAI_MOOADVC7_BOAT_TOUR_MOOREA_003'
-- Sets gyg_sync_status = 'pending'
```

---

## 📊 EXAMPLES: Multi-Operator Scaling

### Scenario: 3 Operators, Similar Activities

**Operator A: "Moorea Adventures"** (ID: c78f7f64...c7)
- Code: `MOOADVC7`
- Template 1: Whale Watching in Moorea
  - Product ID: `VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001`
- Template 2: Diving in Tahiti
  - Product ID: `VAI_MOOADVC7_DIVING_TAHITI_002`

**Operator B: "Bora Eco Tours"** (ID: a1b2c3d4...3a)
- Code: `BORECO3A`
- Template 1: Whale Watching in Moorea (same activity, different operator)
  - Product ID: `VAI_BORECO3A_WHALE_WATCHING_MOOREA_001` ✅ NO COLLISION
- Template 2: Lagoon Tour in Bora Bora
  - Product ID: `VAI_BORECO3A_LAGOON_TOUR_BORABORA_002`

**Operator C: "Tahiti Whale Watch"** (ID: f2e3d4c5...f2)
- Code: `TAHWHAF2`
- Template 1: Whale Watching in Moorea (same activity again)
  - Product ID: `VAI_TAHWHAF2_WHALE_WATCHING_MOOREA_001` ✅ NO COLLISION

### Visual: No Collisions

```
VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001 (Operator A)
    │        └── Unique operator code
    │
VAI_BORECO3A_WHALE_WATCHING_MOOREA_001 (Operator B)
    │        └── Different operator code
    │
VAI_TAHWHAF2_WHALE_WATCHING_MOOREA_001 (Operator C)
             └── Another unique code
```

---

## 🔍 LOOKUP & REVERSE MAPPING

### Query Examples

**Find all products for an operator**:
```sql
SELECT gyg_product_id, tour_name, tour_type, location
FROM tours
WHERE operator_id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9'
  AND is_template = true
  AND gyg_product_id IS NOT NULL;
```

**Find operator from product ID**:
```sql
-- Extract operator code from product ID
SELECT o.*
FROM operators o
WHERE o.operator_code_gyg = SPLIT_PART('VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001', '_', 2);
-- Returns: Moorea Adventures
```

**Check for duplicates** (should be impossible):
```sql
SELECT gyg_product_id, COUNT(*) as count
FROM tours
WHERE is_template = true
GROUP BY gyg_product_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows
```

---

## 🚀 MIGRATION PATH

### From Hardcoded to Auto-Generated

**Step 1: Add new columns** ✅ (already done)
```sql
-- In migration 20251001000003
ALTER TABLE operators ADD COLUMN operator_code_gyg VARCHAR(8);
ALTER TABLE operators ADD COLUMN gyg_product_sequence INTEGER DEFAULT 0;
```

**Step 2: Populate existing operator code**
```sql
-- Generate code for "Moorea Adventures"
UPDATE operators
SET operator_code_gyg = 'MOOADVC7'  -- Or use generate_operator_code()
WHERE id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9';
```

**Step 3: Regenerate product IDs** (optional - update existing)
```sql
-- Option A: Keep existing hardcoded IDs (they work)
-- No action needed

-- Option B: Regenerate for consistency
UPDATE tours
SET gyg_product_id = generate_gyg_product_id(id)
WHERE is_template = true
  AND operator_id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9';
```

**Step 4: Enable auto-trigger for new templates**
```sql
CREATE TRIGGER trigger_auto_gyg_product_id...
-- (see trigger code above)
```

---

## ✅ VALIDATION & TESTING

### Test Cases

**Test 1: Single Operator, Multiple Templates**
```sql
-- Moorea Adventures creates 5 templates
INSERT INTO tours (tour_name, tour_type, location, is_template, operator_id)
VALUES
  ('Whale Tour', 'Whale Watching', 'Moorea', true, 'c78f...'),
  ('Dive Adventure', 'Diving', 'Tahiti', true, 'c78f...'),
  ('Sunset Cruise', 'Boat Tour', 'Moorea', true, 'c78f...'),
  ('Lagoon Discovery', 'Lagoon Tour', 'Bora Bora', true, 'c78f...'),
  ('Island Hike', 'Hiking', 'Moorea', true, 'c78f...');

-- Expected Product IDs:
-- VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001
-- VAI_MOOADVC7_DIVING_TAHITI_002
-- VAI_MOOADVC7_BOAT_TOUR_MOOREA_003
-- VAI_MOOADVC7_LAGOON_TOUR_BORABORA_004
-- VAI_MOOADVC7_HIKING_MOOREA_005
```

**Test 2: Multiple Operators, Same Activity**
```sql
-- 3 different operators create whale watching tours
-- Each gets unique product ID due to operator code
```

**Test 3: Collision Detection**
```sql
-- Try to manually set duplicate product ID
UPDATE tours
SET gyg_product_id = 'VAI_MOOADVC7_WHALE_WATCHING_MOOREA_001'
WHERE id = 'different-template-uuid';

-- Should FAIL due to unique constraint (recommended)
ALTER TABLE tours ADD CONSTRAINT uq_gyg_product_id UNIQUE (gyg_product_id);
```

---

## 📈 SCALABILITY METRICS

### System Capacity

**Maximum Product IDs per Operator**:
- Sequence: 001-999 (3 digits)
- **999 templates per operator**

**Total System Capacity**:
- 100 operators × 999 templates = **99,900 unique product IDs**
- 1,000 operators × 999 templates = **999,000 unique product IDs**

**Operator Code Uniqueness**:
- 8 character alphanumeric code
- Possible combinations: 36^8 = **2.8 trillion**
- Even with 1 million operators, collision probability < 0.001%

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Database Schema ⏳
- [ ] Run migration `20251001000003_add_operator_gyg_code.sql`
- [ ] Verify `operator_code_gyg` column added
- [ ] Verify `gyg_product_sequence` column added
- [ ] Test `generate_operator_code()` function
- [ ] Test `generate_gyg_product_id()` function

### Phase 2: Auto-Generation ⏳
- [ ] Create trigger for auto-assignment
- [ ] Test with new template creation
- [ ] Verify sequence increments correctly
- [ ] Check for duplicate prevention

### Phase 3: Existing Data ⏳
- [ ] Generate operator code for current operator
- [ ] Decide: Keep hardcoded IDs or regenerate
- [ ] Update existing templates if regenerating
- [ ] Validate all product IDs are unique

### Phase 4: Integration ⏳
- [ ] Update n8n workflows to use new IDs
- [ ] Update GetYourGuide sync to handle auto-generated IDs
- [ ] Test self-testing tool with auto-generated IDs
- [ ] Document operator code in Channel Manager UI

---

## 📚 DOCUMENTATION UPDATES NEEDED

1. **Update `VAI_TO_GYG_PRODUCT_MAPPING.md`**:
   - Remove hardcoded mappings
   - Document auto-generation strategy
   - Add operator code examples

2. **Update `CHANNEL_MANAGER_IMPLEMENTATION_GUIDE.md`**:
   - Add scalability section
   - Document auto-generation functions
   - Update testing procedures

3. **Create Operator Guide**:
   - Explain how product IDs are generated
   - Show where to find their operator code
   - Describe sequence counter

---

**Strategy Status**: ✅ DESIGNED & READY FOR IMPLEMENTATION
**Next Steps**:
1. Create migration `20251001000003_add_operator_gyg_code.sql`
2. Test functions in staging
3. Deploy trigger for automatic assignment
4. Update existing operator with code
