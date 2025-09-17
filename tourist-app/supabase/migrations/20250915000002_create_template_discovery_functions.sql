-- =====================================================
-- MIGRATION: Template Discovery Functions
-- File: 20250915000002_create_template_discovery_functions.sql
-- Purpose: Create PostgreSQL functions for template-first discovery
-- Date: September 15, 2025
-- =====================================================

-- Drop existing functions if they exist (required for return type changes)
DROP FUNCTION IF EXISTS get_template_discovery(TEXT, TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_template_schedule_overview(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_template_statistics(UUID);

-- Function 1: Get Template Discovery Data
-- This aggregates template information with availability and pricing
CREATE OR REPLACE FUNCTION get_template_discovery(
  filter_island TEXT DEFAULT NULL,
  filter_tour_type TEXT DEFAULT NULL,
  filter_min_price INTEGER DEFAULT NULL,
  filter_max_price INTEGER DEFAULT NULL,
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  template_id UUID,
  template_name VARCHAR,
  template_type VARCHAR,
  template_description TEXT,
  operator_id UUID,
  company_name VARCHAR,
  operator_island VARCHAR,
  operator_bio TEXT,
  average_rating NUMERIC,
  total_tours_completed INTEGER,
  price_from INTEGER,
  min_promo_price INTEGER,
  has_promotional_pricing BOOLEAN,
  next_available_date DATE,
  next_available_time VARCHAR,
  schedule_count INTEGER,
  total_available_spots INTEGER,
  recurrence_patterns TEXT[],
  languages VARCHAR[],
  duration_hours NUMERIC,
  equipment_included BOOLEAN,
  food_included BOOLEAN,
  drinks_included BOOLEAN,
  whale_regulation_compliant BOOLEAN,
  fitness_level VARCHAR,
  pickup_available BOOLEAN,
  weather_dependent BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (template.id)
    template.id as template_id,
    template.tour_name as template_name,
    template.tour_type as template_type,
    template.description as template_description,
    template.operator_id,
    o.company_name,
    o.island as operator_island,
    o.business_description as operator_bio,
    o.average_rating,
    o.total_tours_completed,

    -- Pricing aggregation - use direct fields from tours table
    MIN(COALESCE((t.overrides->>'discount_price_adult')::INTEGER, t.discount_price_adult))::INTEGER as price_from,
    MIN(CASE
      WHEN t.promo_discount_percent IS NOT NULL THEN
        ROUND(t.discount_price_adult * (1 - t.promo_discount_percent::NUMERIC / 100))::INTEGER
      WHEN t.promo_discount_value IS NOT NULL THEN
        (t.discount_price_adult - t.promo_discount_value)::INTEGER
      ELSE NULL
    END) as min_promo_price,
    BOOL_OR(t.promo_discount_percent IS NOT NULL OR t.promo_discount_value IS NOT NULL) as has_promotional_pricing,

    -- Next availability
    MIN(t.tour_date) FILTER (WHERE t.tour_date >= CURRENT_DATE) as next_available_date,
    (array_agg(t.time_slot ORDER BY t.tour_date, t.time_slot))[1] as next_available_time,

    -- Schedule information
    COUNT(DISTINCT s.id)::INTEGER as schedule_count,
    SUM(COALESCE((t.overrides->>'available_spots')::INTEGER, t.available_spots))::INTEGER as total_available_spots,
    array_agg(DISTINCT s.recurrence_type) FILTER (WHERE s.recurrence_type IS NOT NULL) as recurrence_patterns,

    -- Template features (use most common values from instances)
    (SELECT t2.languages FROM tours t2 WHERE t2.parent_template_id = template.id AND t2.is_template = false AND t2.languages IS NOT NULL ORDER BY t2.created_at DESC LIMIT 1) as languages,
    (array_agg(t.duration_hours ORDER BY t.created_at DESC NULLS LAST))[1] as duration_hours,
    BOOL_OR(t.equipment_included) as equipment_included,
    BOOL_OR(t.food_included) as food_included,
    BOOL_OR(t.drinks_included) as drinks_included,
    BOOL_OR(t.whale_regulation_compliant) as whale_regulation_compliant,
    (array_agg(t.fitness_level ORDER BY t.created_at DESC NULLS LAST))[1] as fitness_level,
    BOOL_OR(t.pickup_available) as pickup_available,
    BOOL_OR(t.weather_dependent) as weather_dependent

  FROM tours template
  JOIN tours t ON t.parent_template_id = template.id
  LEFT JOIN schedules s ON t.parent_schedule_id = s.id
  JOIN operators o ON template.operator_id = o.id

  WHERE template.is_template = true
    AND t.is_template = false
    AND t.status = 'active'
    AND t.tour_date >= CURRENT_DATE
    AND COALESCE((t.overrides->>'available_spots')::INTEGER, t.available_spots) > 0
    AND (s.is_paused = false OR s.is_paused IS NULL OR t.is_detached = true)
    AND o.status = 'active'
    AND (filter_island IS NULL OR template.location = filter_island)
    AND (filter_tour_type IS NULL OR template.tour_type = filter_tour_type)

  GROUP BY template.id, template.tour_name, template.tour_type, template.description,
           template.operator_id, o.company_name, o.island, o.business_description,
           o.average_rating, o.total_tours_completed

  HAVING (filter_min_price IS NULL OR MIN(COALESCE((t.overrides->>'discount_price_adult')::INTEGER, t.discount_price_adult)) >= filter_min_price)
     AND (filter_max_price IS NULL OR MIN(COALESCE((t.overrides->>'discount_price_adult')::INTEGER, t.discount_price_adult)) <= filter_max_price)

  ORDER BY template.id, MIN(t.tour_date) ASC, o.average_rating DESC NULLS LAST
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get Template Schedule Overview
-- This shows availability calendar for a specific template
CREATE OR REPLACE FUNCTION get_template_schedule_overview(
  template_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  tour_id UUID,
  tour_date DATE,
  time_slot VARCHAR,
  duration_hours NUMERIC,
  available_spots INTEGER,
  max_capacity INTEGER,
  effective_price_adult INTEGER,
  final_price_adult INTEGER,
  has_promotional_pricing BOOLEAN,
  promotional_discount_amount INTEGER,
  meeting_point VARCHAR,
  is_customized BOOLEAN,
  instance_note TEXT,
  booking_deadline TIMESTAMP WITH TIME ZONE,
  weather_dependent BOOLEAN,
  current_bookings INTEGER,
  popularity_status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as tour_id,
    t.tour_date,
    t.time_slot,
    t.duration_hours,
    COALESCE((t.overrides->>'available_spots')::INTEGER, t.available_spots) as available_spots,
    COALESCE((t.overrides->>'max_capacity')::INTEGER, t.max_capacity) as max_capacity,
    COALESCE((t.overrides->>'discount_price_adult')::INTEGER, t.discount_price_adult) as effective_price_adult,
    CASE
      WHEN t.promo_discount_percent IS NOT NULL THEN
        ROUND(t.discount_price_adult * (1 - t.promo_discount_percent::NUMERIC / 100))::INTEGER
      WHEN t.promo_discount_value IS NOT NULL THEN
        (t.discount_price_adult - t.promo_discount_value)::INTEGER
      ELSE t.discount_price_adult
    END as final_price_adult,
    (t.promo_discount_percent IS NOT NULL OR t.promo_discount_value IS NOT NULL) as has_promotional_pricing,
    COALESCE(t.promo_discount_value,
      CASE
        WHEN t.promo_discount_percent IS NOT NULL THEN
          ROUND(t.discount_price_adult * t.promo_discount_percent::NUMERIC / 100)::INTEGER
        ELSE 0
      END
    ) as promotional_discount_amount,
    COALESCE((t.overrides->>'meeting_point')::VARCHAR, t.meeting_point) as meeting_point,
    t.is_customized,
    t.instance_note,
    t.booking_deadline,
    t.weather_dependent,

    -- Current bookings count (assuming bookings table exists)
    COALESCE(b.booking_count, 0)::INTEGER as current_bookings,

    -- Popularity status
    CASE
      WHEN COALESCE(b.booking_count, 0) >= COALESCE((t.overrides->>'max_capacity')::INTEGER, t.max_capacity) * 0.7 THEN 'popular'
      WHEN COALESCE(b.booking_count, 0) >= COALESCE((t.overrides->>'max_capacity')::INTEGER, t.max_capacity) * 0.4 THEN 'moderate'
      ELSE 'available'
    END as popularity_status

  FROM tours t
  LEFT JOIN (
    SELECT
      tour_id,
      COUNT(*)::INTEGER as booking_count
    FROM bookings
    WHERE booking_status IN ('confirmed', 'pending')
    GROUP BY tour_id
  ) b ON t.id = b.tour_id

  WHERE t.parent_template_id = get_template_schedule_overview.template_id
    AND t.is_template = false
    AND t.status = 'active'
    AND t.tour_date BETWEEN get_template_schedule_overview.start_date AND get_template_schedule_overview.end_date
    AND COALESCE((t.overrides->>'available_spots')::INTEGER, t.available_spots) > 0

  ORDER BY t.tour_date ASC, t.time_slot ASC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get Template Statistics
-- This provides aggregated stats for templates
CREATE OR REPLACE FUNCTION get_template_statistics(
  filter_template_id UUID DEFAULT NULL
)
RETURNS TABLE (
  template_id UUID,
  template_name VARCHAR,
  total_instances INTEGER,
  active_instances INTEGER,
  total_bookings INTEGER,
  total_revenue BIGINT,
  average_rating NUMERIC,
  most_popular_time VARCHAR,
  next_available_date DATE,
  availability_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    template.id as template_id,
    template.tour_name as template_name,
    COUNT(t.id)::INTEGER as total_instances,
    COUNT(t.id) FILTER (WHERE t.status = 'active' AND t.tour_date >= CURRENT_DATE)::INTEGER as active_instances,
    COALESCE(SUM(b.booking_count), 0)::INTEGER as total_bookings,
    COALESCE(SUM(b.total_revenue), 0)::BIGINT as total_revenue,

    -- Average rating from operator
    o.average_rating,

    -- Most popular time slot
    (
      SELECT time_slot
      FROM tours ti
      WHERE ti.parent_template_id = template.id
        AND ti.is_template = false
      GROUP BY time_slot
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_popular_time,

    -- Next available date
    MIN(t.tour_date) FILTER (WHERE t.tour_date >= CURRENT_DATE AND t.status = 'active') as next_available_date,

    -- Availability percentage
    CASE
      WHEN COUNT(t.id) FILTER (WHERE t.tour_date >= CURRENT_DATE) > 0 THEN
        (COUNT(t.id) FILTER (WHERE t.effective_available_spots > 0 AND t.tour_date >= CURRENT_DATE)::NUMERIC /
         COUNT(t.id) FILTER (WHERE t.tour_date >= CURRENT_DATE)::NUMERIC) * 100
      ELSE 0
    END as availability_percentage

  FROM tours template
  LEFT JOIN active_tours_with_operators t ON t.parent_template_id = template.id AND t.is_template = false
  LEFT JOIN operators o ON template.operator_id = o.id
  LEFT JOIN (
    SELECT
      tour_id,
      COUNT(*)::INTEGER as booking_count,
      SUM(total_amount)::BIGINT as total_revenue
    FROM bookings
    WHERE booking_status IN ('confirmed', 'completed')
    GROUP BY tour_id
  ) b ON t.id = b.tour_id

  WHERE template.is_template = true
    AND (filter_template_id IS NULL OR template.id = filter_template_id)

  GROUP BY template.id, template.tour_name, o.average_rating

  ORDER BY total_bookings DESC NULLS LAST, template.tour_name ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE INDEXES for Template Functions
-- =====================================================

-- Index for template discovery performance
CREATE INDEX IF NOT EXISTS idx_tours_template_discovery
ON tours USING btree (parent_template_id, is_template, status, tour_date)
WHERE is_template = false AND status = 'active';

-- Index for schedule overview performance
CREATE INDEX IF NOT EXISTS idx_tours_schedule_overview
ON tours USING btree (parent_template_id, tour_date, time_slot)
WHERE is_template = false AND status = 'active';

-- Index for template statistics
CREATE INDEX IF NOT EXISTS idx_tours_template_stats
ON tours USING btree (parent_template_id, status, tour_date, is_template);

-- =====================================================
-- TESTING QUERIES
-- =====================================================

-- Test template discovery (uncomment to test)
-- SELECT * FROM get_template_discovery() LIMIT 5;

-- Test template schedule overview (uncomment to test with real template_id)
-- SELECT * FROM get_template_schedule_overview(
--   'YOUR_TEMPLATE_ID_HERE'::UUID,
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '30 days'
-- );

-- Test template statistics (uncomment to test)
-- SELECT * FROM get_template_statistics() LIMIT 5;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

/*
WHAT THIS MIGRATION ADDS:

1. get_template_discovery():
   - Aggregates template data with pricing, availability, and schedule info
   - Supports filtering by island, tour type, and price range
   - Returns template-focused data for discovery interface

2. get_template_schedule_overview():
   - Shows calendar-style availability for specific template
   - Includes pricing, customizations, and booking popularity
   - Used for template detail/booking flow

3. get_template_statistics():
   - Provides analytics data for templates
   - Booking counts, revenue, ratings, availability metrics
   - Used for operator insights and recommendations

PERFORMANCE OPTIMIZATIONS:
- Strategic indexes on common query patterns
- Efficient aggregation using FILTER clauses
- Proper JOIN strategies for large datasets

DEPLOYMENT STEPS:
1. Save this file as supabase/migrations/20250915000002_create_template_discovery_functions.sql
2. Run SQL commands manually in Supabase dashboard
3. Test functions with sample queries
4. Verify performance with realistic data volumes
*/