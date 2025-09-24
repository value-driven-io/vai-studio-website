## booking table schema

create table public.bookings (
  id uuid not null default extensions.uuid_generate_v4 (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  tour_id uuid not null,
  operator_id uuid not null,
  customer_name character varying(255) not null,
  customer_email character varying(255) not null,
  customer_phone character varying(50) not null,
  customer_whatsapp character varying(50) not null,
  num_adults integer not null default 1,
  num_children integer not null default 0,
  total_participants integer GENERATED ALWAYS as ((num_adults + num_children)) STORED null,
  adult_price integer not null,
  child_price integer null,
  subtotal integer not null,
  commission_amount integer not null,
  total_amount integer GENERATED ALWAYS as ((subtotal + commission_amount)) STORED null,
  special_requirements text null,
  dietary_restrictions text null,
  accessibility_needs text null,
  booking_status character varying(50) null default 'pending'::character varying,
  payment_status character varying(50) null default 'pending'::character varying,
  confirmation_deadline timestamp with time zone null,
  confirmed_at timestamp with time zone null,
  cancelled_at timestamp with time zone null,
  operator_response text null,
  booking_reference character varying(50) null,
  webhook_sent boolean null default false,
  whatsapp_sent boolean null default false,
  email_sent boolean null default false,
  operator_whatsapp_sent_at timestamp with time zone null,
  operator_response_received_at timestamp with time zone null,
  operator_response_method character varying(50) null,
  confirmation_email_sent_at timestamp with time zone null,
  timeout_alert_sent_at timestamp with time zone null,
  decline_reason text null,
  operator_confirmation_sent boolean null default false,
  operator_confirmation_sent_at timestamp with time zone null,
  applied_commission_rate numeric(5, 2) null,
  commission_locked_at timestamp without time zone null,
  user_id uuid null,
  tourist_user_id uuid null,
  schedule_id uuid null,
  booking_date date null,
  payment_intent_id character varying(255) null,
  stripe_fee integer null default 0,
  stripe_charge_id character varying(255) null,
  payment_captured_at timestamp with time zone null,
  tour_completed_at timestamp with time zone null,
  payout_scheduled_at timestamp with time zone null,
  payout_transfer_id character varying(255) null,
  payout_status character varying(50) null default 'pending'::character varying,
  operator_amount_cents integer null,
  platform_fee_cents integer null,
  constraint bookings_pkey primary key (id),
  constraint bookings_booking_reference_key unique (booking_reference),
  constraint bookings_tour_id_fkey foreign KEY (tour_id) references tours (id) on delete CASCADE,
  constraint bookings_user_id_fkey foreign KEY (user_id) references tourist_users (id) on delete set null,
  constraint bookings_operator_id_fkey foreign KEY (operator_id) references operators (id),
  constraint bookings_tourist_user_id_fkey foreign KEY (tourist_user_id) references tourist_users (id),
  constraint bookings_schedule_id_fkey foreign KEY (schedule_id) references schedules (id) on delete set null,
  constraint check_applied_commission_rate check (
    (
      (applied_commission_rate >= (0)::numeric)
      and (applied_commission_rate <= (50)::numeric)
    )
  ),
  constraint bookings_booking_status_check check (
    (
      (booking_status)::text = any (
        array[
          ('pending'::character varying)::text,
          ('confirmed'::character varying)::text,
          ('declined'::character varying)::text,
          ('cancelled'::character varying)::text,
          ('completed'::character varying)::text,
          ('no_show'::character varying)::text
        ]
      )
    )
  ),
  constraint bookings_num_adults_check check ((num_adults >= 0)),
  constraint bookings_num_children_check check ((num_children >= 0)),
  constraint bookings_payment_status_check check (
    (
      (payment_status)::text = any (
        array[
          ('pending'::character varying)::text,
          ('authorized'::character varying)::text,
          ('paid'::character varying)::text,
          ('refunded'::character varying)::text,
          ('failed'::character varying)::text
        ]
      )
    )
  ),
  constraint bookings_payout_status_check check (
    (
      (payout_status)::text = any (
        (
          array[
            'pending'::character varying,
            'scheduled'::character varying,
            'processing'::character varying,
            'paid'::character varying,
            'failed'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_bookings_commission_locked on public.bookings using btree (commission_locked_at, booking_status) TABLESPACE pg_default;

create index IF not exists idx_bookings_created_date on public.bookings using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_bookings_customer_email on public.bookings using btree (customer_email) TABLESPACE pg_default;

create index IF not exists idx_bookings_operator on public.bookings using btree (operator_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_status on public.bookings using btree (booking_status) TABLESPACE pg_default;

create index IF not exists idx_bookings_timeout_check on public.bookings using btree (confirmation_deadline, booking_status) TABLESPACE pg_default
where
  ((booking_status)::text = 'pending'::text);

create index IF not exists idx_bookings_tour on public.bookings using btree (tour_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_user_id on public.bookings using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_workflow_pending on public.bookings using btree (created_at, booking_status) TABLESPACE pg_default
where
  ((booking_status)::text = 'pending'::text);

create index IF not exists idx_bookings_payment_intent_id on public.bookings using btree (payment_intent_id) TABLESPACE pg_default;

create index IF not exists idx_bookings_payment_captured on public.bookings using btree (payment_captured_at) TABLESPACE pg_default
where
  (payment_captured_at is not null);

create index IF not exists idx_bookings_payout_scheduled on public.bookings using btree (payout_scheduled_at) TABLESPACE pg_default
where
  (payout_scheduled_at is not null);

create index IF not exists idx_bookings_tour_completed on public.bookings using btree (tour_completed_at) TABLESPACE pg_default
where
  (tour_completed_at is not null);

create trigger booking_webhook_trigger
after INSERT
or
update on bookings for EACH row
execute FUNCTION trigger_booking_webhook ();

create trigger restore_availability_trigger
after
update on bookings for EACH row
execute FUNCTION restore_tour_availability ();

create trigger trigger_create_booking_notification
after INSERT on bookings for EACH row
execute FUNCTION create_booking_notification ();

create trigger update_bookings_updated_at BEFORE
update on bookings for EACH row
execute FUNCTION update_updated_at_column ();

## booking sample entry
