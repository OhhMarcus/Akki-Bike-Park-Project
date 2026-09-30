-- AKKI Bike Park: Supabase schema (Postgres). Run in the Supabase SQL editor.
-- Card details are NEVER stored: only provider payment ids.

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key references auth.users on delete cascade,
  email text not null, name text, phone text,
  role text not null default 'rider' check (role in ('rider','staff','admin')),
  language text not null default 'zh', marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table rider_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid references users on delete cascade,
  name text not null, age int not null check (age between 3 and 99),
  level text not null check (level in ('beginner','intermediate','advanced')),
  emergency_contact_name text not null, emergency_contact_phone text not null
);

create table guardians (
  id uuid primary key default gen_random_uuid(), rider_profile_id uuid references rider_profiles on delete cascade,
  name text not null, relationship text not null, phone text not null, email text not null,
  consent_given boolean not null default false, consent_at timestamptz
);

create table experiences (
  id text primary key, name_en text not null, name_zh text not null, price_hkd int not null,
  pricing_unit text not null default 'person', min_participants int not null default 1, max_participants int not null default 8,
  active boolean not null default true
);

create table time_slots (
  id text primary key, date date not null, period text not null check (period in ('morning','afternoon','fullday')),
  start_time time not null, end_time time not null, capacity int not null, booked int not null default 0, blocked boolean not null default false,
  unique (date, period)
);

create table events (
  id uuid primary key default gen_random_uuid(), slug text unique not null, type text not null,
  title_en text not null, title_zh text not null, summary_en text, summary_zh text, description_en text, description_zh text,
  date date not null, start_time time, end_time time, level text, min_age int default 0, max_age int,
  capacity int not null, registration_deadline date, price_hkd int, is_demo boolean not null default false, published boolean not null default false
);

create table bookings (
  id uuid primary key default gen_random_uuid(), reference text unique not null,
  experience_id text references experiences, event_id uuid references events,
  date date not null, period text not null,
  contact_name text not null, contact_email text not null, contact_phone text not null,
  status text not null default 'pending', payment_status text not null default 'unpaid',
  payment_provider text, payment_provider_id text,  -- provider reference only, never card data
  subtotal int not null, discount int not null default 0, total int not null, promo_code text,
  terms_accepted boolean not null, marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table booking_participants (
  id uuid primary key default gen_random_uuid(), booking_id uuid references bookings on delete cascade,
  name text not null, age int not null, level text not null, emergency_name text not null, emergency_phone text not null,
  bike text not null, helmet boolean default false, gloves boolean default false, pads boolean default false,
  coaching_add_on boolean default false, guardian jsonb
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(), event_id uuid references events on delete cascade,
  booking_id uuid references bookings, rider_name text not null, email text not null, created_at timestamptz default now()
);

create table coaching_programmes (
  id text primary key, name_en text, name_zh text, level text, price_hkd int, active boolean default true
);

create table memberships (
  id uuid primary key default gen_random_uuid(), user_id uuid references users, rider_name text not null, email text, phone text,
  tier text not null, status text not null default 'pending', starts_on date, ends_on date, visits int default 0
);

create table waivers (
  id uuid primary key default gen_random_uuid(), version text not null, booking_id uuid references bookings on delete cascade,
  signer_name text not null, signer_type text not null check (signer_type in ('adult','guardian')),
  minor_names text[] default '{}', accepted_at timestamptz not null default now(), consent_to_data_use boolean not null default false
);

create table promotion_codes (
  id uuid primary key default gen_random_uuid(), code text unique not null, kind text not null check (kind in ('percent','fixed')),
  value int not null, active boolean not null default true, usage_limit int, used int not null default 0, expires_on date,
  referral boolean not null default false, description text
);

create table group_enquiries (
  id uuid primary key default gen_random_uuid(), segment text not null, organisation text not null, contact_name text not null,
  email text not null, phone text not null, group_size int not null, preferred_date date, add_ons text[] default '{}', message text,
  status text not null default 'new', created_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(), topic text not null, name text not null, email text not null, phone text,
  message text not null, consent boolean not null, status text not null default 'new', created_at timestamptz not null default now()
);

create table waitlist (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text not null,
  experience_id text, date date not null, period text not null, party_size int not null default 1,
  status text not null default 'waiting', created_at timestamptz not null default now()
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(), email text unique not null, consent boolean not null, created_at timestamptz default now()
);

create table park_status (
  id int primary key default 1 check (id = 1), open boolean not null default true,
  note_en text, note_zh text, updated_at timestamptz default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(), active boolean not null default false, tone text default 'info',
  text_en text, text_zh text, link_href text, updated_at timestamptz default now()
);

-- Row level security: public tables are readable, everything personal is server/staff only.
alter table users enable row level security;
alter table rider_profiles enable row level security;
alter table guardians enable row level security;
alter table bookings enable row level security;
alter table booking_participants enable row level security;
alter table waivers enable row level security;
alter table enquiries enable row level security;
alter table group_enquiries enable row level security;
alter table waitlist enable row level security;
alter table newsletter_subscribers enable row level security;
alter table memberships enable row level security;
alter table event_registrations enable row level security;

alter table events enable row level security;
create policy "public read published events" on events for select using (published);
alter table park_status enable row level security;
create policy "public read park status" on park_status for select using (true);
alter table announcements enable row level security;
create policy "public read active announcements" on announcements for select using (active);
alter table time_slots enable row level security;
create policy "public read slots" on time_slots for select using (true);
alter table experiences enable row level security;
create policy "public read experiences" on experiences for select using (active);

-- Riders read their own bookings. Inserts happen through the service-role API routes.
create policy "riders read own bookings" on bookings for select using (contact_email = (auth.jwt() ->> 'email'));
-- Staff access: add policies checking (select role from users where id = auth.uid()) in ('staff','admin').
