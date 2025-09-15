-- Test with your actual tour ID that exists in the database

-- 1. First, verify the tour exists and show its current state
SELECT 
    id, 
    tour_name, 
    is_template, 
    is_customized, 
    discount_price_adult, 
    promo_discount_percent, 
    promo_discount_value
FROM tours 
WHERE id = '80e9336d-5fa9-4577-bbff-104f2b2c359c';

-- 2. Test the function with your actual tour ID
-- This simulates changing price without promo discount (the failing scenario)
SELECT * FROM apply_tour_customization(
  '80e9336d-5fa9-4577-bbff-104f2b2c359c'::UUID,
  '{"discount_price_adult": "11000"}'::JSONB,
  NULL::TEXT[]
);

-- 3. If that works, test clearing a promo discount (another failing scenario)
SELECT * FROM apply_tour_customization(
  '80e9336d-5fa9-4577-bbff-104f2b2c359c'::UUID,
  '{"promo_discount_percent": null, "promo_discount_value": null}'::JSONB,
  NULL::TEXT[]
);