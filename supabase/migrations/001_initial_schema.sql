-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Entries table
create table public.entries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  word_1 text not null,
  word_2 text not null,
  word_3 text,
  word_4 text,
  size text not null check (size in ('small', 'medium')),
  week_of date not null,
  created_at timestamptz not null default now()
);

-- Selections table
create table public.selections (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references public.entries(id),
  payment_token text not null unique,
  status text not null default 'drawn' check (
    status in ('drawn', 'notified', 'confirmed', 'paid', 'painting', 'shipped', 'posted')
  ),
  notified_at timestamptz,
  expires_at timestamptz,
  payment_method text check (payment_method in ('stripe', 'venmo', 'paypal')),
  payment_confirmed_at timestamptz,
  shipping_street text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_provider text,
  tracking_number text,
  expected_arrival date,
  shipped_at timestamptz,
  created_at timestamptz not null default now()
);

-- Paintings table
create table public.paintings (
  id uuid primary key default uuid_generate_v4(),
  selection_id uuid not null references public.selections(id),
  image_url text not null,
  description text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Charities table
create table public.charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text,
  week_of date not null,
  donation_amount decimal(10, 2),
  donated_at timestamptz,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- Site settings table
create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Insert default settings
insert into public.site_settings (key, value) values
  ('entries_open', 'true'),
  ('venmo_handle', ''),
  ('current_week', to_char(date_trunc('week', now()), 'YYYY-MM-DD'));

-- Indexes
create index idx_entries_week_of on public.entries(week_of);
create index idx_selections_payment_token on public.selections(payment_token);
create index idx_selections_status on public.selections(status);
create index idx_paintings_featured on public.paintings(featured) where featured = true;
create index idx_charities_week_of on public.charities(week_of);

-- Row Level Security
alter table public.entries enable row level security;
alter table public.selections enable row level security;
alter table public.paintings enable row level security;
alter table public.charities enable row level security;
alter table public.site_settings enable row level security;

-- Public can INSERT entries (submitting the form)
create policy "Anyone can submit an entry"
  on public.entries for insert
  with check (true);

-- Public can read entry COUNT per week (for social proof) but not individual entries
create policy "Public can count entries"
  on public.entries for select
  using (true);

-- Public can read featured paintings (gallery)
create policy "Public can view featured paintings"
  on public.paintings for select
  using (featured = true);

-- Public can read charities
create policy "Public can view charities"
  on public.charities for select
  using (true);

-- Public can read site settings
create policy "Public can read settings"
  on public.site_settings for select
  using (true);

-- Admin full access (authenticated users)
create policy "Admin full access to entries"
  on public.entries for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to selections"
  on public.selections for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to paintings"
  on public.paintings for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to charities"
  on public.charities for all
  using (auth.role() = 'authenticated');

create policy "Admin full access to settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated');
