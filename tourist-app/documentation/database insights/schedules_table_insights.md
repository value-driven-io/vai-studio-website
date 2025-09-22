## schedules table schema

create table public.schedules (
  id uuid not null default gen_random_uuid (),
  tour_id uuid null,
  operator_id uuid not null,
  recurrence_type text not null,
  days_of_week integer[] null,
  start_time time without time zone not null,
  start_date date not null,
  end_date date not null,
  exceptions date[] null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  template_id uuid null,
  schedule_type public.schedule_type null default 'template_based'::schedule_type,
  is_paused boolean null default false,
  paused_at timestamp with time zone null,
  paused_by uuid null,
  constraint schedules_pkey primary key (id),
  constraint schedules_operator_id_fkey foreign KEY (operator_id) references operators (id) on delete CASCADE,
  constraint schedules_paused_by_fkey foreign KEY (paused_by) references operators (id),
  constraint schedules_template_id_fkey foreign KEY (template_id) references tours (id) on delete CASCADE,
  constraint schedules_tour_id_fkey foreign KEY (tour_id) references tours (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_schedules_template_id on public.schedules using btree (template_id) TABLESPACE pg_default;

create index IF not exists idx_schedule_details_lookup on public.schedules using btree (operator_id, schedule_type, template_id) TABLESPACE pg_default;

create index IF not exists idx_schedules_is_paused on public.schedules using btree (is_paused) TABLESPACE pg_default;

create index IF not exists idx_schedules_paused_by on public.schedules using btree (paused_by) TABLESPACE pg_default
where
  (paused_by is not null);

create trigger validate_schedule_consistency_trigger BEFORE INSERT
or
update on schedules for EACH row
execute FUNCTION validate_schedule_consistency ();


## schedules example entries

id,tour_id,operator_id,recurrence_type,days_of_week,start_time,start_date,end_date,exceptions,created_at,updated_at,template_id,schedule_type,is_paused,paused_at,paused_by
437c616b-b893-479a-a6f5-6779af5b2e89,,c78f7f64-cab8-4f48-9427-de87e12ec2b9,weekly,"[""3"",""4"",""5""]",11:00:00,2025-09-17,2025-10-01,[],2025-09-16 10:48:46.215842+00,2025-09-16 10:48:46.215842+00,b8ce19ea-4361-4077-b5de-c63324e56e6a,template_based,false,,
bfcafb30-f28c-42f0-a4c8-ce9342380cc7,,c78f7f64-cab8-4f48-9427-de87e12ec2b9,weekly,"[""1"",""5"",""7""]",06:00:00,2025-09-17,2025-10-05,[],2025-09-16 10:48:20.743507+00,2025-09-16 10:48:20.743507+00,795569b4-1921-4943-976f-4bb48fd75f28,template_based,false,,