## operator table schema

create table public.operators (
  id uuid not null default extensions.uuid_generate_v4 (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  company_name character varying(255) not null,
  contact_person character varying(255) null,
  email character varying(255) not null,
  phone character varying(50) null,
  whatsapp_number character varying(50) null,
  island character varying(100) not null,
  address text null,
  business_license character varying(255) null,
  insurance_certificate character varying(255) null,
  whale_tour_certified boolean null default false,
  status character varying(50) null default 'pending'::character varying,
  commission_rate numeric(5, 2) not null default 10.00,
  password_hash character varying(255) null,
  last_login timestamp with time zone null,
  notes text null,
  total_tours_completed integer null default 0,
  average_rating numeric(3, 2) null default 0.00,
  auth_user_id uuid null,
  email_verified boolean null default false,
  last_auth_login timestamp with time zone null,
  auth_setup_completed boolean null default false,
  temp_password character varying(255) null,
  business_description text null,
  preferred_language character varying null default 'fr'::character varying,
  operator_role character varying(50) null default 'onboarding'::character varying,
  stripe_connect_account_id character varying(255) null,
  stripe_connect_status character varying(50) null default 'not_connected'::character varying,
  stripe_onboarding_complete boolean null default false,
  stripe_charges_enabled boolean null default false,
  stripe_payouts_enabled boolean null default false,
  onboarding_completed_at timestamp with time zone null,
  onboarding_dismissed_at timestamp with time zone null,
  admin_force_onboarding boolean null default false,
  operator_logo text null,
  constraint operators_pkey primary key (id),
  constraint operators_email_key unique (email),
  constraint operators_auth_user_id_fkey foreign KEY (auth_user_id) references auth.users (id),
  constraint operators_island_check check (
    (
      (island)::text = any (
        array[
          ('Tahiti'::character varying)::text,
          ('Moorea'::character varying)::text,
          ('Bora Bora'::character varying)::text,
          ('Huahine'::character varying)::text,
          ('Raiatea'::character varying)::text,
          ('Taha''a'::character varying)::text,
          ('Maupiti'::character varying)::text,
          ('Tikehau'::character varying)::text,
          ('Rangiroa'::character varying)::text,
          ('Fakarava'::character varying)::text,
          ('Nuku Hiva'::character varying)::text,
          ('Other'::character varying)::text
        ]
      )
    )
  ),
  constraint operators_status_check check (
    (
      (status)::text = any (
        array[
          ('pending'::character varying)::text,
          ('active'::character varying)::text,
          ('suspended'::character varying)::text,
          ('inactive'::character varying)::text
        ]
      )
    )
  ),
  constraint operators_stripe_connect_status_check check (
    (
      (stripe_connect_status)::text = any (
        (
          array[
            'not_connected'::character varying,
            'pending'::character varying,
            'connected'::character varying,
            'rejected'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_operators_auth_user_id on public.operators using btree (auth_user_id) TABLESPACE pg_default;

create index IF not exists idx_operators_email_auth on public.operators using btree (email, auth_user_id) TABLESPACE pg_default;

create index IF not exists idx_operators_email_status on public.operators using btree (email, status) TABLESPACE pg_default;

create index IF not exists idx_operators_island on public.operators using btree (island) TABLESPACE pg_default;

create index IF not exists idx_operators_preferred_language on public.operators using btree (preferred_language) TABLESPACE pg_default;

create index IF not exists idx_operators_status on public.operators using btree (status) TABLESPACE pg_default;

create index IF not exists idx_operators_stripe_account on public.operators using btree (stripe_connect_account_id) TABLESPACE pg_default
where
  (stripe_connect_account_id is not null);

create index IF not exists idx_operators_logo on public.operators using btree (operator_logo) TABLESPACE pg_default
where
  (operator_logo is not null);

create index IF not exists idx_operators_onboarding_status on public.operators using btree (
  onboarding_completed_at,
  onboarding_dismissed_at,
  admin_force_onboarding
) TABLESPACE pg_default;

create trigger update_operators_updated_at BEFORE
update on operators for EACH row
execute FUNCTION update_operators_updated_at ();


## operator example table entry

id,created_at,updated_at,company_name,contact_person,email,phone,whatsapp_number,island,address,business_license,insurance_certificate,whale_tour_certified,status,commission_rate,password_hash,last_login,notes,total_tours_completed,average_rating,auth_user_id,email_verified,last_auth_login,auth_setup_completed,temp_password,business_description,preferred_language,operator_role,stripe_connect_account_id,stripe_connect_status,stripe_onboarding_complete,stripe_charges_enabled,stripe_payouts_enabled,onboarding_completed_at,onboarding_dismissed_at,admin_force_onboarding,operator_logo
c78f7f64-cab8-4f48-9427-de87e12ec2b9,2025-08-13 04:16:17.336114+00,2025-09-18 02:56:30.549958+00,Moorea Adventures,Manuia Stevenson (Test),projectdesilva@gmail.com,,+4917662636327,Tahiti,,,,false,active,11.00,,,"{""tourist_user_id"":""72c4dcd9-2f86-45d0-8185-b37c1cb8e715"",""registration_source"":""operator_dashboard_app"",""registration_date"":""2025-08-13T04:16:16.809Z"",""auth_created"":true,""temp_password_set"":true,""immediate_login_enabled"":true,""islands_served"":""Tahiti"",""tour_types_offered"":[""Other""],""languages"":[""French""],""primary_language"":""en"",""target_bookings_monthly"":"""",""customer_type_preference"":"""",""marketing_emails"":true,""terms_accepted"":true,""terms_accepted_date"":""2025-08-13T04:16:16.809Z"",""founding_member"":true,""existing_tourist"":false,""application_number"":552675}",0,0.00,5e898da3-68e8-41a5-a09a-7558a589088e,false,2025-09-18 02:56:30.02+00,true,,Tour operator in French Polynesia (description placeholder),fr,onboarding,acct_1S2oVzCxmSlFadqi,connected,true,true,true,,,false,