-- PROFILES (one per user, linked to Supabase auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  whatsapp text,
  city text,
  created_at timestamptz default now()
);

-- Auto-create a profile when someone registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, whatsapp)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'whatsapp'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

insert into public.categories (name, slug) values
  ('Property', 'property'),
  ('Vehicles', 'vehicles'),
  ('Jobs', 'jobs'),
  ('Electronics', 'electronics'),
  ('Products', 'products'),
  ('Services', 'services'),
  ('Events', 'events'),
  ('Education', 'education'),
  ('Agriculture', 'agriculture');

-- ADVERTS
create table public.adverts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id int not null references public.categories(id),
  title text not null,
  description text,
  price numeric(12,2),
  currency text default 'USD',
  city text not null,
  condition text,
  status text default 'active' check (status in ('active', 'sold', 'hidden')),
  featured boolean default false,
  views int default 0,
  created_at timestamptz default now()
);

create index adverts_category_idx on public.adverts(category_id);
create index adverts_city_idx on public.adverts(city);
create index adverts_created_idx on public.adverts(created_at desc);

-- ADVERT IMAGES
create table public.advert_images (
  id uuid primary key default gen_random_uuid(),
  advert_id uuid not null references public.adverts(id) on delete cascade,
  url text not null,
  position int default 0
);

-- SAVED ADVERTS
create table public.saved_adverts (
  user_id uuid references public.profiles(id) on delete cascade,
  advert_id uuid references public.adverts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, advert_id)
);

-- Security rules (Row Level Security)