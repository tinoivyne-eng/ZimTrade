create policy "Anyone can view advert images" on storage.objects for select
  using (bucket_id = 'advert-images');

create policy "Logged-in users upload to own folder" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'advert-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own images" on storage.objects for delete
  to authenticated
  using (bucket_id = 'advert-images' and (storage.foldername(name))[1] = auth.uid()::text);