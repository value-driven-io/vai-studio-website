## booking_conversations table schema

create table public.booking_conversations (
  id uuid not null default gen_random_uuid (),
  booking_id uuid not null,
  sender_type text not null,
  sender_id uuid not null,
  message_text text not null,
  is_read boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint booking_conversations_pkey primary key (id),
  constraint booking_conversations_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE,
  constraint booking_conversations_sender_type_check check (
    (
      sender_type = any (
        array['tourist'::text, 'operator'::text, 'admin'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_conversations_booking_id on public.booking_conversations using btree (booking_id) TABLESPACE pg_default;

create index IF not exists idx_conversations_unread on public.booking_conversations using btree (booking_id, is_read) TABLESPACE pg_default
where
  (not is_read);

## booking_conversations example table entry

id,booking_id,sender_type,sender_id,message_text,is_read,created_at
ede85132-ba52-421c-b22d-e98dbb2c700c,0c91eead-7e2c-4a15-ab33-2a3ff0c67e7a,operator,5e898da3-68e8-41a5-a09a-7558a589088e,hey how are you?,false,2025-09-18 21:25:10.537+00