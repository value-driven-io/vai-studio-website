create extension if not exists "pg_net" with schema "public" version '0.14.0';

create table "public"."audit_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "event_type" character varying(100) not null,
    "table_name" character varying(100),
    "record_id" uuid,
    "old_values" jsonb,
    "new_values" jsonb,
    "actor_type" character varying(50),
    "actor_id" uuid,
    "actor_info" text,
    "ip_address" inet,
    "user_agent" text,
    "additional_info" jsonb
);


alter table "public"."audit_logs" enable row level security;

create table "public"."booking_conversations" (
    "id" uuid not null default gen_random_uuid(),
    "booking_id" uuid not null,
    "sender_type" text not null,
    "sender_id" uuid not null,
    "message_text" text not null,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."booking_conversations" enable row level security;

create table "public"."bookings" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "tour_id" uuid not null,
    "operator_id" uuid not null,
    "customer_name" character varying(255) not null,
    "customer_email" character varying(255) not null,
    "customer_phone" character varying(50) not null,
    "customer_whatsapp" character varying(50) not null,
    "num_adults" integer not null default 1,
    "num_children" integer not null default 0,
    "total_participants" integer generated always as ((num_adults + num_children)) stored,
    "adult_price" integer not null,
    "child_price" integer,
    "subtotal" integer not null,
    "commission_amount" integer not null,
    "total_amount" integer generated always as ((subtotal + commission_amount)) stored,
    "special_requirements" text,
    "dietary_restrictions" text,
    "accessibility_needs" text,
    "booking_status" character varying(50) default 'pending'::character varying,
    "payment_status" character varying(50) default 'pending'::character varying,
    "confirmation_deadline" timestamp with time zone,
    "confirmed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "operator_response" text,
    "booking_reference" character varying(50),
    "webhook_sent" boolean default false,
    "whatsapp_sent" boolean default false,
    "email_sent" boolean default false,
    "operator_whatsapp_sent_at" timestamp with time zone,
    "operator_response_received_at" timestamp with time zone,
    "operator_response_method" character varying(50),
    "confirmation_email_sent_at" timestamp with time zone,
    "timeout_alert_sent_at" timestamp with time zone,
    "decline_reason" text,
    "operator_confirmation_sent" boolean default false,
    "operator_confirmation_sent_at" timestamp with time zone,
    "applied_commission_rate" numeric(5,2),
    "commission_locked_at" timestamp without time zone,
    "user_id" uuid,
    "tourist_user_id" uuid
);


alter table "public"."bookings" enable row level security;

create table "public"."operators" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "company_name" character varying(255) not null,
    "contact_person" character varying(255),
    "email" character varying(255) not null,
    "phone" character varying(50),
    "whatsapp_number" character varying(50) not null,
    "island" character varying(100) not null,
    "address" text,
    "business_license" character varying(255),
    "insurance_certificate" character varying(255),
    "whale_tour_certified" boolean default false,
    "status" character varying(50) default 'pending'::character varying,
    "commission_rate" numeric(5,2) not null default 10.00,
    "password_hash" character varying(255),
    "last_login" timestamp with time zone,
    "notes" text,
    "total_tours_completed" integer default 0,
    "average_rating" numeric(3,2) default 0.00,
    "auth_user_id" uuid,
    "email_verified" boolean default false,
    "last_auth_login" timestamp with time zone,
    "auth_setup_completed" boolean default false,
    "temp_password" character varying(255),
    "business_description" text,
    "preferred_language" character varying default 'fr'::character varying
);


alter table "public"."operators" enable row level security;

create table "public"."qr_scans" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" text not null,
    "campaign" text,
    "source" text,
    "medium" text,
    "location" text,
    "timestamp" timestamp with time zone default now(),
    "user_agent" text,
    "referrer" text,
    "screen_width" integer,
    "screen_height" integer,
    "language" text,
    "timezone" text,
    "converted_to_registration" boolean default false,
    "registration_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."qr_scans" enable row level security;

create table "public"."reviews" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "booking_id" uuid not null,
    "tour_id" uuid not null,
    "operator_id" uuid not null,
    "rating" integer not null,
    "title" character varying(255),
    "comment" text,
    "customer_name" character varying(255) not null,
    "is_verified" boolean default false,
    "is_published" boolean default true,
    "moderator_notes" text
);


alter table "public"."reviews" enable row level security;

create table "public"."tourist_users" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" character varying not null,
    "first_name" character varying(100),
    "last_name" character varying(100),
    "whatsapp_number" character varying(20),
    "phone" character varying(20),
    "preferred_language" character varying(5) default 'en'::character varying,
    "marketing_emails" boolean default true,
    "favorites" jsonb default '[]'::jsonb,
    "email_verified" boolean default false,
    "status" character varying(20) default 'active'::character varying,
    "last_login" timestamp with time zone,
    "auth_user_id" uuid,
    "last_auth_login" timestamp with time zone
);


alter table "public"."tourist_users" enable row level security;

create table "public"."tours" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "operator_id" uuid not null,
    "tour_name" character varying(255) not null,
    "tour_type" character varying(100) not null,
    "description" text,
    "tour_date" date not null,
    "time_slot" character varying(50) not null,
    "duration_hours" numeric(3,1),
    "max_capacity" integer not null,
    "available_spots" integer not null,
    "original_price_adult" integer not null,
    "discount_price_adult" integer not null,
    "discount_price_child" integer,
    "discount_percentage" integer generated always as (
CASE
    WHEN (original_price_adult > 0) THEN round(((((original_price_adult - discount_price_adult))::numeric / (original_price_adult)::numeric) * (100)::numeric))
    ELSE (0)::numeric
END) stored,
    "meeting_point" character varying(255) not null,
    "meeting_point_gps" point,
    "pickup_available" boolean default false,
    "pickup_locations" text[],
    "languages" character varying(20)[] default ARRAY['French'::text],
    "equipment_included" boolean default false,
    "food_included" boolean default false,
    "drinks_included" boolean default false,
    "whale_regulation_compliant" boolean default false,
    "max_whale_group_size" integer default 6,
    "min_age" integer,
    "max_age" integer,
    "fitness_level" character varying(50),
    "requirements" text,
    "restrictions" text,
    "booking_deadline" timestamp with time zone,
    "auto_close_hours" integer default 2,
    "status" character varying(50) default 'active'::character varying,
    "weather_dependent" boolean default true,
    "backup_plan" text,
    "special_notes" text,
    "created_by_operator" boolean default true
);


alter table "public"."tours" enable row level security;

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX booking_conversations_pkey ON public.booking_conversations USING btree (id);

CREATE UNIQUE INDEX bookings_booking_reference_key ON public.bookings USING btree (booking_reference);

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE INDEX idx_active_tours_today ON public.tours USING btree (tour_date, time_slot) WHERE (((status)::text = 'active'::text) AND (available_spots > 0));

CREATE INDEX idx_bookings_commission_locked ON public.bookings USING btree (commission_locked_at, booking_status);

CREATE INDEX idx_bookings_created_date ON public.bookings USING btree (created_at);

CREATE INDEX idx_bookings_customer_email ON public.bookings USING btree (customer_email);

CREATE INDEX idx_bookings_operator ON public.bookings USING btree (operator_id);

CREATE INDEX idx_bookings_status ON public.bookings USING btree (booking_status);

CREATE INDEX idx_bookings_timeout_check ON public.bookings USING btree (confirmation_deadline, booking_status) WHERE ((booking_status)::text = 'pending'::text);

CREATE INDEX idx_bookings_tour ON public.bookings USING btree (tour_id);

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);

CREATE INDEX idx_bookings_workflow_pending ON public.bookings USING btree (created_at, booking_status) WHERE ((booking_status)::text = 'pending'::text);

CREATE INDEX idx_conversations_booking_id ON public.booking_conversations USING btree (booking_id);

CREATE INDEX idx_conversations_unread ON public.booking_conversations USING btree (booking_id, is_read) WHERE (NOT is_read);

CREATE INDEX idx_operators_auth_user_id ON public.operators USING btree (auth_user_id);

CREATE INDEX idx_operators_email_auth ON public.operators USING btree (email, auth_user_id);

CREATE INDEX idx_operators_email_status ON public.operators USING btree (email, status);

CREATE INDEX idx_operators_island ON public.operators USING btree (island);

CREATE INDEX idx_operators_preferred_language ON public.operators USING btree (preferred_language);

CREATE INDEX idx_operators_status ON public.operators USING btree (status);

CREATE INDEX idx_qr_scans_campaign ON public.qr_scans USING btree (campaign);

CREATE INDEX idx_qr_scans_location ON public.qr_scans USING btree (location);

CREATE INDEX idx_qr_scans_session_id ON public.qr_scans USING btree (session_id);

CREATE INDEX idx_qr_scans_timestamp ON public.qr_scans USING btree ("timestamp");

CREATE INDEX idx_tourist_users_auth_user_id ON public.tourist_users USING btree (auth_user_id);

CREATE INDEX idx_tours_active_available ON public.tours USING btree (tour_date, available_spots) WHERE (((status)::text = 'active'::text) AND (available_spots > 0));

CREATE INDEX idx_tours_available_spots ON public.tours USING btree (available_spots) WHERE (available_spots > 0);

CREATE INDEX idx_tours_date_status ON public.tours USING btree (tour_date, status) WHERE ((status)::text = 'active'::text);

CREATE INDEX idx_tours_operator ON public.tours USING btree (operator_id);

CREATE INDEX idx_tours_type_island ON public.tours USING btree (tour_type, operator_id);

CREATE UNIQUE INDEX operators_email_key ON public.operators USING btree (email);

CREATE UNIQUE INDEX operators_pkey ON public.operators USING btree (id);

CREATE UNIQUE INDEX qr_scans_pkey ON public.qr_scans USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX tourist_users_email_key ON public.tourist_users USING btree (email);

CREATE UNIQUE INDEX tourist_users_pkey ON public.tourist_users USING btree (id);

CREATE UNIQUE INDEX tours_pkey ON public.tours USING btree (id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."booking_conversations" add constraint "booking_conversations_pkey" PRIMARY KEY using index "booking_conversations_pkey";

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."operators" add constraint "operators_pkey" PRIMARY KEY using index "operators_pkey";

alter table "public"."qr_scans" add constraint "qr_scans_pkey" PRIMARY KEY using index "qr_scans_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."tourist_users" add constraint "tourist_users_pkey" PRIMARY KEY using index "tourist_users_pkey";

alter table "public"."tours" add constraint "tours_pkey" PRIMARY KEY using index "tours_pkey";

alter table "public"."booking_conversations" add constraint "booking_conversations_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE not valid;

alter table "public"."booking_conversations" validate constraint "booking_conversations_booking_id_fkey";

alter table "public"."booking_conversations" add constraint "booking_conversations_sender_type_check" CHECK ((sender_type = ANY (ARRAY['tourist'::text, 'operator'::text, 'admin'::text]))) not valid;

alter table "public"."booking_conversations" validate constraint "booking_conversations_sender_type_check";

alter table "public"."bookings" add constraint "bookings_booking_reference_key" UNIQUE using index "bookings_booking_reference_key";

alter table "public"."bookings" add constraint "bookings_booking_status_check" CHECK (((booking_status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'declined'::character varying, 'cancelled'::character varying, 'completed'::character varying, 'no_show'::character varying])::text[]))) not valid;

alter table "public"."bookings" validate constraint "bookings_booking_status_check";

alter table "public"."bookings" add constraint "bookings_num_adults_check" CHECK ((num_adults >= 0)) not valid;

alter table "public"."bookings" validate constraint "bookings_num_adults_check";

alter table "public"."bookings" add constraint "bookings_num_children_check" CHECK ((num_children >= 0)) not valid;

alter table "public"."bookings" validate constraint "bookings_num_children_check";

alter table "public"."bookings" add constraint "bookings_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES operators(id) not valid;

alter table "public"."bookings" validate constraint "bookings_operator_id_fkey";

alter table "public"."bookings" add constraint "bookings_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."bookings" validate constraint "bookings_payment_status_check";

alter table "public"."bookings" add constraint "bookings_tour_id_fkey" FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE not valid;

alter table "public"."bookings" validate constraint "bookings_tour_id_fkey";

alter table "public"."bookings" add constraint "bookings_tourist_user_id_fkey" FOREIGN KEY (tourist_user_id) REFERENCES tourist_users(id) not valid;

alter table "public"."bookings" validate constraint "bookings_tourist_user_id_fkey";

alter table "public"."bookings" add constraint "bookings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES tourist_users(id) ON DELETE SET NULL not valid;

alter table "public"."bookings" validate constraint "bookings_user_id_fkey";

alter table "public"."bookings" add constraint "check_applied_commission_rate" CHECK (((applied_commission_rate >= (0)::numeric) AND (applied_commission_rate <= (50)::numeric))) not valid;

alter table "public"."bookings" validate constraint "check_applied_commission_rate";

alter table "public"."operators" add constraint "operators_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."operators" validate constraint "operators_auth_user_id_fkey";

alter table "public"."operators" add constraint "operators_email_key" UNIQUE using index "operators_email_key";

alter table "public"."operators" add constraint "operators_island_check" CHECK (((island)::text = ANY (ARRAY[('Tahiti'::character varying)::text, ('Moorea'::character varying)::text, ('Bora Bora'::character varying)::text, ('Huahine'::character varying)::text, ('Raiatea'::character varying)::text, ('Taha''a'::character varying)::text, ('Maupiti'::character varying)::text, ('Tikehau'::character varying)::text, ('Rangiroa'::character varying)::text, ('Fakarava'::character varying)::text, ('Nuku Hiva'::character varying)::text, ('Other'::character varying)::text]))) not valid;

alter table "public"."operators" validate constraint "operators_island_check";

alter table "public"."operators" add constraint "operators_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'inactive'::character varying])::text[]))) not valid;

alter table "public"."operators" validate constraint "operators_status_check";

alter table "public"."qr_scans" add constraint "qr_scans_registration_id_fkey" FOREIGN KEY (registration_id) REFERENCES tourist_users(id) not valid;

alter table "public"."qr_scans" validate constraint "qr_scans_registration_id_fkey";

alter table "public"."reviews" add constraint "reviews_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_booking_id_fkey";

alter table "public"."reviews" add constraint "reviews_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES operators(id) not valid;

alter table "public"."reviews" validate constraint "reviews_operator_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_tour_id_fkey" FOREIGN KEY (tour_id) REFERENCES tours(id) not valid;

alter table "public"."reviews" validate constraint "reviews_tour_id_fkey";

alter table "public"."tourist_users" add constraint "tourist_users_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."tourist_users" validate constraint "tourist_users_auth_user_id_fkey";

alter table "public"."tourist_users" add constraint "tourist_users_email_key" UNIQUE using index "tourist_users_email_key";

alter table "public"."tours" add constraint "tours_fitness_level_check" CHECK (((fitness_level)::text = ANY ((ARRAY['easy'::character varying, 'moderate'::character varying, 'challenging'::character varying, 'expert'::character varying])::text[]))) not valid;

alter table "public"."tours" validate constraint "tours_fitness_level_check";

alter table "public"."tours" add constraint "tours_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE not valid;

alter table "public"."tours" validate constraint "tours_operator_id_fkey";

alter table "public"."tours" add constraint "tours_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'sold_out'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."tours" validate constraint "tours_status_check";

alter table "public"."tours" add constraint "tours_tour_type_check" CHECK (((tour_type)::text = ANY ((ARRAY['Whale Watching'::character varying, 'Snorkeling'::character varying, 'Lagoon Tour'::character varying, 'Hike'::character varying, 'Cultural'::character varying, 'Adrenalin'::character varying, 'Mindfulness'::character varying, 'Diving'::character varying])::text[]))) not valid;

alter table "public"."tours" validate constraint "tours_tour_type_check";

set check_function_bodies = off;

create or replace view "public"."active_tours_with_operators" as  SELECT t.id,
    t.created_at,
    t.updated_at,
    t.operator_id,
    t.tour_name,
    t.tour_type,
    t.description,
    t.tour_date,
    t.time_slot,
    t.duration_hours,
    t.max_capacity,
    t.available_spots,
    t.original_price_adult,
    t.discount_price_adult,
    t.discount_price_child,
    t.discount_percentage,
    t.meeting_point,
    t.meeting_point_gps,
    t.pickup_available,
    t.pickup_locations,
    t.languages,
    t.equipment_included,
    t.food_included,
    t.drinks_included,
    t.whale_regulation_compliant,
    t.max_whale_group_size,
    t.min_age,
    t.max_age,
    t.fitness_level,
    t.requirements,
    t.restrictions,
    t.booking_deadline,
    t.auto_close_hours,
    t.status,
    t.weather_dependent,
    t.backup_plan,
    t.special_notes,
    t.created_by_operator,
    o.company_name,
    o.island AS operator_island,
    o.whatsapp_number,
    o.average_rating AS operator_rating,
    (EXTRACT(epoch FROM (t.booking_deadline - now())) / (3600)::numeric) AS hours_until_deadline
   FROM (tours t
     JOIN operators o ON ((t.operator_id = o.id)))
  WHERE (((t.status)::text = 'active'::text) AND (t.available_spots > 0) AND (t.tour_date >= CURRENT_DATE) AND ((o.status)::text = 'active'::text))
  ORDER BY t.tour_date, t.time_slot;


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.link_existing_bookings_to_user(user_email text, user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

create or replace view "public"."operator_booking_summary" as  SELECT operator_id,
    count(*) AS total_bookings,
    count(*) FILTER (WHERE ((booking_status)::text = 'confirmed'::text)) AS confirmed_bookings,
    count(*) FILTER (WHERE ((booking_status)::text = 'pending'::text)) AS pending_bookings,
    sum(subtotal) FILTER (WHERE ((booking_status)::text = 'confirmed'::text)) AS total_revenue,
    sum(commission_amount) FILTER (WHERE ((booking_status)::text = 'confirmed'::text)) AS total_commission
   FROM bookings b
  WHERE (created_at >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY operator_id;


create or replace view "public"."pending_bookings_for_workflow" as  SELECT b.id,
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
    b.webhook_sent,
    b.whatsapp_sent,
    b.email_sent,
    b.operator_whatsapp_sent_at,
    b.operator_response_received_at,
    b.operator_response_method,
    b.confirmation_email_sent_at,
    b.timeout_alert_sent_at,
    b.decline_reason,
    t.tour_name,
    t.tour_date,
    t.time_slot,
    t.meeting_point,
    o.company_name,
    o.whatsapp_number AS operator_whatsapp,
    o.contact_person,
    (EXTRACT(epoch FROM (b.confirmation_deadline - now())) / (3600)::numeric) AS hours_until_timeout,
    (now() > b.confirmation_deadline) AS is_overdue
   FROM ((bookings b
     JOIN tours t ON ((b.tour_id = t.id)))
     JOIN operators o ON ((b.operator_id = o.id)))
  WHERE ((b.booking_status)::text = 'pending'::text)
  ORDER BY b.created_at DESC;


CREATE OR REPLACE FUNCTION public.trigger_booking_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_tour_spots(tour_id uuid, spots_change integer)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."booking_conversations" to "anon";

grant insert on table "public"."booking_conversations" to "anon";

grant references on table "public"."booking_conversations" to "anon";

grant select on table "public"."booking_conversations" to "anon";

grant trigger on table "public"."booking_conversations" to "anon";

grant truncate on table "public"."booking_conversations" to "anon";

grant update on table "public"."booking_conversations" to "anon";

grant delete on table "public"."booking_conversations" to "authenticated";

grant insert on table "public"."booking_conversations" to "authenticated";

grant references on table "public"."booking_conversations" to "authenticated";

grant select on table "public"."booking_conversations" to "authenticated";

grant trigger on table "public"."booking_conversations" to "authenticated";

grant truncate on table "public"."booking_conversations" to "authenticated";

grant update on table "public"."booking_conversations" to "authenticated";

grant delete on table "public"."booking_conversations" to "service_role";

grant insert on table "public"."booking_conversations" to "service_role";

grant references on table "public"."booking_conversations" to "service_role";

grant select on table "public"."booking_conversations" to "service_role";

grant trigger on table "public"."booking_conversations" to "service_role";

grant truncate on table "public"."booking_conversations" to "service_role";

grant update on table "public"."booking_conversations" to "service_role";

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."operators" to "anon";

grant insert on table "public"."operators" to "anon";

grant references on table "public"."operators" to "anon";

grant select on table "public"."operators" to "anon";

grant trigger on table "public"."operators" to "anon";

grant truncate on table "public"."operators" to "anon";

grant update on table "public"."operators" to "anon";

grant delete on table "public"."operators" to "authenticated";

grant insert on table "public"."operators" to "authenticated";

grant references on table "public"."operators" to "authenticated";

grant select on table "public"."operators" to "authenticated";

grant trigger on table "public"."operators" to "authenticated";

grant truncate on table "public"."operators" to "authenticated";

grant update on table "public"."operators" to "authenticated";

grant delete on table "public"."operators" to "service_role";

grant insert on table "public"."operators" to "service_role";

grant references on table "public"."operators" to "service_role";

grant select on table "public"."operators" to "service_role";

grant trigger on table "public"."operators" to "service_role";

grant truncate on table "public"."operators" to "service_role";

grant update on table "public"."operators" to "service_role";

grant delete on table "public"."qr_scans" to "anon";

grant insert on table "public"."qr_scans" to "anon";

grant references on table "public"."qr_scans" to "anon";

grant select on table "public"."qr_scans" to "anon";

grant trigger on table "public"."qr_scans" to "anon";

grant truncate on table "public"."qr_scans" to "anon";

grant update on table "public"."qr_scans" to "anon";

grant delete on table "public"."qr_scans" to "authenticated";

grant insert on table "public"."qr_scans" to "authenticated";

grant references on table "public"."qr_scans" to "authenticated";

grant select on table "public"."qr_scans" to "authenticated";

grant trigger on table "public"."qr_scans" to "authenticated";

grant truncate on table "public"."qr_scans" to "authenticated";

grant update on table "public"."qr_scans" to "authenticated";

grant delete on table "public"."qr_scans" to "service_role";

grant insert on table "public"."qr_scans" to "service_role";

grant references on table "public"."qr_scans" to "service_role";

grant select on table "public"."qr_scans" to "service_role";

grant trigger on table "public"."qr_scans" to "service_role";

grant truncate on table "public"."qr_scans" to "service_role";

grant update on table "public"."qr_scans" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."tourist_users" to "anon";

grant insert on table "public"."tourist_users" to "anon";

grant references on table "public"."tourist_users" to "anon";

grant select on table "public"."tourist_users" to "anon";

grant trigger on table "public"."tourist_users" to "anon";

grant truncate on table "public"."tourist_users" to "anon";

grant update on table "public"."tourist_users" to "anon";

grant delete on table "public"."tourist_users" to "authenticated";

grant insert on table "public"."tourist_users" to "authenticated";

grant references on table "public"."tourist_users" to "authenticated";

grant select on table "public"."tourist_users" to "authenticated";

grant trigger on table "public"."tourist_users" to "authenticated";

grant truncate on table "public"."tourist_users" to "authenticated";

grant update on table "public"."tourist_users" to "authenticated";

grant delete on table "public"."tourist_users" to "service_role";

grant insert on table "public"."tourist_users" to "service_role";

grant references on table "public"."tourist_users" to "service_role";

grant select on table "public"."tourist_users" to "service_role";

grant trigger on table "public"."tourist_users" to "service_role";

grant truncate on table "public"."tourist_users" to "service_role";

grant update on table "public"."tourist_users" to "service_role";

grant delete on table "public"."tours" to "anon";

grant insert on table "public"."tours" to "anon";

grant references on table "public"."tours" to "anon";

grant select on table "public"."tours" to "anon";

grant trigger on table "public"."tours" to "anon";

grant truncate on table "public"."tours" to "anon";

grant update on table "public"."tours" to "anon";

grant delete on table "public"."tours" to "authenticated";

grant insert on table "public"."tours" to "authenticated";

grant references on table "public"."tours" to "authenticated";

grant select on table "public"."tours" to "authenticated";

grant trigger on table "public"."tours" to "authenticated";

grant truncate on table "public"."tours" to "authenticated";

grant update on table "public"."tours" to "authenticated";

grant delete on table "public"."tours" to "service_role";

grant insert on table "public"."tours" to "service_role";

grant references on table "public"."tours" to "service_role";

grant select on table "public"."tours" to "service_role";

grant trigger on table "public"."tours" to "service_role";

grant truncate on table "public"."tours" to "service_role";

grant update on table "public"."tours" to "service_role";

create policy "Users can insert messages for their own bookings"
on "public"."booking_conversations"
as permissive
for insert
to public
with check ((((sender_type = 'tourist'::text) AND (auth.uid() IN ( SELECT tu.auth_user_id
   FROM (bookings b
     JOIN tourist_users tu ON ((b.tourist_user_id = tu.id)))
  WHERE (b.id = booking_conversations.booking_id)))) OR ((sender_type = 'operator'::text) AND (auth.uid() IN ( SELECT o.auth_user_id
   FROM (bookings b
     JOIN operators o ON ((b.operator_id = o.id)))
  WHERE (b.id = booking_conversations.booking_id)))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


create policy "Users can update their own booking conversations"
on "public"."booking_conversations"
as permissive
for update
to public
using (((auth.uid() IN ( SELECT tu.auth_user_id
   FROM (bookings b
     JOIN tourist_users tu ON ((b.tourist_user_id = tu.id)))
  WHERE (b.id = booking_conversations.booking_id))) OR (auth.uid() IN ( SELECT o.auth_user_id
   FROM (bookings b
     JOIN operators o ON ((b.operator_id = o.id)))
  WHERE (b.id = booking_conversations.booking_id))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


create policy "Users can view their own booking conversations"
on "public"."booking_conversations"
as permissive
for select
to public
using (((auth.uid() IN ( SELECT tu.auth_user_id
   FROM (bookings b
     JOIN tourist_users tu ON ((b.tourist_user_id = tu.id)))
  WHERE (b.id = booking_conversations.booking_id))) OR (auth.uid() IN ( SELECT o.auth_user_id
   FROM (bookings b
     JOIN operators o ON ((b.operator_id = o.id)))
  WHERE (b.id = booking_conversations.booking_id))) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text)));


create policy "Enable booking creation for everyone"
on "public"."bookings"
as permissive
for insert
to public
with check (true);


create policy "Operators can update booking status"
on "public"."bookings"
as permissive
for update
to public
using (true);


create policy "Operators can view own bookings"
on "public"."bookings"
as permissive
for select
to public
using (true);


create policy "Users can link own bookings by email"
on "public"."bookings"
as permissive
for update
to public
using ((((customer_email)::text = (auth.jwt() ->> 'email'::text)) AND (user_id IS NULL)))
with check (((user_id)::text = (auth.uid())::text));


create policy "Users can link own bookings"
on "public"."bookings"
as permissive
for update
to public
using ((((customer_email)::text = (auth.jwt() ->> 'email'::text)) AND (user_id IS NULL)))
with check (((user_id)::text = (auth.uid())::text));


create policy "Users can view own bookings"
on "public"."bookings"
as permissive
for select
to public
using ((((auth.uid())::text = (user_id)::text) OR (user_id IS NULL)));


create policy "operators_anon_insert"
on "public"."operators"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "operators_anon_select"
on "public"."operators"
as permissive
for select
to anon, authenticated
using (true);


create policy "operators_public_view"
on "public"."operators"
as permissive
for select
to public
using (((status)::text = 'active'::text));


create policy "operators_select_own"
on "public"."operators"
as permissive
for select
to public
using ((auth.uid() = auth_user_id));


create policy "operators_update_own"
on "public"."operators"
as permissive
for update
to public
using ((auth.uid() = auth_user_id));


create policy "Allow anonymous QR tracking"
on "public"."qr_scans"
as permissive
for insert
to public
with check (true);


create policy "Users can view own scans"
on "public"."qr_scans"
as permissive
for select
to public
using (((registration_id = auth.uid()) OR (session_id IN ( SELECT unnest(string_to_array(((current_setting('request.jwt.claims'::text, true))::json ->> 'session_ids'::text), ','::text)) AS unnest))));


create policy "Anyone can view published reviews"
on "public"."reviews"
as permissive
for select
to public
using ((is_published = true));


create policy "Users can manage their own tourist data"
on "public"."tourist_users"
as permissive
for all
to public
using (((auth.uid() = auth_user_id) OR (auth.uid() IS NULL)))
with check (((auth.uid() = auth_user_id) OR (auth.uid() IS NULL)));


create policy "Users can update own profile (with auth linking)"
on "public"."tourist_users"
as permissive
for update
to public
using (((auth.uid() = auth_user_id) OR ((auth.uid())::text = (id)::text)));


create policy "Users can view own profile (with auth linking)"
on "public"."tourist_users"
as permissive
for select
to public
using (((auth.uid() = auth_user_id) OR ((auth.uid())::text = (id)::text)));


create policy "tourist_users_anon_insert"
on "public"."tourist_users"
as permissive
for insert
to anon, authenticated
with check (true);


create policy "tourist_users_anon_select"
on "public"."tourist_users"
as permissive
for select
to anon, authenticated
using (true);


create policy "Allow available_spots updates only"
on "public"."tours"
as permissive
for update
to public
using (true)
with check ((available_spots IS NOT NULL));


create policy "Allow operators to manage their tours"
on "public"."tours"
as permissive
for all
to anon, authenticated
using ((operator_id IN ( SELECT operators.id
   FROM operators
  WHERE (((operators.email)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)) OR (1 = 1)))))
with check ((operator_id IN ( SELECT operators.id
   FROM operators
  WHERE (((operators.email)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)) OR (1 = 1)))));


create policy "Allow public read access for tourists"
on "public"."tours"
as permissive
for select
to anon, authenticated
using (((status)::text = 'active'::text));


create policy "Anyone can view active tours"
on "public"."tours"
as permissive
for select
to public
using ((((status)::text = 'active'::text) AND (available_spots > 0) AND (tour_date >= CURRENT_DATE)));


create policy "Operators can manage own tours"
on "public"."tours"
as permissive
for all
to public
using (((auth.uid())::text = (operator_id)::text));


CREATE TRIGGER booking_webhook_trigger AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION trigger_booking_webhook();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourist_users_updated_at BEFORE UPDATE ON public.tourist_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON public.tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


