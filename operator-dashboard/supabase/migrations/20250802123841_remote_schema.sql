

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Handle tourist_users (always link for tourist app access)
  IF EXISTS (SELECT 1 FROM public.tourist_users WHERE email = NEW.email) THEN
    -- Update existing tourist_users record
    UPDATE public.tourist_users 
    SET auth_user_id = NEW.id,
        email_verified = (NEW.email_confirmed_at IS NOT NULL),
        updated_at = now()
    WHERE email = NEW.email;
  ELSE
    -- Create new tourist_users record
    INSERT INTO public.tourist_users (
      id, email, first_name, whatsapp_number, email_verified, auth_user_id
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'whatsapp_number',
      NEW.email_confirmed_at IS NOT NULL,
      NEW.id
    );
  END IF;

  -- Handle operators (link if exists, regardless of status)
  -- RLS policies will handle access control based on status
  IF EXISTS (SELECT 1 FROM public.operators WHERE email = NEW.email) THEN
    UPDATE public.operators 
    SET auth_user_id = NEW.id,
        updated_at = now()
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_existing_bookings_to_user"("user_email" "text", "user_uuid" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE bookings 
  SET user_id = user_uuid  
  WHERE customer_email = user_email 
    AND bookings.user_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;


ALTER FUNCTION "public"."link_existing_bookings_to_user"("user_email" "text", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_booking_webhook"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    webhook_url TEXT;
    webhook_payload JSONB;
    booking_data JSONB;
    tourist_data JSONB;
    tour_data JSONB;
    operator_data JSONB;
    webhook_event TEXT;
    should_trigger BOOLEAN := false;
BEGIN
    -- Determine if we should trigger webhook and what type
    IF TG_OP = 'INSERT' THEN
        should_trigger := true;
        webhook_event := 'booking_created';
        webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/new-booking-notification';
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only trigger on important field changes
        IF (OLD.booking_status != NEW.booking_status OR
            OLD.payment_status != NEW.payment_status OR
            OLD.num_adults != NEW.num_adults OR
            OLD.num_children != NEW.num_children) THEN
            
            should_trigger := true;
            
            -- Determine event type based on what changed
            IF OLD.booking_status != NEW.booking_status THEN
                CASE NEW.booking_status
                    WHEN 'confirmed' THEN 
                        webhook_event := 'booking_confirmed';
                        webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/booking-confirmed';
                    WHEN 'declined' THEN 
                        webhook_event := 'booking_declined';
                        webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/booking-declined';
                    WHEN 'cancelled' THEN 
                        webhook_event := 'booking_cancelled';
                        webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/booking-cancelled';
                    WHEN 'completed' THEN 
                        webhook_event := 'booking_completed';
                        webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/booking-completed';
                    ELSE
                        should_trigger := false;
                END CASE;
            ELSIF OLD.payment_status != NEW.payment_status THEN
                webhook_event := 'payment_status_changed';
                webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/payment-status-changed';
            ELSIF (OLD.num_adults != NEW.num_adults OR OLD.num_children != NEW.num_children) THEN
                webhook_event := 'booking_participants_changed';
                webhook_url := 'https://n8n-stable-latest.onrender.com/webhook/booking-participants-changed';
            END IF;
        END IF;
    END IF;

    -- Exit early if no webhook should be triggered
    IF NOT should_trigger THEN
        RETURN NEW;
    END IF;

    -- Get selective booking data (exclude internal tracking fields)
    SELECT to_jsonb(booking_info.*) INTO booking_data
    FROM (
        SELECT 
            b.id,
            b.created_at,
            b.updated_at,
            b.tour_id,
            b.operator_id,
            b.customer_name,
            b.customer_email,
            b.customer_phone,
            b.customer_whatsapp,
            b.num_adults,
            b.num_children,
            b.total_participants,
            b.adult_price,
            b.child_price,
            b.subtotal,
            b.commission_amount,
            b.total_amount,
            b.special_requirements,
            b.dietary_restrictions,
            b.accessibility_needs,
            b.booking_status,
            b.payment_status,
            b.confirmation_deadline,
            b.confirmed_at,
            b.cancelled_at,
            b.operator_response,
            b.booking_reference,
            b.decline_reason,
            b.user_id,  -- Keep for n8n write-back capability
            b.tourist_user_id,
            -- Add calculated fields that n8n might need
            EXTRACT(EPOCH FROM (b.confirmation_deadline - NOW()))/3600 as hours_until_timeout
        FROM bookings b 
        WHERE b.id = COALESCE(NEW.id, OLD.id)
    ) booking_info;

    -- Get tourist data with language preference
    SELECT to_jsonb(tourist_info.*) INTO tourist_data
    FROM (
        SELECT 
            tu.id,
            tu.email,
            tu.first_name,
            tu.last_name,
            tu.whatsapp_number,
            tu.phone,
            tu.preferred_language,  -- KEY for email language
            tu.marketing_emails,
            tu.email_verified,
            tu.status,
            tu.created_at
        FROM tourist_users tu 
        WHERE tu.id = COALESCE(NEW.tourist_user_id, OLD.tourist_user_id)
    ) tourist_info;

    -- Get tour data with available languages
    SELECT to_jsonb(tour_info.*) INTO tour_data
    FROM (
        SELECT 
            t.id,
            t.tour_name,
            t.tour_type,
            t.description,
            t.tour_date,
            t.time_slot,
            t.duration_hours,
            t.meeting_point,
            t.max_capacity,
            t.available_spots,
            t.original_price_adult,
            t.discount_price_adult,
            t.discount_price_child,
            t.languages,  -- Available tour languages
            t.pickup_available,
            t.pickup_locations,
            t.equipment_included,
            t.food_included,
            t.drinks_included,
            t.weather_dependent,
            t.backup_plan,
            t.special_notes
        FROM tours t 
        WHERE t.id = COALESCE(NEW.tour_id, OLD.tour_id)
    ) tour_info;

    -- Get operator data with language extraction from notes
    SELECT to_jsonb(operator_info.*) INTO operator_data
    FROM (
        SELECT 
            o.id,
            o.company_name,
            o.contact_person,
            o.email,
            o.whatsapp_number,
            o.phone,
            o.island,
            o.business_description,
            o.commission_rate,
            -- Extract language from notes JSON, fallback to new field, then default to 'fr'
            COALESCE(
                o.preferred_language,  -- New dedicated field (if populated)
                o.notes::jsonb->>'primary_language',  -- Extract from JSON notes
                'fr'  -- Default fallback
            ) as preferred_language
        FROM operators o 
        WHERE o.id = COALESCE(NEW.operator_id, OLD.operator_id)
    ) operator_info;

    -- Build comprehensive webhook payload
    webhook_payload := jsonb_build_object(
        'event', webhook_event,
        'timestamp', NOW(),
        'booking_id', COALESCE(NEW.id, OLD.id),
        'booking', booking_data,
        'tourist', tourist_data,
        'tour', tour_data,
        'operator', operator_data
    );

    -- Make HTTP request to n8n webhook (using pg_net extension)
    PERFORM
        net.http_post(
            url := webhook_url,
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := webhook_payload
        );

    -- Update webhook tracking (only for booking_created)
    IF webhook_event = 'booking_created' THEN
        NEW.webhook_sent := true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_booking_webhook"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tour_spots"("tour_id" "uuid", "spots_change" integer) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE tours 
  SET available_spots = available_spots + spots_change
  WHERE id = tour_id AND available_spots + spots_change >= 0
  RETURNING json_build_object('success', true, 'new_spots', available_spots) INTO result;
  
  IF result IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient spots');
  END IF;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_tour_spots"("tour_id" "uuid", "spots_change" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."operators" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "company_name" character varying(255) NOT NULL,
    "contact_person" character varying(255),
    "email" character varying(255) NOT NULL,
    "phone" character varying(50),
    "whatsapp_number" character varying(50) NOT NULL,
    "island" character varying(100) NOT NULL,
    "address" "text",
    "business_license" character varying(255),
    "insurance_certificate" character varying(255),
    "whale_tour_certified" boolean DEFAULT false,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "commission_rate" numeric(5,2) DEFAULT 10.00 NOT NULL,
    "password_hash" character varying(255),
    "last_login" timestamp with time zone,
    "notes" "text",
    "total_tours_completed" integer DEFAULT 0,
    "average_rating" numeric(3,2) DEFAULT 0.00,
    "auth_user_id" "uuid",
    "email_verified" boolean DEFAULT false,
    "last_auth_login" timestamp with time zone,
    "auth_setup_completed" boolean DEFAULT false,
    "temp_password" character varying(255),
    "business_description" "text",
    "preferred_language" character varying DEFAULT 'fr'::character varying,
    CONSTRAINT "operators_island_check" CHECK ((("island")::"text" = ANY (ARRAY[('Tahiti'::character varying)::"text", ('Moorea'::character varying)::"text", ('Bora Bora'::character varying)::"text", ('Huahine'::character varying)::"text", ('Raiatea'::character varying)::"text", ('Taha''a'::character varying)::"text", ('Maupiti'::character varying)::"text", ('Tikehau'::character varying)::"text", ('Rangiroa'::character varying)::"text", ('Fakarava'::character varying)::"text", ('Nuku Hiva'::character varying)::"text", ('Other'::character varying)::"text"]))),
    CONSTRAINT "operators_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'inactive'::character varying])::"text"[])))
);


ALTER TABLE "public"."operators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tours" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "operator_id" "uuid" NOT NULL,
    "tour_name" character varying(255) NOT NULL,
    "tour_type" character varying(100) NOT NULL,
    "description" "text",
    "tour_date" "date" NOT NULL,
    "time_slot" character varying(50) NOT NULL,
    "duration_hours" numeric(3,1),
    "max_capacity" integer NOT NULL,
    "available_spots" integer NOT NULL,
    "original_price_adult" integer NOT NULL,
    "discount_price_adult" integer NOT NULL,
    "discount_price_child" integer,
    "discount_percentage" integer GENERATED ALWAYS AS (
CASE
    WHEN ("original_price_adult" > 0) THEN "round"((((("original_price_adult" - "discount_price_adult"))::numeric / ("original_price_adult")::numeric) * (100)::numeric))
    ELSE (0)::numeric
END) STORED,
    "meeting_point" character varying(255) NOT NULL,
    "meeting_point_gps" "point",
    "pickup_available" boolean DEFAULT false,
    "pickup_locations" "text"[],
    "languages" character varying(20)[] DEFAULT ARRAY['French'::"text"],
    "equipment_included" boolean DEFAULT false,
    "food_included" boolean DEFAULT false,
    "drinks_included" boolean DEFAULT false,
    "whale_regulation_compliant" boolean DEFAULT false,
    "max_whale_group_size" integer DEFAULT 6,
    "min_age" integer,
    "max_age" integer,
    "fitness_level" character varying(50),
    "requirements" "text",
    "restrictions" "text",
    "booking_deadline" timestamp with time zone,
    "auto_close_hours" integer DEFAULT 2,
    "status" character varying(50) DEFAULT 'active'::character varying,
    "weather_dependent" boolean DEFAULT true,
    "backup_plan" "text",
    "special_notes" "text",
    "created_by_operator" boolean DEFAULT true,
    CONSTRAINT "tours_fitness_level_check" CHECK ((("fitness_level")::"text" = ANY ((ARRAY['easy'::character varying, 'moderate'::character varying, 'challenging'::character varying, 'expert'::character varying])::"text"[]))),
    CONSTRAINT "tours_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'sold_out'::character varying, 'cancelled'::character varying, 'completed'::character varying])::"text"[]))),
    CONSTRAINT "tours_tour_type_check" CHECK ((("tour_type")::"text" = ANY ((ARRAY['Whale Watching'::character varying, 'Snorkeling'::character varying, 'Lagoon Tour'::character varying, 'Hike'::character varying, 'Cultural'::character varying, 'Adrenalin'::character varying, 'Mindfulness'::character varying, 'Diving'::character varying])::"text"[])))
);


ALTER TABLE "public"."tours" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."active_tours_with_operators" AS
 SELECT "t"."id",
    "t"."created_at",
    "t"."updated_at",
    "t"."operator_id",
    "t"."tour_name",
    "t"."tour_type",
    "t"."description",
    "t"."tour_date",
    "t"."time_slot",
    "t"."duration_hours",
    "t"."max_capacity",
    "t"."available_spots",
    "t"."original_price_adult",
    "t"."discount_price_adult",
    "t"."discount_price_child",
    "t"."discount_percentage",
    "t"."meeting_point",
    "t"."meeting_point_gps",
    "t"."pickup_available",
    "t"."pickup_locations",
    "t"."languages",
    "t"."equipment_included",
    "t"."food_included",
    "t"."drinks_included",
    "t"."whale_regulation_compliant",
    "t"."max_whale_group_size",
    "t"."min_age",
    "t"."max_age",
    "t"."fitness_level",
    "t"."requirements",
    "t"."restrictions",
    "t"."booking_deadline",
    "t"."auto_close_hours",
    "t"."status",
    "t"."weather_dependent",
    "t"."backup_plan",
    "t"."special_notes",
    "t"."created_by_operator",
    "o"."company_name",
    "o"."island" AS "operator_island",
    "o"."whatsapp_number",
    "o"."average_rating" AS "operator_rating",
    (EXTRACT(epoch FROM ("t"."booking_deadline" - "now"())) / (3600)::numeric) AS "hours_until_deadline"
   FROM ("public"."tours" "t"
     JOIN "public"."operators" "o" ON (("t"."operator_id" = "o"."id")))
  WHERE ((("t"."status")::"text" = 'active'::"text") AND ("t"."available_spots" > 0) AND ("t"."tour_date" >= CURRENT_DATE) AND (("o"."status")::"text" = 'active'::"text"))
  ORDER BY "t"."tour_date", "t"."time_slot";


ALTER VIEW "public"."active_tours_with_operators" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "event_type" character varying(100) NOT NULL,
    "table_name" character varying(100),
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "actor_type" character varying(50),
    "actor_id" "uuid",
    "actor_info" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "additional_info" "jsonb"
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message_text" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "booking_conversations_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['tourist'::"text", 'operator'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."booking_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tour_id" "uuid" NOT NULL,
    "operator_id" "uuid" NOT NULL,
    "customer_name" character varying(255) NOT NULL,
    "customer_email" character varying(255) NOT NULL,
    "customer_phone" character varying(50) NOT NULL,
    "customer_whatsapp" character varying(50) NOT NULL,
    "num_adults" integer DEFAULT 1 NOT NULL,
    "num_children" integer DEFAULT 0 NOT NULL,
    "total_participants" integer GENERATED ALWAYS AS (("num_adults" + "num_children")) STORED,
    "adult_price" integer NOT NULL,
    "child_price" integer,
    "subtotal" integer NOT NULL,
    "commission_amount" integer NOT NULL,
    "total_amount" integer GENERATED ALWAYS AS (("subtotal" + "commission_amount")) STORED,
    "special_requirements" "text",
    "dietary_restrictions" "text",
    "accessibility_needs" "text",
    "booking_status" character varying(50) DEFAULT 'pending'::character varying,
    "payment_status" character varying(50) DEFAULT 'pending'::character varying,
    "confirmation_deadline" timestamp with time zone,
    "confirmed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "operator_response" "text",
    "booking_reference" character varying(50),
    "webhook_sent" boolean DEFAULT false,
    "whatsapp_sent" boolean DEFAULT false,
    "email_sent" boolean DEFAULT false,
    "operator_whatsapp_sent_at" timestamp with time zone,
    "operator_response_received_at" timestamp with time zone,
    "operator_response_method" character varying(50),
    "confirmation_email_sent_at" timestamp with time zone,
    "timeout_alert_sent_at" timestamp with time zone,
    "decline_reason" "text",
    "operator_confirmation_sent" boolean DEFAULT false,
    "operator_confirmation_sent_at" timestamp with time zone,
    "applied_commission_rate" numeric(5,2),
    "commission_locked_at" timestamp without time zone,
    "user_id" "uuid",
    "tourist_user_id" "uuid",
    CONSTRAINT "bookings_booking_status_check" CHECK ((("booking_status")::"text" = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'declined'::character varying, 'cancelled'::character varying, 'completed'::character varying, 'no_show'::character varying])::"text"[]))),
    CONSTRAINT "bookings_num_adults_check" CHECK (("num_adults" >= 0)),
    CONSTRAINT "bookings_num_children_check" CHECK (("num_children" >= 0)),
    CONSTRAINT "bookings_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying, 'failed'::character varying])::"text"[]))),
    CONSTRAINT "check_applied_commission_rate" CHECK ((("applied_commission_rate" >= (0)::numeric) AND ("applied_commission_rate" <= (50)::numeric)))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bookings"."operator_confirmation_sent" IS 'Whether operator has been sent confirmation email with tourist details';



COMMENT ON COLUMN "public"."bookings"."operator_confirmation_sent_at" IS 'Timestamp when operator confirmation email was sent';



CREATE OR REPLACE VIEW "public"."operator_booking_summary" AS
 SELECT "operator_id",
    "count"(*) AS "total_bookings",
    "count"(*) FILTER (WHERE (("booking_status")::"text" = 'confirmed'::"text")) AS "confirmed_bookings",
    "count"(*) FILTER (WHERE (("booking_status")::"text" = 'pending'::"text")) AS "pending_bookings",
    "sum"("subtotal") FILTER (WHERE (("booking_status")::"text" = 'confirmed'::"text")) AS "total_revenue",
    "sum"("commission_amount") FILTER (WHERE (("booking_status")::"text" = 'confirmed'::"text")) AS "total_commission"
   FROM "public"."bookings" "b"
  WHERE ("created_at" >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY "operator_id";


ALTER VIEW "public"."operator_booking_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pending_bookings_for_workflow" AS
 SELECT "b"."id",
    "b"."created_at",
    "b"."updated_at",
    "b"."tour_id",
    "b"."operator_id",
    "b"."customer_name",
    "b"."customer_email",
    "b"."customer_phone",
    "b"."customer_whatsapp",
    "b"."num_adults",
    "b"."num_children",
    "b"."total_participants",
    "b"."adult_price",
    "b"."child_price",
    "b"."subtotal",
    "b"."commission_amount",
    "b"."total_amount",
    "b"."special_requirements",
    "b"."dietary_restrictions",
    "b"."accessibility_needs",
    "b"."booking_status",
    "b"."payment_status",
    "b"."confirmation_deadline",
    "b"."confirmed_at",
    "b"."cancelled_at",
    "b"."operator_response",
    "b"."booking_reference",
    "b"."webhook_sent",
    "b"."whatsapp_sent",
    "b"."email_sent",
    "b"."operator_whatsapp_sent_at",
    "b"."operator_response_received_at",
    "b"."operator_response_method",
    "b"."confirmation_email_sent_at",
    "b"."timeout_alert_sent_at",
    "b"."decline_reason",
    "t"."tour_name",
    "t"."tour_date",
    "t"."time_slot",
    "t"."meeting_point",
    "o"."company_name",
    "o"."whatsapp_number" AS "operator_whatsapp",
    "o"."contact_person",
    (EXTRACT(epoch FROM ("b"."confirmation_deadline" - "now"())) / (3600)::numeric) AS "hours_until_timeout",
    ("now"() > "b"."confirmation_deadline") AS "is_overdue"
   FROM (("public"."bookings" "b"
     JOIN "public"."tours" "t" ON (("b"."tour_id" = "t"."id")))
     JOIN "public"."operators" "o" ON (("b"."operator_id" = "o"."id")))
  WHERE (("b"."booking_status")::"text" = 'pending'::"text")
  ORDER BY "b"."created_at" DESC;


ALTER VIEW "public"."pending_bookings_for_workflow" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_scans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text" NOT NULL,
    "campaign" "text",
    "source" "text",
    "medium" "text",
    "location" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "user_agent" "text",
    "referrer" "text",
    "screen_width" integer,
    "screen_height" integer,
    "language" "text",
    "timezone" "text",
    "converted_to_registration" boolean DEFAULT false,
    "registration_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."qr_scans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "booking_id" "uuid" NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "operator_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "title" character varying(255),
    "comment" "text",
    "customer_name" character varying(255) NOT NULL,
    "is_verified" boolean DEFAULT false,
    "is_published" boolean DEFAULT true,
    "moderator_notes" "text",
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tourist_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" character varying NOT NULL,
    "first_name" character varying(100),
    "last_name" character varying(100),
    "whatsapp_number" character varying(20),
    "phone" character varying(20),
    "preferred_language" character varying(5) DEFAULT 'en'::character varying,
    "marketing_emails" boolean DEFAULT true,
    "favorites" "jsonb" DEFAULT '[]'::"jsonb",
    "email_verified" boolean DEFAULT false,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "last_login" timestamp with time zone,
    "auth_user_id" "uuid",
    "last_auth_login" timestamp with time zone
);


ALTER TABLE "public"."tourist_users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_conversations"
    ADD CONSTRAINT "booking_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_reference_key" UNIQUE ("booking_reference");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operators"
    ADD CONSTRAINT "operators_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."operators"
    ADD CONSTRAINT "operators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_scans"
    ADD CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tourist_users"
    ADD CONSTRAINT "tourist_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."tourist_users"
    ADD CONSTRAINT "tourist_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tours"
    ADD CONSTRAINT "tours_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_active_tours_today" ON "public"."tours" USING "btree" ("tour_date", "time_slot") WHERE ((("status")::"text" = 'active'::"text") AND ("available_spots" > 0));



CREATE INDEX "idx_bookings_commission_locked" ON "public"."bookings" USING "btree" ("commission_locked_at", "booking_status");



CREATE INDEX "idx_bookings_created_date" ON "public"."bookings" USING "btree" ("created_at");



CREATE INDEX "idx_bookings_customer_email" ON "public"."bookings" USING "btree" ("customer_email");



CREATE INDEX "idx_bookings_operator" ON "public"."bookings" USING "btree" ("operator_id");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("booking_status");



CREATE INDEX "idx_bookings_timeout_check" ON "public"."bookings" USING "btree" ("confirmation_deadline", "booking_status") WHERE (("booking_status")::"text" = 'pending'::"text");



CREATE INDEX "idx_bookings_tour" ON "public"."bookings" USING "btree" ("tour_id");



CREATE INDEX "idx_bookings_user_id" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_bookings_workflow_pending" ON "public"."bookings" USING "btree" ("created_at", "booking_status") WHERE (("booking_status")::"text" = 'pending'::"text");



CREATE INDEX "idx_conversations_booking_id" ON "public"."booking_conversations" USING "btree" ("booking_id");



CREATE INDEX "idx_conversations_unread" ON "public"."booking_conversations" USING "btree" ("booking_id", "is_read") WHERE (NOT "is_read");



CREATE INDEX "idx_operators_auth_user_id" ON "public"."operators" USING "btree" ("auth_user_id");



CREATE INDEX "idx_operators_email_auth" ON "public"."operators" USING "btree" ("email", "auth_user_id");



CREATE INDEX "idx_operators_email_status" ON "public"."operators" USING "btree" ("email", "status");



CREATE INDEX "idx_operators_island" ON "public"."operators" USING "btree" ("island");



CREATE INDEX "idx_operators_preferred_language" ON "public"."operators" USING "btree" ("preferred_language");



CREATE INDEX "idx_operators_status" ON "public"."operators" USING "btree" ("status");



CREATE INDEX "idx_qr_scans_campaign" ON "public"."qr_scans" USING "btree" ("campaign");



CREATE INDEX "idx_qr_scans_location" ON "public"."qr_scans" USING "btree" ("location");



CREATE INDEX "idx_qr_scans_session_id" ON "public"."qr_scans" USING "btree" ("session_id");



CREATE INDEX "idx_qr_scans_timestamp" ON "public"."qr_scans" USING "btree" ("timestamp");



CREATE INDEX "idx_tourist_users_auth_user_id" ON "public"."tourist_users" USING "btree" ("auth_user_id");



CREATE INDEX "idx_tours_active_available" ON "public"."tours" USING "btree" ("tour_date", "available_spots") WHERE ((("status")::"text" = 'active'::"text") AND ("available_spots" > 0));



CREATE INDEX "idx_tours_available_spots" ON "public"."tours" USING "btree" ("available_spots") WHERE ("available_spots" > 0);



CREATE INDEX "idx_tours_date_status" ON "public"."tours" USING "btree" ("tour_date", "status") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_tours_operator" ON "public"."tours" USING "btree" ("operator_id");



CREATE INDEX "idx_tours_type_island" ON "public"."tours" USING "btree" ("tour_type", "operator_id");



CREATE OR REPLACE TRIGGER "booking_webhook_trigger" AFTER INSERT OR UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_booking_webhook"();



CREATE OR REPLACE TRIGGER "update_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_operators_updated_at" BEFORE UPDATE ON "public"."operators" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tourist_users_updated_at" BEFORE UPDATE ON "public"."tourist_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tours_updated_at" BEFORE UPDATE ON "public"."tours" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."booking_conversations"
    ADD CONSTRAINT "booking_conversations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_tourist_user_id_fkey" FOREIGN KEY ("tourist_user_id") REFERENCES "public"."tourist_users"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."tourist_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."operators"
    ADD CONSTRAINT "operators_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."qr_scans"
    ADD CONSTRAINT "qr_scans_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."tourist_users"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id");



ALTER TABLE ONLY "public"."tourist_users"
    ADD CONSTRAINT "tourist_users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tours"
    ADD CONSTRAINT "tours_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE CASCADE;



CREATE POLICY "Allow anonymous QR tracking" ON "public"."qr_scans" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow available_spots updates only" ON "public"."tours" FOR UPDATE USING (true) WITH CHECK (("available_spots" IS NOT NULL));



CREATE POLICY "Allow operators to manage their tours" ON "public"."tours" TO "authenticated", "anon" USING (("operator_id" IN ( SELECT "operators"."id"
   FROM "public"."operators"
  WHERE ((("operators"."email")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")) OR (1 = 1))))) WITH CHECK (("operator_id" IN ( SELECT "operators"."id"
   FROM "public"."operators"
  WHERE ((("operators"."email")::"text" = (("current_setting"('request.jwt.claims'::"text", true))::json ->> 'email'::"text")) OR (1 = 1)))));



CREATE POLICY "Allow public read access for tourists" ON "public"."tours" FOR SELECT TO "authenticated", "anon" USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "Anyone can view active tours" ON "public"."tours" FOR SELECT USING (((("status")::"text" = 'active'::"text") AND ("available_spots" > 0) AND ("tour_date" >= CURRENT_DATE)));



CREATE POLICY "Anyone can view published reviews" ON "public"."reviews" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Enable booking creation for everyone" ON "public"."bookings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Operators can manage own tours" ON "public"."tours" USING ((("auth"."uid"())::"text" = ("operator_id")::"text"));



CREATE POLICY "Operators can update booking status" ON "public"."bookings" FOR UPDATE USING (true);



CREATE POLICY "Operators can view own bookings" ON "public"."bookings" FOR SELECT USING (true);



CREATE POLICY "Users can insert messages for their own bookings" ON "public"."booking_conversations" FOR INSERT WITH CHECK (((("sender_type" = 'tourist'::"text") AND ("auth"."uid"() IN ( SELECT "tu"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."tourist_users" "tu" ON (("b"."tourist_user_id" = "tu"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id")))) OR (("sender_type" = 'operator'::"text") AND ("auth"."uid"() IN ( SELECT "o"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."operators" "o" ON (("b"."operator_id" = "o"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id")))) OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Users can link own bookings" ON "public"."bookings" FOR UPDATE USING (((("customer_email")::"text" = ("auth"."jwt"() ->> 'email'::"text")) AND ("user_id" IS NULL))) WITH CHECK ((("user_id")::"text" = ("auth"."uid"())::"text"));



CREATE POLICY "Users can link own bookings by email" ON "public"."bookings" FOR UPDATE USING (((("customer_email")::"text" = ("auth"."jwt"() ->> 'email'::"text")) AND ("user_id" IS NULL))) WITH CHECK ((("user_id")::"text" = ("auth"."uid"())::"text"));



CREATE POLICY "Users can manage their own tourist data" ON "public"."tourist_users" USING ((("auth"."uid"() = "auth_user_id") OR ("auth"."uid"() IS NULL))) WITH CHECK ((("auth"."uid"() = "auth_user_id") OR ("auth"."uid"() IS NULL)));



CREATE POLICY "Users can update own profile (with auth linking)" ON "public"."tourist_users" FOR UPDATE USING ((("auth"."uid"() = "auth_user_id") OR (("auth"."uid"())::"text" = ("id")::"text")));



CREATE POLICY "Users can update their own booking conversations" ON "public"."booking_conversations" FOR UPDATE USING ((("auth"."uid"() IN ( SELECT "tu"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."tourist_users" "tu" ON (("b"."tourist_user_id" = "tu"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id"))) OR ("auth"."uid"() IN ( SELECT "o"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."operators" "o" ON (("b"."operator_id" = "o"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id"))) OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Users can view own bookings" ON "public"."bookings" FOR SELECT USING (((("auth"."uid"())::"text" = ("user_id")::"text") OR ("user_id" IS NULL)));



CREATE POLICY "Users can view own profile (with auth linking)" ON "public"."tourist_users" FOR SELECT USING ((("auth"."uid"() = "auth_user_id") OR (("auth"."uid"())::"text" = ("id")::"text")));



CREATE POLICY "Users can view own scans" ON "public"."qr_scans" FOR SELECT USING ((("registration_id" = "auth"."uid"()) OR ("session_id" IN ( SELECT "unnest"("string_to_array"((("current_setting"('request.jwt.claims'::"text", true))::json ->> 'session_ids'::"text"), ','::"text")) AS "unnest"))));



CREATE POLICY "Users can view their own booking conversations" ON "public"."booking_conversations" FOR SELECT USING ((("auth"."uid"() IN ( SELECT "tu"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."tourist_users" "tu" ON (("b"."tourist_user_id" = "tu"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id"))) OR ("auth"."uid"() IN ( SELECT "o"."auth_user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."operators" "o" ON (("b"."operator_id" = "o"."id")))
  WHERE ("b"."id" = "booking_conversations"."booking_id"))) OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operators" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "operators_anon_insert" ON "public"."operators" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "operators_anon_select" ON "public"."operators" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "operators_public_view" ON "public"."operators" FOR SELECT USING ((("status")::"text" = 'active'::"text"));



CREATE POLICY "operators_select_own" ON "public"."operators" FOR SELECT USING (("auth"."uid"() = "auth_user_id"));



CREATE POLICY "operators_update_own" ON "public"."operators" FOR UPDATE USING (("auth"."uid"() = "auth_user_id"));



ALTER TABLE "public"."qr_scans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tourist_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tourist_users_anon_insert" ON "public"."tourist_users" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "tourist_users_anon_select" ON "public"."tourist_users" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."tours" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."booking_conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."bookings";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."link_existing_bookings_to_user"("user_email" "text", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."link_existing_bookings_to_user"("user_email" "text", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_existing_bookings_to_user"("user_email" "text", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_booking_webhook"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_booking_webhook"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_booking_webhook"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tour_spots"("tour_id" "uuid", "spots_change" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_tour_spots"("tour_id" "uuid", "spots_change" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tour_spots"("tour_id" "uuid", "spots_change" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."operators" TO "anon";
GRANT ALL ON TABLE "public"."operators" TO "authenticated";
GRANT ALL ON TABLE "public"."operators" TO "service_role";



GRANT ALL ON TABLE "public"."tours" TO "anon";
GRANT ALL ON TABLE "public"."tours" TO "authenticated";
GRANT ALL ON TABLE "public"."tours" TO "service_role";



GRANT ALL ON TABLE "public"."active_tours_with_operators" TO "anon";
GRANT ALL ON TABLE "public"."active_tours_with_operators" TO "authenticated";
GRANT ALL ON TABLE "public"."active_tours_with_operators" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."booking_conversations" TO "anon";
GRANT ALL ON TABLE "public"."booking_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."operator_booking_summary" TO "anon";
GRANT ALL ON TABLE "public"."operator_booking_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."operator_booking_summary" TO "service_role";



GRANT ALL ON TABLE "public"."pending_bookings_for_workflow" TO "anon";
GRANT ALL ON TABLE "public"."pending_bookings_for_workflow" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_bookings_for_workflow" TO "service_role";



GRANT ALL ON TABLE "public"."qr_scans" TO "anon";
GRANT ALL ON TABLE "public"."qr_scans" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_scans" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."tourist_users" TO "anon";
GRANT ALL ON TABLE "public"."tourist_users" TO "authenticated";
GRANT ALL ON TABLE "public"."tourist_users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
