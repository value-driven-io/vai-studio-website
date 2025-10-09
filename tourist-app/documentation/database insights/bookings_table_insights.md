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

id,created_at,updated_at,tour_id,operator_id,customer_name,customer_email,customer_phone,customer_whatsapp,num_adults,num_children,total_participants,adult_price,child_price,subtotal,commission_amount,total_amount,special_requirements,dietary_restrictions,accessibility_needs,booking_status,payment_status,confirmation_deadline,confirmed_at,cancelled_at,operator_response,booking_reference,webhook_sent,whatsapp_sent,email_sent,operator_whatsapp_sent_at,operator_response_received_at,operator_response_method,confirmation_email_sent_at,timeout_alert_sent_at,decline_reason,operator_confirmation_sent,operator_confirmation_sent_at,applied_commission_rate,commission_locked_at,user_id,tourist_user_id,schedule_id,booking_date,payment_intent_id,stripe_fee,stripe_charge_id,payment_captured_at,tour_completed_at,payout_scheduled_at,payout_transfer_id,payout_status,operator_amount_cents,platform_fee_cents
0aff0069-1345-47bf-a1b4-36b7947029d4,2025-09-30 23:40:52.632236+00,2025-10-07 21:59:41.64613+00,d9e76cb0-5397-4b1f-a195-55c53e67cca5,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,hello@vai.studio,,,1,0,1,26000,20800,23140,2860,26000,,,,completed,paid,2025-10-01 23:40:52.382+00,2025-09-30 23:42:29.427+00,,COMPLETED,VAI-1759275652382-250930,false,false,false,,2025-10-07 21:59:41.101+00,dashboard,,,,false,,11.00,2025-09-30 23:42:32.645,,1d75ff61-fce4-4725-aacd-63da47ca9aef,3f8d1da4-e117-452c-81b3-a15a94a4fa0f,2025-09-30,pi_3SDDA6EAOphBIIb60q4MZHTr,746,,2025-09-30 23:42:32.327+00,,,,pending,,
145ec657-0241-47ed-af97-0836dc66ba22,2025-10-07 07:45:38.184703+00,2025-10-07 07:49:00.051082+00,3bdadc28-beb3-49a5-a0fb-59ef89dfee2a,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,hello@vai.studio,,,1,2,3,26000,20800,60164,7436,67600,,,,confirmed,paid,2025-10-08 07:45:37.559+00,2025-10-07 07:48:56.802+00,,CONFIRMED,VAI-1759823137559-251007,false,false,false,,2025-10-07 07:48:56.802+00,dashboard,,,,false,,11.00,2025-10-07 07:48:59.17,,1d75ff61-fce4-4725-aacd-63da47ca9aef,8f9eafc7-331c-48f7-a9c9-c58334984826,2025-10-07,pi_3SFVaWEAOphBIIb60pYo8Z5p,1892,,2025-10-07 07:48:58.835+00,,,,pending,,
47e18fdf-43fc-4949-8396-800266979036,2025-09-24 15:03:55.292411+00,2025-09-24 15:03:55.292411+00,11467963-8274-4f65-8d73-082eace391ee,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Marie Dubois,marie.dubois@example.fr,+33 6 12 34 56 78,+33 6 12 34 56 78,2,1,3,21000,14700,56700,6237,62937,Vegetarian lunch option requested. One adult has mild motion sickness.,,,pending,pending,,,,,GYG-GYG-MOOREA-789456,false,false,false,,,,,,,false,,11.00,,,,,2025-09-24,,0,,,,,,pending,,
611aef86-e888-41b1-b756-feb3295dd695,2025-09-22 10:07:55.064899+00,2025-09-22 10:07:55.369527+00,d4f8a243-e7d6-4c9e-9a26-6e08d1681636,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,k.de_silva@live.de,,,1,0,1,18000,15500,16020,1980,18000,,,,pending,authorized,2025-09-23 10:07:54.633+00,,,,VAI-1758535674633-250922,false,false,false,,,,,,,false,,11.00,,,f254d93a-5684-4f38-ad7a-b34f4359023c,8f9eafc7-331c-48f7-a9c9-c58334984826,2025-09-22,pi_3SA6ezEAOphBIIb60V4gNjpB,0,,,,,,pending,,
864b4c29-de21-4e92-a3ab-b51d8de8f1a0,2025-09-30 03:59:49.31844+00,2025-09-30 03:59:49.811053+00,d9e76cb0-5397-4b1f-a195-55c53e67cca5,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,k.de_silva@live.de,,,1,1,2,26000,20800,41652,5148,46800,,,,pending,authorized,2025-10-01 03:59:48.938+00,,,,VAI-1759204788938-250930,false,false,false,,,,,,,false,,11.00,,,f254d93a-5684-4f38-ad7a-b34f4359023c,3f8d1da4-e117-452c-81b3-a15a94a4fa0f,2025-09-30,pi_3SCuj8EAOphBIIb60uzO11fb,0,,,,,,pending,,
aed18752-ef93-48dd-b106-55626d84758a,2025-09-22 07:18:17.357431+00,2025-09-22 07:29:27.965511+00,5ba202ac-b5e9-4026-8136-3b402017c446,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,k.de_silva@live.de,,,1,2,3,18000,12600,38448,4752,43200,,,,confirmed,paid,2025-09-23 07:18:16.901+00,2025-09-22 07:29:26.904+00,,CONFIRMED,VAI-1758525496901-250922,false,false,false,,2025-09-22 07:29:26.904+00,dashboard,,,,false,,11.00,2025-09-22 07:29:27.216,,f254d93a-5684-4f38-ad7a-b34f4359023c,4683af64-1e57-4675-ac06-015424080aea,2025-09-22,pi_3SA40pEAOphBIIb606dmnAF9,1219,,2025-09-22 07:29:09.109+00,,,,pending,,
f3aa110f-6c24-4f3b-b018-ca645ca956e7,2025-09-22 21:20:02.247161+00,2025-09-22 21:20:02.761564+00,d4f8a243-e7d6-4c9e-9a26-6e08d1681636,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Kevin De Silva,hello@vai.studio,,,1,1,2,18000,15500,29815,3685,33500,,,,pending,authorized,2025-09-23 21:20:01.043+00,,,,VAI-1758576001043-250922,false,false,false,,,,,,,false,,11.00,,,1d75ff61-fce4-4725-aacd-63da47ca9aef,8f9eafc7-331c-48f7-a9c9-c58334984826,2025-09-22,pi_3SAH9NEAOphBIIb60d6zSbl7,0,,,,,,pending,,