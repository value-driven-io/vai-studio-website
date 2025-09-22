## tourist_users table schema

create table public.tourist_users (
  id uuid not null default extensions.uuid_generate_v4 (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  email character varying not null,
  first_name character varying(100) null,
  last_name character varying(100) null,
  whatsapp_number character varying(20) null,
  phone character varying(20) null,
  preferred_language character varying(5) null default 'en'::character varying,
  marketing_emails boolean null default true,
  favorites jsonb null default '[]'::jsonb,
  email_verified boolean null default false,
  status character varying(20) null default 'active'::character varying,
  last_login timestamp with time zone null,
  auth_user_id uuid null,
  last_auth_login timestamp with time zone null,
  constraint tourist_users_pkey primary key (id),
  constraint tourist_users_email_key unique (email),
  constraint tourist_users_auth_user_id_fkey foreign KEY (auth_user_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_tourist_users_auth_user_id on public.tourist_users using btree (auth_user_id) TABLESPACE pg_default;

create trigger update_tourist_users_updated_at BEFORE
update on tourist_users for EACH row
execute FUNCTION update_updated_at_column ();

## tourist_users table example entry

id,created_at,updated_at,email,first_name,last_name,whatsapp_number,phone,preferred_language,marketing_emails,favorites,email_verified,status,last_login,auth_user_id,last_auth_login
f25d9d93-b5f9-4f7c-b7cd-4112ac32efca,2025-09-18 11:16:15.009719+00,2025-09-18 11:25:50.413001+00,k.de_silva@livasdase.de,Kevin,Philip Julian De Silva,1331231231132,,en,true,[],false,active,,f31bc32f-be71-4b3f-ab02-d86301ff11b0,
10fc7e24-9fe5-44cd-a66b-0b84134f0985,2025-09-15 20:55:40.578486+00,2025-09-15 20:55:40.578486+00,test@vai.de,testing,schedule,123213123123,,en,true,[],false,active,,1675636b-1c44-4b8b-827c-233303ca3e7c,