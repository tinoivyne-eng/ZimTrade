alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.adverts enable row level security;
alter table public.advert_images enable row level security;
alter table public.saved_adverts enable row level security;

-- Profiles: anyone can read (needed to show seller contact), only you can edit yours
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories: read only
create policy "Categories are public" on public.categories for select using (true);

-- Adverts: anyone reads active ones, owners manage their own
create policy "Read active adverts" on public.adverts for select
  using (status = 'active' or auth.uid() = user_id);
create policy "Create own adverts" on public.adverts for insert
  with check (auth.uid() = user_id);
create policy "Update own adverts" on public.adverts for update
  using (auth.uid() = user_id);
create policy "Delete own adverts" on public.adverts for delete
  using (auth.uid() = user_id);

-- Images: anyone reads, owners of the advert manage
create policy "Images are public" on public.advert_images for select using (true);
create policy "Add images to own adverts" on public.advert_images for insert
  with check (exists (select 1 from public.adverts a where a.id = advert_id and a.user_id = auth.uid()));
create policy "Delete images of own adverts" on public.advert_images for delete
  using (exists (select 1 from public.adverts a where a.id = advert_id and a.user_id = auth.uid()));

-- Saved: only you see and manage your saved list
create policy "Read own saved" on public.saved_adverts for select using (auth.uid() = user_id);
create policy "Save adverts" on public.saved_adverts for insert with check (auth.uid() = user_id);
create policy "Unsave adverts" on public.saved_adverts for delete using (auth.uid() = user_id);