## tours table schema

create table public.tours (
  id uuid not null default extensions.uuid_generate_v4 (),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  operator_id uuid not null,
  tour_name character varying(255) not null,
  tour_type character varying(100) not null,
  description text null,
  tour_date date null,
  time_slot character varying(50) null,
  duration_hours numeric(3, 1) null,
  max_capacity integer not null,
  available_spots integer not null,
  original_price_adult integer not null,
  discount_price_adult integer not null,
  discount_price_child integer null,
  discount_percentage integer GENERATED ALWAYS as (
    case
      when (original_price_adult > 0) then round(
        (
          (
            ((original_price_adult - discount_price_adult))::numeric / (original_price_adult)::numeric
          ) * (100)::numeric
        )
      )
      else (0)::numeric
    end
  ) STORED null,
  meeting_point character varying(255) not null,
  meeting_point_gps point null,
  pickup_available boolean null default false,
  pickup_locations text[] null,
  languages character varying(20) [] null default array['French'::text],
  equipment_included boolean null default false,
  food_included boolean null default false,
  drinks_included boolean null default false,
  whale_regulation_compliant boolean null default false,
  max_whale_group_size integer null default 6,
  min_age integer null,
  max_age integer null,
  fitness_level character varying(50) null,
  requirements text null,
  restrictions text null,
  booking_deadline timestamp with time zone null,
  auto_close_hours integer null default 2,
  status character varying(50) null default 'active'::character varying,
  weather_dependent boolean null default true,
  backup_plan text null,
  special_notes text null,
  created_by_operator boolean null default true,
  location character varying(100) null,
  activity_type character varying(20) null default 'last_minute'::character varying,
  is_template boolean null default false,
  parent_template_id uuid null,
  recurrence_data jsonb null,
  parent_schedule_id uuid null,
  is_customized boolean null default false,
  frozen_fields text[] null default '{}'::text[],
  overrides jsonb null default '{}'::jsonb,
  is_detached boolean null default false,
  promo_discount_percent integer null,
  promo_discount_value integer null,
  instance_note text null,
  customization_timestamp timestamp with time zone null,
  max_age_child integer null default 11,
  discount_percentage_child integer null default 30,
  detached_from_schedule_id uuid null,
  template_cover_image text null,
  constraint tours_pkey primary key (id),
  constraint tours_parent_schedule_id_fkey foreign KEY (parent_schedule_id) references schedules (id) on delete set null,
  constraint tours_parent_template_id_fkey foreign KEY (parent_template_id) references tours (id),
  constraint tours_detached_from_schedule_id_fkey foreign KEY (detached_from_schedule_id) references schedules (id) on delete set null,
  constraint tours_operator_id_fkey foreign KEY (operator_id) references operators (id) on delete CASCADE,
  constraint chk_promo_discount_value check (
    (
      (promo_discount_value is null)
      or (promo_discount_value >= 0)
    )
  ),
  constraint chk_template_no_date check (
    (
      (
        (is_template = true)
        and (tour_date is null)
        and (time_slot is null)
      )
      or (is_template = false)
    )
  ),
  constraint tours_fitness_level_check check (
    (
      (fitness_level)::text = any (
        array[
          ('easy'::character varying)::text,
          ('moderate'::character varying)::text,
          ('challenging'::character varying)::text,
          ('expert'::character varying)::text
        ]
      )
    )
  ),
  constraint tours_location_check check (
    (
      (location)::text = any (
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
  constraint tours_status_check check (
    (
      (status)::text = any (
        (
          array[
            'active'::character varying,
            'sold_out'::character varying,
            'cancelled'::character varying,
            'completed'::character varying,
            'paused'::character varying,
            'hidden'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint chk_activity_type check (
    (
      (activity_type)::text = any (
        (
          array[
            'last_minute'::character varying,
            'template'::character varying,
            'scheduled'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint tours_tour_type_check check (
    (
      (tour_type)::text = any (
        array[
          ('Whale Watching'::character varying)::text,
          ('Snorkeling'::character varying)::text,
          ('Lagoon Tour'::character varying)::text,
          ('Hike'::character varying)::text,
          ('Cultural'::character varying)::text,
          ('Adrenalin'::character varying)::text,
          ('Mindfulness'::character varying)::text,
          ('Culinary Experience'::character varying)::text,
          ('Diving'::character varying)::text
        ]
      )
    )
  ),
  constraint chk_customization_timestamp check (
    (
      (
        (is_customized = false)
        and (customization_timestamp is null)
      )
      or (
        (is_customized = true)
        and (customization_timestamp is not null)
      )
    )
  ),
  constraint chk_discount_percentage_child check (
    (
      (discount_percentage_child >= 0)
      and (discount_percentage_child <= 100)
    )
  ),
  constraint chk_max_age_child check (
    (
      (max_age_child >= 1)
      and (max_age_child <= 17)
    )
  ),
  constraint chk_promo_discount_percent check (
    (
      (promo_discount_percent is null)
      or (
        (promo_discount_percent >= 0)
        and (promo_discount_percent <= 100)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_active_tours_today on public.tours using btree (tour_date, time_slot) TABLESPACE pg_default
where
  (
    ((status)::text = 'active'::text)
    and (available_spots > 0)
  );

create index IF not exists idx_tours_active_available on public.tours using btree (tour_date, available_spots) TABLESPACE pg_default
where
  (
    ((status)::text = 'active'::text)
    and (available_spots > 0)
  );

create index IF not exists idx_tours_available_spots on public.tours using btree (available_spots) TABLESPACE pg_default
where
  (available_spots > 0);

create index IF not exists idx_tours_date_status on public.tours using btree (tour_date, status) TABLESPACE pg_default
where
  ((status)::text = 'active'::text);

create index IF not exists idx_tours_operator on public.tours using btree (operator_id) TABLESPACE pg_default;

create index IF not exists idx_tours_type_island on public.tours using btree (tour_type, operator_id) TABLESPACE pg_default;

create index IF not exists idx_tours_parent_schedule_template on public.tours using btree (parent_schedule_id, parent_template_id) TABLESPACE pg_default
where
  ((activity_type)::text = 'scheduled'::text);

create index IF not exists idx_tours_detached_from_schedule on public.tours using btree (detached_from_schedule_id) TABLESPACE pg_default
where
  (
    (is_detached = true)
    and (parent_schedule_id is null)
  );

create index IF not exists idx_tours_attached_to_schedule on public.tours using btree (parent_schedule_id) TABLESPACE pg_default
where
  (
    (parent_schedule_id is not null)
    and (is_detached = false)
  );

create index IF not exists idx_tours_effective_pricing on public.tours using btree (
  COALESCE(
    ((overrides ->> 'discount_price_adult'::text))::integer,
    discount_price_adult
  )
) TABLESPACE pg_default
where
  (
    (is_template = false)
    and ((status)::text = 'active'::text)
  );

create index IF not exists idx_tours_promotional_pricing on public.tours using btree (promo_discount_percent, promo_discount_value) TABLESPACE pg_default
where
  (
    (is_template = false)
    and ((status)::text = 'active'::text)
    and (
      (promo_discount_percent is not null)
      or (promo_discount_value is not null)
    )
  );

create index IF not exists idx_tours_template_relationship on public.tours using btree (parent_template_id, activity_type) TABLESPACE pg_default
where
  (
    (is_template = false)
    and (parent_template_id is not null)
  );

create index IF not exists idx_tours_schedule_active on public.tours using btree (parent_schedule_id, tour_date) TABLESPACE pg_default
where
  (
    (is_template = false)
    and ((status)::text = 'active'::text)
  );

create index IF not exists idx_tours_activity_type on public.tours using btree (activity_type) TABLESPACE pg_default;

create index IF not exists idx_tours_is_template on public.tours using btree (is_template) TABLESPACE pg_default;

create index IF not exists idx_tours_parent_template_id on public.tours using btree (parent_template_id) TABLESPACE pg_default;

create index IF not exists idx_tours_parent_schedule_id on public.tours using btree (parent_schedule_id) TABLESPACE pg_default;

create index IF not exists idx_tours_is_customized on public.tours using btree (is_customized) TABLESPACE pg_default
where
  (is_customized = true);

create index IF not exists idx_tours_is_detached on public.tours using btree (is_detached) TABLESPACE pg_default
where
  (is_detached = true);

create index IF not exists idx_tours_customization_timestamp on public.tours using btree (customization_timestamp) TABLESPACE pg_default
where
  (customization_timestamp is not null);

create index IF not exists idx_tours_schedule_customization on public.tours using btree (parent_schedule_id, is_customized, tour_date) TABLESPACE pg_default;

create index IF not exists idx_tours_template_scheduled on public.tours using btree (parent_template_id, activity_type, tour_date) TABLESPACE pg_default
where
  ((activity_type)::text = 'scheduled'::text);

create index IF not exists idx_tours_template_discovery on public.tours using btree (
  parent_template_id,
  is_template,
  status,
  tour_date
) TABLESPACE pg_default
where
  (
    (is_template = false)
    and ((status)::text = 'active'::text)
  );

create index IF not exists idx_tours_schedule_overview on public.tours using btree (parent_template_id, tour_date, time_slot) TABLESPACE pg_default
where
  (
    (is_template = false)
    and ((status)::text = 'active'::text)
  );

create index IF not exists idx_tours_template_stats on public.tours using btree (
  parent_template_id,
  status,
  tour_date,
  is_template
) TABLESPACE pg_default;

create trigger auto_populate_schedule_relationship_trigger BEFORE INSERT on tours for EACH row
execute FUNCTION auto_populate_schedule_relationship ();

create trigger auto_set_customization_timestamp_trigger BEFORE
update on tours for EACH row
execute FUNCTION auto_set_customization_timestamp ();

create trigger update_tours_updated_at BEFORE
update on tours for EACH row
execute FUNCTION update_updated_at_column ();

## Template entry example

id,created_at,updated_at,operator_id,tour_name,tour_type,description,tour_date,time_slot,duration_hours,max_capacity,available_spots,original_price_adult,discount_price_adult,discount_price_child,discount_percentage,meeting_point,meeting_point_gps,pickup_available,pickup_locations,languages,equipment_included,food_included,drinks_included,whale_regulation_compliant,max_whale_group_size,min_age,max_age,fitness_level,requirements,restrictions,booking_deadline,auto_close_hours,status,weather_dependent,backup_plan,special_notes,created_by_operator,location,activity_type,is_template,parent_template_id,recurrence_data,parent_schedule_id,is_customized,frozen_fields,overrides,is_detached,promo_discount_percent,promo_discount_value,instance_note,customization_timestamp,max_age_child,discount_percentage_child,detached_from_schedule_id,template_cover_image
795569b4-1921-4943-976f-4bb48fd75f28,2025-09-15 12:44:51.173188+00,2025-09-17 02:06:19.314734+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Swim with the Whales,Whale Watching,We go out of the lagoon to find the beautiful humpback around our island. Come and make some unforgettable experiences.,,,4.5,14,14,21000,21000,14700,0,Coco Beach,,true,"[""Hotel Hilton"",""Hotel Sofitel"",""Hotel Manava""]","[""French"",""en"",""fr"",""es"",""de"",""it"",""ja"",""ty""]",true,true,true,true,6,5,65,moderate,Ideally you bring your own mask to make sure you are comfortable,"Everybody can participate, just be careful",,2,active,true,We will do a lagoon tour instead,These are special notes - hello test,true,Moorea,template,true,,,,false,[],{},false,,,,,2,30,,
b8ce19ea-4361-4077-b5de-c63324e56e6a,2025-09-15 12:41:47.141933+00,2025-09-15 12:41:47.141933+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Traditional Cooking Workshop,Culinary Experience,"Learn how to prepare Poisson Cru, become a master in opening a coconut. Understand the power of local fruits and plants",,,4.0,8,8,26000,26000,20800,0,Punauia,,true,"[""Aremiti Ferry Terminal""]","[""French"",""en"",""ty"",""es"",""fr""]",false,true,false,false,6,,,easy,,,,2,active,true,,,true,Tahiti,template,true,,,,false,[],{},false,,,,,7,20,,
e8fd6a14-953f-4f92-b64c-632fa4df6a01,2025-09-15 12:39:40.974541+00,2025-09-15 12:39:40.974541+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Sunset Lagoon Tour,Lagoon Tour,Dive into the beauty of Mooreas Lagoon. Swim with sharks and ray while the sun is kissing the horizon,,,5.0,10,10,18000,18000,12600,0,Mareto Beach,,true,"[""Manava Hotel"",""Hilton""]","[""French"",""en"",""fr"",""de""]",false,false,true,false,6,,,easy,,,,2,active,true,,,true,Moorea,template,true,,,,false,[],{},false,,,,,5,30,,

## Different Activity Instance Examples (customized, detached and "normal" activity instances):

id,created_at,updated_at,operator_id,tour_name,tour_type,description,tour_date,time_slot,duration_hours,max_capacity,available_spots,original_price_adult,discount_price_adult,discount_price_child,discount_percentage,meeting_point,meeting_point_gps,pickup_available,pickup_locations,languages,equipment_included,food_included,drinks_included,whale_regulation_compliant,max_whale_group_size,min_age,max_age,fitness_level,requirements,restrictions,booking_deadline,auto_close_hours,status,weather_dependent,backup_plan,special_notes,created_by_operator,location,activity_type,is_template,parent_template_id,recurrence_data,parent_schedule_id,is_customized,frozen_fields,overrides,is_detached,promo_discount_percent,promo_discount_value,instance_note,customization_timestamp,max_age_child,discount_percentage_child,detached_from_schedule_id,template_cover_image
463dcea7-80b4-47da-9382-f7fa3b02d0ea,2025-09-15 12:45:29.971949+00,2025-09-18 02:57:13.114959+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Sunset Lagoon Tour,Lagoon Tour,Dive into the beauty of Mooreas Lagoon. Swim with sharks and ray while the sun is kissing the horizon,2025-09-20,16:00,5.0,10,10,18000,18000,12600,0,Mareto Beach,,true,"[""Manava Hotel"",""Hilton""]","[""French"",""en"",""fr"",""de""]",false,false,true,false,6,,,easy,,,,2,active,true,,,true,Moorea,scheduled,false,e8fd6a14-953f-4f92-b64c-632fa4df6a01,,,false,[],"{""detached_at"": ""2025-09-18 02:57:13.114959+00"", ""detach_reason"": ""Manual detachment""}",true,,,,,11,30,cbc008c0-157f-4bc1-8f7f-90ebc367238b,
3f55297f-239a-4438-aec1-6a124e856e24,2025-09-16 10:48:21.434872+00,2025-09-17 04:52:57.391213+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Swim with the Whales,Whale Watching,We go out of the lagoon to find the beautiful humpback around our island. Come and make some unforgettable experiences.,2025-09-22,06:00,4.5,12,12,21000,18000,10000,14,Ferry Terminal,,true,"[""Hotel Hilton"",""Hotel Sofitel"",""Hotel Manava""]","[""French"",""en"",""fr"",""es"",""de""]",true,false,false,true,6,5,65,moderate,Ideally you bring your own mask to make sure you are comfortable,,,2,active,true,,Special note for internal use,true,Moorea,scheduled,false,795569b4-1921-4943-976f-4bb48fd75f28,,bfcafb30-f28c-42f0-a4c8-ce9342380cc7,true,"[""meeting_point""]","{""time_slot"": ""10:00"", ""max_capacity"": 12, ""instance_note"": ""This is another note for customized tours"", ""meeting_point"": ""Ferry Terminal"", ""special_notes"": ""Special note for internal use"", ""discount_price_adult"": 18000, ""discount_price_child"": 10000, ""promo_discount_value"": null, ""promo_discount_percent"": null}",false,,,This is another note for customized tours,2025-09-17 04:52:57.391213+00,11,30,,
1d73f3d2-9547-46b0-b5cb-ec9a4295a7e4,2025-09-16 10:48:46.838122+00,2025-09-16 10:48:46.838122+00,c78f7f64-cab8-4f48-9427-de87e12ec2b9,Traditional Cooking Workshop,Culinary Experience,"Learn how to prepare Poisson Cru, become a master in opening a coconut. Understand the power of local fruits and plants",2025-09-19,11:00,4.0,8,8,26000,26000,20800,0,Punauia,,true,"[""Aremiti Ferry Terminal""]","[""French"",""en"",""ty"",""es"",""fr""]",false,true,false,false,6,,,easy,,,,2,active,true,,,true,Tahiti,scheduled,false,b8ce19ea-4361-4077-b5de-c63324e56e6a,,437c616b-b893-479a-a6f5-6779af5b2e89,false,[],{},false,,,,,11,30,,

