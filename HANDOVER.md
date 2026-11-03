# Study Buddy demo: handover (preview round 1)

Last updated: 3 November 2026. Owner: Hamza (Cleartwo). Repo: https://github.com/abid162/Study_Buddy (branch main). Hosting: Netlify, auto-deploys from main (build `npm run build`, publish `dist`). Passcode: `buddy2026`.

## Goal
A visually impressive, phone/tablet-friendly demo link (Netlify) to win the client's confidence. Flows can be scripted with realistic data; full functionality comes later. Source brief: "Study Buddy: Adaptive AI EdTech Platform | Architecture, MVP Scope & Technical Blueprint" (Sehar, 19 Oct 2026).

## Decisions made
- Visual direction: an illustrated game world in a warm picture-book style (world map of interest islands, quests, gems, streaks), plus real-world Unsplash photos as postcards and banners.
- Imagery: generic real-world photos only. No identifiable stars (e.g. no Ronaldo, no named wrestlers) and no logos or league/brand marks, because of likeness and trademark risk.
- Buddy: preset cartoon characters, per the brief (Memoji-style presets; avatar creation optional; no photos of children). Preview uses one buddy, Nova the fox. A picker with 3 to 4 buddies is planned.
- Presentation: shared as a Netlify link, so it must work well on phones first, then tablets and desktop.
- Hamza's feedback on round 0 (brick-booklet design): too plain, not exciting or game-like enough, layout and flow felt clunky. This round replaces it entirely.
- Tool principle: quality first, not open source first.
- Deployment: Netlify from GitHub. Lovable was dropped (workspace Git permissions blocked it).

## Built in preview round 1
- Passcode screen (night sky, Nova, "Enter the world").
- App shell: bottom tab bar on phones (World, Tutor, Scan, Read, Grown-ups); side rail at 1024px and wider.
- Child home: greeting, streak, gems, level/XP bar; "Today's quest" hero card with photo and step progress; illustrated world map with 6 islands (Football Stadium, Wrestling Arena, Music Stage, Story Forest, Brick City, Space Station locked), dotted path and floating buddy marker; island sheet with photo, level, stars and quest list; Nova tip card; daily missions; Maths and English progress cards.
- AI tutor (hero feature, scripted): chat with Nova, typing indicator, themed problem card with photo, football visual that groups into equal parts and highlights the groups needed, hint ladder (3 levels), quick actions (hint, picture, explain differently), answer checked in code with specific mistake messages (e.g. 5 = one quarter only), confetti, +20 gems, "Step complete" card, second problem, back to world. Side panel on wide screens shows Nova's mood and the hint ladder.
- Scan, Read and Grown-ups tabs: placeholder screens ("Arriving in the next preview").

## Still to build (next rounds)
1. Onboarding: parent setup, then child picks interests, buddy (3 to 4 presets) and session length.
2. Homework scanner: camera view, scanning animation, extracted text, step-by-step feedback.
3. Reading coach: passage, live waveform, word highlighting, encouraging feedback.
4. Focus mode: timed session and break screen.
5. Parent portal: weekly report, mastery by topic, gaps, next steps.
6. Landscape world map for desktop; more quests playable; English tutor script.
7. Final QA on phone, tablet, desktop; accessibility pass; then push and redeploy.

## Tech
React 19, TypeScript, Vite 6, Tailwind 3, framer-motion 12.23.24 (pinned with motion-dom 12.23.23 and motion-utils 12.23.6; mismatched versions break the build), lucide-react 0.460. Fonts: Fredoka (display) and Atkinson Hyperlegible Next (body), self-hosted via Fontsource.

Files: `src/App.tsx` (gate, tabs), `src/components/shell.tsx` (tab bar and rail), `src/components/art.tsx` (Nova buddy, Photo with fallback, island landmarks, WorldMap), `src/data/world.ts` (islands, quests, child profile, photo IDs and credits), `src/screens/Home.tsx`, `src/screens/Tutor.tsx` (scripted problems in PROBLEMS), `src/screens/Gate.tsx`, `src/screens/Soon.tsx`.

## Photos (Unsplash License)
Football: photo-1679391029864-d46f366a456b (Howard Bouchevereau). Wrestling: photo-1443683263937-3e377546e8a8 (Martin Martz). Music: photo-1768053921689-1bc09db904c9 (Nicolás Flor). Space: photo-1541185933-ef5d8ed016c2 (SpaceX). Bricks and Story IDs are unverified; if they fail, the Photo component shows a coloured fallback, so nothing breaks.

## How to update the live site
Unzip over the local repo folder (delete the old `src` first so no stale files remain), then in PowerShell:
```
$env:Path += ";C:\Program Files\Git\cmd;$env:LOCALAPPDATA\Programs\Git\cmd"
cd "C:\Users\HamzaAbid\OneDrive - Cleartwo LTD\Desktop\New folder (2)"
git add -A
git commit -m "Preview round 1: world map and AI tutor"
git push
```
Netlify redeploys automatically.

## Starting a new chat
Upload this file (or paste it) and say: "Continue the Study Buddy demo from this handover. Next: <task>."
