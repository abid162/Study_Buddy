-- Applied to the London project (edznmkujqdahyszyiica) on 11 Nov 2026.
create table public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 16),
  year        smallint not null check (year between 4 and 6),
  worlds      text[] not null default '{}'
              check (worlds <@ array['football','wrestling','music','story','bricks','space']::text[]),
  avatar      jsonb,
  team        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index children_parent_id_idx on public.children (parent_id);

create table public.quest_progress (
  child_id    uuid not null references public.children (id) on delete cascade,
  world       text not null,
  quest_id    text not null,
  answered    smallint not null default 0 check (answered >= 0),
  first_try   smallint not null default 0 check (first_try >= 0),
  helped      smallint not null default 0 check (helped >= 0),
  total       smallint not null check (total > 0),
  updated_at  timestamptz not null default now(),
  primary key (child_id, world, quest_id)
);

create table public.answers (
  id             bigint generated always as identity primary key,
  child_id       uuid not null references public.children (id) on delete cascade,
  world          text not null,
  subject        text not null check (subject in ('maths','english')),
  quest_id       text not null,
  curriculum_id  text not null,
  outcome        text not null check (outcome in ('first_try','helped','shown')),
  hints          smallint not null default 0 check (hints >= 0),
  answered_at    timestamptz not null default now()
);
create index answers_child_time_idx on public.answers (child_id, answered_at desc);
create index answers_child_curriculum_idx on public.answers (child_id, curriculum_id);

create table public.scans (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  year        smallint not null,
  subject     text not null,
  score       smallint,
  total       smallint,
  result      jsonb not null,
  created_at  timestamptz not null default now()
);
create index scans_child_time_idx on public.scans (child_id, created_at desc);

create table public.consents (
  parent_id   uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('terms','photo_avatar','homework_scanner')),
  granted_at  timestamptz not null default now(),
  primary key (parent_id, kind)
);

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger children_touch before update on public.children
  for each row execute function public.touch_updated_at();
create trigger quest_progress_touch before update on public.quest_progress
  for each row execute function public.touch_updated_at();
