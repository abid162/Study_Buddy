# Study Buddy: Supabase integration plan

Written 10 November 2026 for a separate build session. Read `HANDOVER.md` first. This plan is based on the code as of commit "Stage road on the Home map, live stage tracker…".

## Goal
Move everything that currently lives in the browser into Supabase, so that:
- a family's children, progress and scan results survive a new device or a cleared browser;
- the parent portal (still to build) has real data to show, including mastery by curriculum statement;
- the AI webhooks (scanner, English marking, photo-to-avatar) can only be called by signed-in families, with a rate limit.

## What stays exactly as it is
- **Question banks, curriculum, marking, stars and stages stay in code** (`src/data/bank`, `src/data/english`, `curriculum.maths.ts`, `stars.ts`, `stages.ts`). They are hard-coded on purpose. Do not move them into tables.
- **n8n stays the AI backend.** Supabase sits in front of it; it does not replace it.
- **The context APIs the screens use stay the same.** `useProfile()` and `useProgress()` keep their current shape (`get`, `record`, `world`, `gems`, `answeredAll`), so Home, World and Tutor need little or no change.

## What lives in the browser today (to replace)
| Data | Where now | File |
| --- | --- | --- |
| Child profile: name, year (4–6), worlds, avatar, favourite team | `sessionStorage` key `study-buddy-preview-profile` (lost when the tab closes) | `src/data/profile.tsx` |
| Progress per world per quest: `{answered, firstTry, helped, total}` | `localStorage` key `study-buddy-progress-v1`, scoped by `name|year` | `src/data/progress.tsx` |
| Passcode unlock | `sessionStorage` `study-buddy-preview-unlocked`, passcode `buddy2026` in the public repo | `src/App.tsx`, `src/screens/Gate.tsx` |
| Scan results | not stored | `src/screens/Scan.tsx` |
| Photo avatar | `{kind:'photo', src}` inside the profile | `src/components/avatar.tsx`, `src/screens/AvatarStep.tsx` |
| Gems, level, streak | gems and level are calculated from progress; streak and daily missions are still dummy values (`CHILD`, `DAILY` in `src/data/world.ts`) | |

## Decisions to confirm before starting
1. **Which Supabase account and organisation** owns the project (Cleartwo's or Hamza's)? Create the project there.
2. **Region: London (eu-west-2).** The users are UK children, so keep the data in the UK for UK GDPR and the ICO Children's Code.
3. **Accounts belong to parents, not children.** A parent signs in (email magic link or one-time code); children are profiles under that parent with no email or password. Children are under 13, so they should not have their own accounts.
4. **Plan tier.** A free project pauses after about a week without traffic, which would break a demo link. Use a paid plan, or keep it active, before any client demo.
5. **Demo mode.** Keep a "Try the demo" path that works without signing in (local storage, as now), so the client demo link never depends on a login. Recommended.

## Database (one migration per step, in `supabase/migrations/`)

```sql
-- Children belong to a signed-in parent (auth.users). No child logins.
create table public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 16),
  year        smallint not null check (year between 4 and 6),   -- widen when Year 7 lands
  worlds      text[] not null default '{}',                      -- 'football','wrestling','music','story','bricks','space'
  avatar      jsonb,                                             -- {kind:'built', look:{...}} or {kind:'photo', path:'<storage path>'}
  team        text,                                              -- favourite Premier League club
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per child, world and quest. Mirrors QuestProgress in src/data/progress.tsx.
create table public.quest_progress (
  child_id    uuid not null references public.children (id) on delete cascade,
  world       text not null,
  quest_id    text not null,           -- e.g. 'MA-Y4-PV-01' or an English id like 'EN-Y4-SP-03#2'
  answered    smallint not null default 0,
  first_try   smallint not null default 0,
  helped      smallint not null default 0,
  total       smallint not null,
  updated_at  timestamptz not null default now(),
  primary key (child_id, world, quest_id)
);

-- Every answered question: feeds the parent portal (mastery by curriculum statement), streaks and daily missions.
create table public.answers (
  id             bigint generated always as identity primary key,
  child_id       uuid not null references public.children (id) on delete cascade,
  world          text not null,
  subject        text not null check (subject in ('maths','english')),
  quest_id       text not null,
  curriculum_id  text not null,
  outcome        text not null check (outcome in ('first_try','helped','shown')),
  hints          smallint not null default 0,
  answered_at    timestamptz not null default now()
);
create index on public.answers (child_id, answered_at desc);
create index on public.answers (child_id, curriculum_id);

-- Marked homework. Store the marking only; never store the photo.
create table public.scans (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  year        smallint not null,
  subject     text not null,
  score       smallint, total smallint,
  result      jsonb not null,          -- the n8n reply: items[], praise, next_step…
  created_at  timestamptz not null default now()
);

-- What a parent agreed to, and when.
create table public.consents (
  parent_id   uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('terms','photo_avatar','homework_scanner')),
  granted_at  timestamptz not null default now(),
  primary key (parent_id, kind)
);
```

**Row Level Security on every table.** A parent can read and write only their own children and those children's rows:
```sql
alter table public.children enable row level security;
create policy "own children" on public.children
  for all using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));

-- same pattern for quest_progress, answers, scans:
create policy "own child rows" on public.quest_progress
  for all using (child_id in (select id from public.children where parent_id = (select auth.uid())))
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

alter table public.consents enable row level security;
create policy "own consents" on public.consents
  for all using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
```
After the migrations, run Supabase's security and performance advisors and fix anything they flag.

**Storage:** a private bucket `avatars`, with paths like `<parent_id>/<child_id>.png`. It holds only the generated cartoon avatar, never the child's photo. Policies restrict each parent to their own folder; the app shows avatars through signed URLs.

## Steps (each one shippable)
1. **Project and client.** Create the project (London). Add `@supabase/supabase-js` and `src/data/supabase.ts` (`createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)`). Add both variables in Netlify (Site settings → Environment variables) and in a local `.env` (git-ignored). Only the public publishable (anon) key goes to the browser, never the service-role or secret key.
2. **Schema and policies.** Apply the migrations above. Generate TypeScript types into `src/data/database.types.ts`.
3. **Parent sign-in.** Replace the passcode gate with: "Try the demo" (current local mode) or "Sign in" (email magic link or one-time code). Add a parent screen to pick or add a child, and record the terms consent. Set the site URL and redirect URLs in Supabase Auth to the Netlify domain.
4. **Profiles.** `ProfileProvider` reads and writes `children` when signed in (sessionStorage in demo mode). "Switch explorer" becomes "Switch child". Onboarding inserts a `children` row.
5. **Progress.** `ProgressProvider` loads all `quest_progress` rows for the child on start. `record()` updates state at once (optimistic), saves to localStorage as an offline cache, then upserts the row. It retries queued writes when the connection returns. On a parent's first sign-in, offer to import existing local progress for a child with the same name and year.
6. **Answer log.** Tutor writes one `answers` row per finished question (outcome `first_try`, `helped` or `shown`, plus hint count). This feeds streaks, daily missions and the parent portal, and replaces the dummy `CHILD` and `DAILY` values.
7. **Lock down the AI webhooks.** Add three Edge Functions, `scan`, `mark` and `avatar`. Each one:
   - checks the caller's Supabase session and that the child belongs to them (plus consent for the scanner and avatar);
   - applies a per-child daily limit (for example 20 scans and 200 English markings);
   - forwards the request to n8n with a shared-secret header (`x-study-buddy-key`), which the n8n webhook nodes then require.

   `src/data/ai.ts` calls the functions instead of n8n. `scan` saves the result to `scans` (no photo). `avatar` saves the cartoon to Storage. Demo mode keeps the sample sheet and offline fallbacks.
8. **Parent portal (Grown-ups tab).** Use the `answers` table to show mastery by curriculum statement, weekly activity and recent scans per child. Curriculum IDs are already on every question and scan result.
9. **Privacy before launch.** Add a delete-child option (cascade delete plus removing their Storage files) and a delete-account option. Make the DPIA and privacy notice match these tables, and keep execution saving off in n8n.

## Testing checklist
- Two parent accounts: neither can read the other's children, progress, answers, scans or avatars, whether through the app or by calling the API directly with the publishable key.
- A child's progress made on a phone appears on a laptop after sign-in.
- Going offline mid-quest and coming back loses no answers.
- Demo mode works with Supabase unreachable.
- The Edge Functions reject a call with no session, another parent's child, or a missing consent; the limits work; n8n rejects a call without the secret header.
- `npm run verify`, `tsc` and the build still pass. Recheck mobile at 320–430px.

## Notes for the build session
- The Supabase MCP connector is available in Claude sessions for creating the project, applying migrations, running SQL and advisors, deploying Edge Functions and generating types.
- Check current Supabase docs for API key names (publishable/secret keys versus the older anon/service_role keys) and for Edge Function auth.
- Hamza pushes to GitHub himself (`abid162/Study_Buddy`), and Netlify deploys from `main`. Deliver the changes as a zip or exact steps, not as a direct push.
