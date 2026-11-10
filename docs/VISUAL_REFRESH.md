# Study Buddy: visual refresh

10 November 2026. Appearance and UI only: no question, marking, progress, n8n or routing logic changed. Based on GitHub `main` at commit `0f78967`.

## What changed
| Area | Before | Now |
| --- | --- | --- |
| Page background | Flat grey-lavender | Soft sky gradient (blue to lilac to warm cream) with a faint dotted texture |
| Buttons, cards, bars | Flat fills, thin shadows | Chunky game style: glossy top edge, solid press edge, striped candy progress bars |
| Home header | Navy block | Sky scene: sun by day, moon after 6pm, twinkling stars, drifting clouds, hills. Avatar sits in an XP ring with the level pinned on. Streak and gems are glass tokens |
| Home cards | White cards | Today's quest with a ribbon and a shining Start button; Nova in a speech bubble; missions with coloured icon tiles; Maths and English as full-colour cards |
| World map | Small static islands, dark labels | Bigger bobbing islands with foam rings, a dotted sea route, a sailing boat, sparkles, white name plates in each world's colour |
| Navigation | Flat bar fixed to the bottom edge | Floating rounded bar; each tab has its own colour and the active one pops up with a spring. Desktop rail has a starry gradient |
| World screen | Dark photo banner, loose stones | Banner and page washed in the world's colour, dotted trail joining the stepping stones (coloured once a quest is done), glossy stones |
| Question screen | Navy header, chat on grey | Header blends into the world's colour, one pip per question, "+15" floats off the gem counter on a right answer, richer confetti, hint cards with a lightbulb and level pips, lettered colour answer tiles (A, B, C, D), big pop-in stars on the quest-complete card |
| Passcode and set-up | Navy with blurred blobs | Night sky with moon, twinkling stars and floating islands; coloured year buttons; world tiles tilt and tick when picked |
| Read, Scan, Grown-ups | Plain | Nova on a sunny badge with sparkles; chunky controls |

## Fixed along the way
- "Switch explorer" was 20px tall; it is now a 44px button in the header (the item listed under "To fix" in the handover).
- "Clear all / Pick all" and "Skip for now" are now 44px tall.
- The "Next question" button is full width on phones, so it is the obvious next tap.

## Files
New: `src/components/scene.tsx` (sky scenes, sparkle, candy bar), this file.
Changed: `tailwind.config.js`, `src/index.css`, `src/components/shell.tsx`, `art.tsx`, `journey.tsx`, `src/screens/Home.tsx`, `World.tsx`, `Tutor.tsx`, `Gate.tsx`, `Onboarding.tsx`, `AvatarStep.tsx`, `Soon.tsx`, `Scan.tsx`, `Grownups.tsx`, `DESIGN.md`, `HANDOVER.md`.
No dependency changes (`package.json` and the lock file are untouched).

## Checks run
- `tsc`, `npm run build`, `npm run verify` (both banks) pass; ESLint shows no errors.
- Every screen (passcode, set-up, Home, stage road, world path, quest sheet, question screen with a hint and a right answer, Scan, Read, Grown-ups) was opened in headless Chrome at 390px and 1366px with no script errors.
- Set-up, Home, stage road, world path and question screen were also measured at 320, 360, 430, 768 and 1366px: no sideways scroll, and every button is at least 44px.
- The new CSS loops (stars, clouds, islands, stripes, sheen) stop when the device asks for reduced motion. The spring and pop animations made with framer-motion still play, as they did before.

## Not checked
- Unsplash photos could not load in the build sandbox, so photo screens were checked with the local team photos and the colour fallback. Look at the Music, Story, Brick City and Space banners on the live site.
- Button sizes on the passcode, Scan, Read and Grown-ups screens were not measured (their controls use the shared 54px button style).
- Real iPhone and Android devices (same as before).
