-- Reading coach (18 Nov 2026). Stores what was read and which words to practise. Never audio, never a transcript.

-- a grown-up's permission to use the microphone
alter table public.consents drop constraint if exists consents_kind_check;
alter table public.consents add constraint consents_kind_check
  check (kind in ('terms','photo_avatar','homework_scanner','reading_voice'));

create table public.reading_sessions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children (id) on delete cascade,
  text_id      text not null check (char_length(text_id) <= 40),
  world        text not null,
  kind         text not null check (kind in ('story','poem','facts')),
  title        text not null check (char_length(title) <= 80),
  parts        smallint not null check (parts >= 1),
  parts_total  smallint not null check (parts_total >= parts),
  words        smallint not null check (words >= 0),
  clear        smallint not null check (clear >= 0 and clear <= words),
  -- up to five printed words from the text, e.g. {"blanket","floodlights"}
  practice     text[] not null default '{}' check (cardinality(practice) <= 25),
  created_at   timestamptz not null default now()
);
create index reading_sessions_child_time_idx on public.reading_sessions (child_id, created_at desc);

alter table public.reading_sessions enable row level security;
revoke all on public.reading_sessions from anon;

create policy "parent reads own child reading" on public.reading_sessions
  for select to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "parent adds own child reading" on public.reading_sessions
  for insert to authenticated
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "parent clears own child reading" on public.reading_sessions
  for delete to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())));
