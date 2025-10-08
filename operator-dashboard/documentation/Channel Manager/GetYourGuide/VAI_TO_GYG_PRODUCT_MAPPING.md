# VAI Studio → GetYourGuide Product Mapping

## Overview
This document maps VAI Studio tours (from the `tours` table) to GetYourGuide product format for channel integration.

## Product ID Strategy

### Internal (VAI Studio)
- **Format**: UUID (e.g., `11467963-8274-4f65-8d73-082eace391ee`)
- **Source**: `tours.id` (for activity instances) or `tours.parent_template_id` (for templates)
- **Type**: Database primary key

### External (GetYourGuide)
- **Format**: Human-readable string (e.g., `VAI_WHALE_WATCHING_MOOREA_001`)
- **Source**: Generated from tour metadata
- **Type**: `externalProductId` in GetYourGuide API

### Mapping Formula
```
GYG_PRODUCT_ID = "VAI_" + TOUR_TYPE + "_" + LOCATION + "_" + SEQUENCE_NUMBER
```

Example:
- **Tour**: "Dance with the Whales" (Moorea)
- **GYG Product ID**: `VAI_WHALE_WATCHING_MOOREA_001`
- **VAI Tour ID**: `795569b4-1921-4943-976f-4bb48fd75f28` (template)

## Current Active Products (Templates)

Based on the database export from 2025-10-01:

| GYG Product ID | VAI Template ID | Tour Name | Type | Location | Status |
|---|---|---|---|---|---|
| `VAI_WHALE_WATCHING_MOOREA_001` | `795569b4-1921-4943-976f-4bb48fd75f28` | Dance with the Whales | Whale Watching | Moorea | Active ✅ |
| `VAI_DIVING_TAHITI_001` | `db896f3d-da54-4304-bdf4-9a8499c2a7de` | Dive with the Turtles | Diving | Tahiti | Active ✅ |
| `VAI_COOKING_TAHITI_001` | `b8ce19ea-4361-4077-b5de-c63324e56e6a` | Traditional Cooking Workshop | Culinary Experience | Tahiti | Active ✅ |
| `VAI_LAGOON_TOUR_MOOREA_001` | `e8fd6a14-953f-4f92-b64c-632fa4df6a01` | Sunset Lagoon Tour | Lagoon Tour | Moorea | Active ✅ |
| `VAI_COOKING_MOOREA_002` | `23cc411c-597b-4126-ab9a-b75e27ee559f` | Cooking Workshop - Traditional Food | Culinary Experience | Moorea | Cancelled ❌ |

## GetYourGuide Product Configuration

### Product Type Mapping

| VAI Tour Type | GetYourGuide Product Type | Time Configuration |
|---|---|---|
| Whale Watching | Time point for Individuals | Fixed start times (e.g., 07:00) |
| Diving | Time point for Individuals | Fixed start times (e.g., 12:00) |
| Culinary Experience | Time point for Groups | Fixed start times (e.g., 10:00) |
| Lagoon Tour | Time point for Individuals | Fixed start times (e.g., 16:30) |
| Snorkeling | Time point for Individuals | Fixed start times |
| Hike | Time point for Groups | Fixed start times |

### Example: "Dance with the Whales"

**VAI Studio Data** (Template `795569b4-1921-4943-976f-4bb48fd75f28`):
```json
{
  "tour_name": "Dance with the Whales",
  "tour_type": "Whale Watching",
  "location": "Moorea",
  "duration_hours": 4.5,
  "max_capacity": 14,
  "discount_price_adult": 21000,
  "discount_price_child": 14700,
  "time_slot": null,
  "is_template": true
}
```

**GetYourGuide Format** (`VAI_WHALE_WATCHING_MOOREA_001`):
```json
{
  "data": {
    "externalProductId": "VAI_WHALE_WATCHING_MOOREA_001",
    "productName": "Dance with the Whales - Moorea",
    "productType": "TIME_POINT_FOR_INDIVIDUALS",
    "currency": "USD",
    "defaultPrices": {
      "retailPrices": [
        {
          "category": "ADULT",
          "price": 21000
        },
        {
          "category": "CHILD",
          "price": 14700
        }
      ]
    },
    "duration": {
      "value": 4.5,
      "unit": "HOURS"
    },
    "maxCapacity": 14,
    "location": {
      "city": "Moorea",
      "country": "PF"
    }
  }
}
```

## Availability Sync Mapping

### Scheduled Instances → Time Slots

Each **scheduled tour instance** becomes an **availability time slot** in GetYourGuide:

**VAI Studio Instance** (ID: `11467963-8274-4f65-8d73-082eace391ee`):
```json
{
  "parent_template_id": "795569b4-1921-4943-976f-4bb48fd75f28",
  "tour_date": "2025-09-27",
  "time_slot": "07:00",
  "available_spots": 8,
  "status": "active"
}
```

**GetYourGuide Availability Update**:
```json
{
  "data": {
    "productId": "VAI_WHALE_WATCHING_MOOREA_001",
    "availabilities": [
      {
        "dateTime": "2025-09-27T07:00:00-10:00",
        "vacancies": 8
      }
    ]
  }
}
```

### Timezone Handling

**VAI Studio**: Stores date + time_slot separately
- `tour_date`: `2025-09-27` (date only)
- `time_slot`: `07:00` (time only, local)
- **Implied Timezone**: Pacific/Tahiti (UTC-10)

**GetYourGuide**: Requires ISO 8601 with timezone
- `dateTime`: `2025-09-27T07:00:00-10:00`
- **Conversion**: Combine date + time_slot + timezone offset

## Price Conversion

### XPF → USD Conversion

**Challenge**: VAI Studio stores prices in XPF (Pacific Franc), GetYourGuide expects USD cents.

**Conversion Formula**:
```javascript
// XPF to USD conversion (approximate rate: 1 USD = 100 XPF)
function xpfToUsdCents(xpfPrice) {
  const usdDollars = xpfPrice / 100;  // 21000 XPF = 210 USD
  const usdCents = Math.round(usdDollars * 100);  // 210 USD = 21000 cents
  return usdCents;
}
```

**Example**:
- **VAI Price**: 21,000 XPF (adult)
- **USD Equivalent**: $210 USD
- **GetYourGuide Format**: 21000 cents

**Note**: GetYourGuide's "price" field uses smallest currency unit:
- EUR: 1500 = €15.00
- USD: 21000 = $210.00
- XPF: We convert to USD first

### Price Examples

| VAI Studio (XPF) | USD Equivalent | GetYourGuide (cents) |
|---|---|---|
| 21,000 XPF | $210.00 | 21000 |
| 14,700 XPF | $147.00 | 14700 |
| 26,000 XPF | $260.00 | 26000 |
| 18,000 XPF | $180.00 | 18000 |

## Database Schema Additions Needed

To support bidirectional product mapping, add these fields to the `tours` table:

```sql
-- Add GetYourGuide product tracking fields
ALTER TABLE tours ADD COLUMN gyg_product_id VARCHAR(100);
ALTER TABLE tours ADD COLUMN gyg_option_id INTEGER;
ALTER TABLE tours ADD COLUMN gyg_sync_status VARCHAR(50) DEFAULT 'not_synced';
ALTER TABLE tours ADD COLUMN gyg_last_sync TIMESTAMP WITH TIME ZONE;

-- Create index for product lookups
CREATE INDEX idx_tours_gyg_product_id ON tours(gyg_product_id);

-- Add comments
COMMENT ON COLUMN tours.gyg_product_id IS 'GetYourGuide external product ID (e.g., VAI_WHALE_WATCHING_MOOREA_001)';
COMMENT ON COLUMN tours.gyg_option_id IS 'GetYourGuide internal option ID (assigned by GYG after product creation)';
COMMENT ON COLUMN tours.gyg_sync_status IS 'Sync status: not_synced, pending, synced, error';
COMMENT ON COLUMN tours.gyg_last_sync IS 'Last successful sync timestamp';
```

## Self-Testing Tool Configuration

### For the GetYourGuide Integrator Portal

Use these values when filling out the self-testing tool form:

**Valid product ID**: `VAI_WHALE_WATCHING_MOOREA_001`

**Time available**: At fixed starting times (Time point) ✅

**Price setup**: Price per individual

**Configure**: Availability and price

**Product timezone**: Pacific/Tahiti (GMT-10)

**Dates product IS available**:
- From: `2025-09-26`
- To: `2025-10-10`

**Sample availability data**:
```json
{
  "data": {
    "productId": "VAI_WHALE_WATCHING_MOOREA_001",
    "availabilities": [
      {
        "dateTime": "2025-09-27T07:00:00-10:00",
        "vacancies": 8,
        "currency": "USD",
        "pricesByCategory": {
          "retailPrices": [
            {
              "category": "ADULT",
              "price": 21000
            },
            {
              "category": "CHILD",
              "price": 14700
            }
          ]
        }
      }
    ]
  }
}
```

## n8n Workflow Enhancements Needed

### 1. Product ID Lookup Function

Add to n8n workflow to convert between VAI UUID ↔ GYG Product ID:

```javascript
// Convert VAI template UUID to GYG Product ID
function getGygProductId(vaiTemplateId) {
  const productMap = {
    '795569b4-1921-4943-976f-4bb48fd75f28': 'VAI_WHALE_WATCHING_MOOREA_001',
    'db896f3d-da54-4304-bdf4-9a8499c2a7de': 'VAI_DIVING_TAHITI_001',
    'b8ce19ea-4361-4077-b5de-c63324e56e6a': 'VAI_COOKING_TAHITI_001',
    'e8fd6a14-953f-4f92-b64c-632fa4df6a01': 'VAI_LAGOON_TOUR_MOOREA_001'
  };

  return productMap[vaiTemplateId] || null;
}

// Convert GYG Product ID to VAI template UUID
function getVaiTemplateId(gygProductId) {
  const reverseMap = {
    'VAI_WHALE_WATCHING_MOOREA_001': '795569b4-1921-4943-976f-4bb48fd75f28',
    'VAI_DIVING_TAHITI_001': 'db896f3d-da54-4304-bdf4-9a8499c2a7de',
    'VAI_COOKING_TAHITI_001': 'b8ce19ea-4361-4077-b5de-c63324e56e6a',
    'VAI_LAGOON_TOUR_MOOREA_001': 'e8fd6a14-953f-4f92-b64c-632fa4df6a01'
  };

  return reverseMap[gygProductId] || null;
}
```

### 2. Timezone Conversion

```javascript
// Convert VAI tour_date + time_slot to GetYourGuide ISO 8601
function toGygDateTime(tourDate, timeSlot) {
  // tourDate: "2025-09-27", timeSlot: "07:00"
  const tahitiOffset = "-10:00";  // Pacific/Tahiti is UTC-10
  return `${tourDate}T${timeSlot}:00${tahitiOffset}`;
}

// Example:
// toGygDateTime("2025-09-27", "07:00")
// Returns: "2025-09-27T07:00:00-10:00"
```

### 3. Price Conversion

```javascript
// Convert XPF to USD cents for GetYourGuide
function xpfToUsdCents(xpfPrice) {
  const exchangeRate = 100;  // Approximate: 100 XPF = 1 USD
  const usdDollars = xpfPrice / exchangeRate;
  return Math.round(usdDollars * 100);  // Convert to cents
}

// Examples:
// xpfToUsdCents(21000) → 21000 cents ($210.00)
// xpfToUsdCents(14700) → 14700 cents ($147.00)
```

## Testing Checklist

### Phase 1: Product Mapping ✅
- [x] Create product ID mapping document
- [ ] Add `gyg_product_id` field to database
- [ ] Update n8n workflows with product lookup functions
- [ ] Test product ID conversion both ways

### Phase 2: Availability Sync Format
- [ ] Verify timezone conversion works correctly
- [ ] Test price conversion XPF → USD
- [ ] Ensure date/time format matches GetYourGuide spec
- [ ] Validate JSON structure against API schema

### Phase 3: Self-Testing Tool
- [ ] Configure product in GetYourGuide portal
- [ ] Run availability tests (0 spots, available, high demand)
- [ ] Run pricing tests (with/without prices)
- [ ] Verify all tests show "Completed" status

### Phase 4: Production Deployment
- [ ] Sync all active templates to GetYourGuide
- [ ] Enable real-time availability sync
- [ ] Monitor webhook logs for errors
- [ ] Test end-to-end booking flow

---

**Last Updated**: 2025-10-01
**Status**: Product mapping defined, database updates needed
**Next Steps**: Add database fields, update n8n workflows, retest self-testing tool
