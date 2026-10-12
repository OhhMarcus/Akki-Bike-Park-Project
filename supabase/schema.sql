-- AKKI Bike Park: Postgres schema matching src/types (camelCase there, snake_case here).
-- Times are Hong Kong local (date + time without zone); money is whole HKD.

create extension if not exists "pgcrypto";

create type booking_source as enum ('website', 'klook', 'whatsapp', 'walkin');
create type booking_kind as enum ('lesson', 'pump', 'event');
create type slot_scope as enum ('all', 'pump', 'lessons');
create type block_reason as enum ('maintenance', 'private', 'weather', 'event', 'other');
create type warning_code as enum ('black_rain', 'red_rain', 'amber_rain', 't8', 't3', 'very_hot', 'thunderstorm');

create table lessons (
  id text primary key,                         -- 'foundation' | 'advanced'
  name_en text not null, name_zh text not null,
  level text not null, duration_min int not null default 120,
  capacity int not null default 8, min_age int not null default 8,
  price_hkd int not null
);

create table coaches (
  id text primary key, name_en text not null, name_zh text not null,
  role_en text, role_zh text, languages text[] not null default '{}', photo_url text
);

create table lesson_templates (                -- recurring weekly lesson times
  id text primary key, lesson_id text references lessons, weekday smallint not null check (weekday between 0 and 6),
  start_time time not null, language text not null check (language in ('en','yue')),
  coach_id text references coaches, capacity int not null, active boolean not null default true
);

create table pump_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  open boolean not null, start_time time not null, end_time time not null
);

create table schedule_settings (
  id int primary key default 1 check (id = 1),
  slot_minutes int not null default 60, slot_capacity int not null default 12
);

create table blocks (                          -- maintenance, private hire, event days, weather closures
  id uuid primary key default gen_random_uuid(), date date not null, start_time time, end_time time,
  scope slot_scope not null default 'all', reason block_reason not null, note text, closure_id uuid
);

create table riders (
  id uuid primary key default gen_random_uuid(), name text not null, phone text unique not null, email text,
  age int, height_cm int, experience text, club_member boolean not null default false, notes text,
  created_at timestamptz not null default now()
);

create table pack_holdings (
  id uuid primary key default gen_random_uuid(), rider_id uuid references riders on delete cascade,
  lesson_id text references lessons, total int not null, remaining int not null check (remaining >= 0),
  purchased_on date not null, expires_on date not null
);

create table events (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  type text not null check (type in ('race','nightjam','groupride','kidscamp')),
  title_en text not null, title_zh text not null, summary_en text, summary_zh text, body_en text, body_zh text,
  date date not null, start_time time not null, end_time time not null,
  photo_url text, published boolean not null default false, created_at timestamptz not null default now()
);

create table event_categories (
  id text primary key, event_id uuid references events on delete cascade,
  name_en text not null, name_zh text not null, ages_en text, ages_zh text,
  capacity int not null, price_hkd int not null default 0
);

-- target_id: lesson session id (les_<lesson>_<date>_<HHmm>), pump slot id (pt_<date>_<HHmm>) or event id.
-- Sessions and slots are derived from templates/hours, so bookings reference them by these stable ids.
create table bookings (
  id uuid primary key default gen_random_uuid(), ref text unique not null,
  kind booking_kind not null, target_id text not null, event_category_id text references event_categories,
  date date not null, start_time time not null, end_time time not null,
  rider_id uuid references riders, rider_name text not null, phone text not null,
  riders int not null check (riders > 0),
  rentals jsonb not null default '{"bikes":{},"helmets":0}',
  source booking_source not null,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled')),
  payment text not null default 'unpaid' check (payment in ('paid','unpaid','refunded')),
  attendance text not null default 'pending' check (attendance in ('pending','attended','no_show')),
  price_hkd int not null, used_pack boolean not null default false,
  external_ref text,                            -- e.g. Klook order number
  payment_provider_ref text,                    -- Stripe / PayMe / FPS reference, never card data
  notes text, waiver_signed boolean not null default false,
  flag_closure_id uuid, flag_notified boolean,
  created_at timestamptz not null default now()
);
create index on bookings (target_id) where status = 'confirmed';
create index on bookings (date);

create table waivers (
  id uuid primary key default gen_random_uuid(), booking_id uuid references bookings on delete cascade,
  signer_name text not null, guardian boolean not null default false, signature_png text not null,
  version text not null, signed_at timestamptz not null default now()
);

create table closures (
  id uuid primary key default gen_random_uuid(), date date not null, start_time time, end_time time,
  warning warning_code not null, message_en text not null, message_zh text not null,
  message_sent boolean not null default false, reopened_at timestamptz, created_at timestamptz not null default now()
);

create table club_applications (
  id uuid primary key default gen_random_uuid(), name text not null, phone text not null, email text not null,
  age int not null, level text not null, created_at timestamptz not null default now()
);

-- Capacity: run inside a transaction when booking/moving:
--   select coalesce(sum(riders),0) from bookings where target_id = $1 and status = 'confirmed' for update;
-- and reject when booked + requested > capacity (same rule as src/lib/services.ts).

alter table riders enable row level security;
alter table pack_holdings enable row level security;
alter table bookings enable row level security;
alter table waivers enable row level security;
alter table club_applications enable row level security;
alter table events enable row level security;
create policy "public reads published events" on events for select using (published);
