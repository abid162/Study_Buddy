alter table public.children       enable row level security;
alter table public.quest_progress enable row level security;
alter table public.answers        enable row level security;
alter table public.scans          enable row level security;
alter table public.consents       enable row level security;

revoke all on public.children, public.quest_progress, public.answers, public.scans, public.consents from anon;

create policy "parent manages own children" on public.children
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

create policy "parent manages own child progress" on public.quest_progress
  for all to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())))
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

create policy "parent reads own child answers" on public.answers
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "parent adds own child answers" on public.answers
  for insert to authenticated
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

create policy "parent reads own child scans" on public.scans
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "parent adds own child scans" on public.scans
  for insert to authenticated
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

create policy "parent manages own consents" on public.consents
  for all to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));
