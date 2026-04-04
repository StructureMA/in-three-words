-- Example paintings for the gallery showcase
create table public.example_paintings (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.example_paintings enable row level security;

create policy "Public can view example paintings"
  on public.example_paintings for select
  using (true);

create policy "Admin full access to example paintings"
  on public.example_paintings for all
  using (auth.role() = 'authenticated');
