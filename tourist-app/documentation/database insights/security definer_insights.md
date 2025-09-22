# RLS policies 
##   -- Get all RLS policies for tours table
  -- Get all RLS policies for tours table
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
  FROM pg_policies
  WHERE tablename = 'tours';

[
  {
    "schemaname": "public",
    "tablename": "tours",
    "policyname": "Operators manage their own tours",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "ALL",
    "qual": "(auth.uid() IN ( SELECT o.auth_user_id\n   FROM operators o\n  WHERE (o.id = tours.operator_id)))"
  }
]

## bookings table rls policies
  -- Get all RLS policies for bookings table
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
  FROM pg_policies
  WHERE tablename = 'bookings';

[
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Enable booking creation for everyone",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Operators can update booking status",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "true"
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Operators can view own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true"
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Users can link own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(((customer_email)::text = (auth.jwt() ->> 'email'::text)) AND (user_id IS NULL))"
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Users can link own bookings by email",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(((customer_email)::text = (auth.jwt() ->> 'email'::text)) AND (user_id IS NULL))"
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "policyname": "Users can view own bookings",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(((auth.uid())::text = (user_id)::text) OR (user_id IS NULL))"
  }
]

##  -- Check if RLS is enabled on these tables
  SELECT schemaname, tablename, rowsecurity
  FROM pg_tables
  WHERE tablename IN ('tours', 'bookings', 'operators');

[
  {
    "schemaname": "public",
    "tablename": "bookings",
    "rowsecurity": true
  },
  {
    "schemaname": "public",
    "tablename": "operators",
    "rowsecurity": true
  },
  {
    "schemaname": "public",
    "tablename": "tours",
    "rowsecurity": true
  }
]

# create_booking_atomic

## create_booking_atomic function defintion

[
  {
    "proname": "create_booking_atomic",
    "prosecdef": false,
    "provolatile": "v",
    "return_type": "jsonb",
    "arguments": "booking_data jsonb, tour_id uuid",
    "permissions": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"
  }
]

## running role of create_booking_atomic function

[
  {
    "function_owner": "postgres",
    "proname": "create_booking_atomic",
    "prosecdef": false
  }
]

## permissions on active_tours_with_operators view

[
  {
    "schemaname": "public",
    "viewname": "active_tours_with_operators",
    "viewowner": "postgres",
    "definition": " SELECT t.id,\n    t.created_at,\n    t.updated_at,\n    t.operator_id,\n    t.tour_name,\n    t.tour_type,\n    t.description,\n    t.tour_date,\n    t.time_slot,\n    t.duration_hours,\n    t.max_capacity,\n    t.available_spots,\n    t.original_price_adult,\n    t.discount_price_adult,\n    t.discount_price_child,\n    t.discount_percentage,\n    t.meeting_point,\n    t.meeting_point_gps,\n    t.pickup_available,\n    t.pickup_locations,\n    t.languages,\n    t.equipment_included,\n    t.food_included,\n    t.drinks_included,\n    t.whale_regulation_compliant,\n    t.max_whale_group_size,\n    t.min_age,\n    t.max_age,\n    t.fitness_level,\n    t.requirements,\n    t.restrictions,\n    t.booking_deadline,\n    t.auto_close_hours,\n    t.status,\n    t.weather_dependent,\n    t.backup_plan,\n    t.special_notes,\n    t.location,\n    t.activity_type,\n    t.is_template,\n    t.parent_template_id,\n    t.parent_schedule_id,\n    t.is_customized,\n    t.frozen_fields,\n    t.overrides,\n    t.is_detached,\n    t.promo_discount_percent,\n    t.promo_discount_value,\n    t.instance_note,\n    t.customization_timestamp,\n    t.max_age_child,\n    t.discount_percentage_child,\n    t.detached_from_schedule_id,\n    COALESCE(((t.overrides ->> 'discount_price_adult'::text))::integer, t.discount_price_adult) AS effective_discount_price_adult,\n    COALESCE(((t.overrides ->> 'discount_price_child'::text))::integer, t.discount_price_child) AS effective_discount_price_child,\n    COALESCE(((t.overrides ->> 'max_capacity'::text))::integer, t.max_capacity) AS effective_max_capacity,\n    COALESCE(((t.overrides ->> 'available_spots'::text))::integer, t.available_spots) AS effective_available_spots,\n    COALESCE((t.overrides ->> 'meeting_point'::text), (t.meeting_point)::text) AS effective_meeting_point,\n        CASE\n            WHEN ((t.promo_discount_percent IS NOT NULL) OR (t.promo_discount_value IS NOT NULL)) THEN true\n            ELSE false\n        END AS has_promotional_pricing,\n        CASE\n            WHEN (t.promo_discount_percent IS NOT NULL) THEN round((((t.discount_price_adult * t.promo_discount_percent))::numeric / 100.0))\n            WHEN (t.promo_discount_value IS NOT NULL) THEN (t.promo_discount_value)::numeric\n            ELSE (0)::numeric\n        END AS promotional_discount_amount,\n        CASE\n            WHEN (t.promo_discount_percent IS NOT NULL) THEN ((t.discount_price_adult)::numeric - round((((t.discount_price_adult * t.promo_discount_percent))::numeric / 100.0)))\n            WHEN (t.promo_discount_value IS NOT NULL) THEN (GREATEST(0, (t.discount_price_adult - t.promo_discount_value)))::numeric\n            ELSE (COALESCE(((t.overrides ->> 'discount_price_adult'::text))::integer, t.discount_price_adult))::numeric\n        END AS final_price_adult,\n    template.tour_name AS template_name,\n    template.tour_type AS template_type,\n    template.description AS template_description,\n    template.id AS template_id,\n    s.recurrence_type,\n    s.days_of_week AS schedule_days,\n    s.start_time AS schedule_start_time,\n    s.start_date AS schedule_start_date,\n    s.end_date AS schedule_end_date,\n    s.is_paused AS schedule_paused,\n    s.schedule_type,\n    o.company_name,\n    o.contact_person,\n    o.email AS operator_email,\n    o.phone AS operator_phone,\n    o.whatsapp_number AS operator_whatsapp_number,\n    o.island AS operator_island,\n    o.address AS operator_address,\n    o.business_license,\n    o.insurance_certificate,\n    o.whale_tour_certified,\n    o.status AS operator_status,\n    o.commission_rate,\n    o.average_rating AS operator_average_rating,\n    o.total_tours_completed AS operator_total_tours_completed,\n    o.business_description AS operator_bio,\n    o.preferred_language AS operator_language,\n    o.operator_logo\n   FROM (((tours t\n     LEFT JOIN tours template ON (((t.parent_template_id = template.id) AND (template.is_template = true))))\n     LEFT JOIN schedules s ON ((t.parent_schedule_id = s.id)))\n     LEFT JOIN operators o ON ((t.operator_id = o.id)))\n  WHERE ((t.is_template = false) AND ((t.status)::text = ANY (ARRAY[('active'::character varying)::text, ('sold_out'::character varying)::text])) AND ((s.is_paused = false) OR (s.is_paused IS NULL) OR (t.is_detached = true)) AND ((o.status)::text = 'active'::text))\n  ORDER BY t.tour_date, t.time_slot;"
  }
]

## specific grants

[
  {
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  }
]

# business logic

[
  {
    "trigger_name": "RI_ConstraintTrigger_a_17478",
    "function_name": "RI_FKey_cascade_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17479",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17490",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17491",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17494",
    "function_name": "RI_FKey_cascade_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17495",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17496",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17497",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17501",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17502",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17506",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17507",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17523",
    "function_name": "RI_FKey_cascade_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17524",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17534",
    "function_name": "RI_FKey_noaction_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_17535",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17548",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_17549",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "booking_webhook_trigger",
    "function_name": "trigger_booking_webhook",
    "tgenabled": "O"
  },
  {
    "trigger_name": "update_bookings_updated_at",
    "function_name": "update_updated_at_column",
    "tgenabled": "O"
  },
  {
    "trigger_name": "update_tours_updated_at",
    "function_name": "update_updated_at_column",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_18906",
    "function_name": "RI_FKey_cascade_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_18907",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_18917",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_18918",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "trigger_create_booking_notification",
    "function_name": "create_booking_notification",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_62217",
    "function_name": "RI_FKey_noaction_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_62218",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_62219",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_62220",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_63745",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_63746",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "auto_populate_schedule_relationship_trigger",
    "function_name": "auto_populate_schedule_relationship",
    "tgenabled": "O"
  },
  {
    "trigger_name": "auto_set_customization_timestamp_trigger",
    "function_name": "auto_set_customization_timestamp",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_66251",
    "function_name": "RI_FKey_cascade_del",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_a_66252",
    "function_name": "RI_FKey_noaction_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_71291",
    "function_name": "RI_FKey_check_ins",
    "tgenabled": "O"
  },
  {
    "trigger_name": "RI_ConstraintTrigger_c_71292",
    "function_name": "RI_FKey_check_upd",
    "tgenabled": "O"
  },
  {
    "trigger_name": "restore_availability_trigger",
    "function_name": "restore_tour_availability",
    "tgenabled": "O"
  }
]

# History check
## why security definer

[
  {
    "function_comment": null
  }
]

## other booking-related functions with security definer

[
  {
    "proname": "get_pending_bookings_for_n8n",
    "prosecdef": true,
    "comment": null
  },
  {
    "proname": "create_booking_notification",
    "prosecdef": true,
    "comment": "Automatically creates booking notifications when new bookings are inserted"
  },
  {
    "proname": "create_booking_atomic",
    "prosecdef": false,
    "comment": null
  },
  {
    "proname": "safe_schedule_tour_update",
    "prosecdef": true,
    "comment": null
  },
  {
    "proname": "link_existing_bookings_to_user",
    "prosecdef": true,
    "comment": null
  },
  {
    "proname": "trigger_booking_webhook",
    "prosecdef": true,
    "comment": null
  }
]