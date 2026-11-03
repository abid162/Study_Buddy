# Study Buddy demo: handover

Last updated: 4 November 2026 (avatar added). Owner: Hamza (Cleartwo).

| Item | Detail |
| --- | --- |
| Code | https://github.com/abid162/Study_Buddy (branch `main`) |
| Hosting | Netlify, auto-deploys on every push to `main` (build `npm run build`, publish `dist`) |
| Passcode | `buddy2026` (set in `src/screens/Gate.tsx`) |
| Source brief | "Study Buddy: Adaptive AI EdTech Platform, Architecture, MVP Scope & Technical Blueprint" (Sehar, 19 Oct 2026) |

## Goal
A visually impressive demo link to win the client's confidence. It must work on phones first, then tablets and desktop, because the client opens the Netlify link on any device. Flows are scripted with realistic data; full functionality comes after the client signs on.

## Decisions made
- **Visual direction:** an illustrated game world in a warm picture-book style (world map, quests, gems, streaks), with real Unsplash photos as postcards and banners. It replaced the first "brick booklet" version, which Hamza found too plain, not game-like enough and clunky.
- **Imagery:** generic real-world photos only, with no identifiable stars and no logos or brand marks.
- **Buddy:** preset cartoon characters, as the brief specifies. The preview has one buddy, Nova the fox.
- **Child avatar:** requested by the team lead. Built from parts by default; photo-to-cartoon via n8n and gpt-image-2 behind parent consent, with the photo not stored (in line with the brief's photo-upload safeguards).
- **Worlds:** the child picks 1 to 6 worlds; only picked worlds appear; no stages or locks.
- **Questions:** 8 per world.
- **Star names:** football and wrestling questions use a named star cast held in one editable file. Claude shipped invented characters and won't write real named people into fictional questions; swapping in real names is the team's own edit (check with the client first; many wrestling ring names are WWE trademarks). The repo may already contain names the team has changed.
- **Tool principle:** quality first, not open source first.
- **Deployment:** Netlify from GitHub. Lovable was dropped because the workspace's Git permissions blocked it.

## What's built
- **Passcode screen:** night sky, Nova, "Enter the world".
- **Child intake:** Nova asks for the child's first name (validated and tidied, so "mary-jane o'neil" becomes "Mary-Jane O'Neil") and school year (4, 5 or 6), then the child picks 1 to 6 worlds, with a "Pick all" option. Kept for the browser session; "Not [name]? Switch explorer" on Home restarts it. The name and year appear across Home and the tutor.
- **Avatar (intake step 3):** "Build it" (skin, 6 hairstyles, hair colour, top, extras including glasses, cap, headphones and headscarf, plus "Surprise me") or "Use a photo". The photo route needs a parent/carer consent tick, downsizes the photo on the device, sends it to n8n, and shows the returned cartoon ("Try another photo" / "Let's go!"); errors show a friendly message and building is always available. "Skip for now" uses a default avatar. The avatar shows on Home, next to the child's tutor messages, and beside Nova as a pair (`BuddyDuo`) in the Home "Nova says" card and the tutor side panel ("[name] & Nova").
- **App shell:** bottom tab bar on phones (World, Tutor, Scan, Read, Grown-ups); side rail at 1024px and wider.
- **Child home:** greeting, streak, gems and level bar; "Today's quest" card from the child's first picked world; illustrated world map showing only the picked worlds (it re-lays itself for 1 to 6, with a floating buddy marker); world sheet with photo, level, stars and quests; Nova tip; daily missions; Maths and English progress.
- **Six worlds, all playable:** Football (Penalty Shootout), Wrestling (Title Belt Tour), Music Stage (Sold-out Show), Story Forest (The Lost Map), Brick City (Dream Bedroom), Space Station (Fuel the Rocket).
- **AI tutor (scripted, the hero feature):** each quest is 8 themed fraction questions (halves, thirds, quarters and fifths, including unit fractions; 48 in total). Chat with Nova and a typing indicator; question card with photo and, for football and wrestling, a star card; a counting visual themed to the world that splits into equal groups and highlights the ones needed; 3-level hint ladder; quick actions (hint, picture, explain differently); specific mistake messages; confetti, +20 gems and "Step complete"; a "[quest] complete!" card after question 8. The maths, hints and mistake messages are generated and checked in code, never by AI.
- **Scan, Read and Grown-ups tabs:** placeholder screens for now.
- **Checks done:** clean production build; all 48 questions verified (whole-number answers, no mistake message matching a right answer, no broken text); a full 8-step quest played in the browser; flows tested with 1, 2 and 6 worlds; no sideways scrolling at 390px, 1180px and 1440px.

## Photo-to-avatar workflow (n8n)
- Workflow: "Study Buddy: Photo to Avatar" (ID `uJSV5tD2SVSLIgmY`) in Hamza's personal n8n project, published. Editor: https://cleartwo.app.n8n.cloud/workflow/uJSV5tD2SVSLIgmY
- Webhook: `POST https://cleartwo.app.n8n.cloud/webhook/study-buddy-avatar`, form field `image` = JPEG base64 (no data: prefix). Returns the cartoon as an image, or JSON `{ error }` with status 400 (bad or oversized photo) or 502 (drawing failed).
- Flow: Webhook → "Photo Looks Valid?" (present and under ~5 MB) → Convert to File → OpenAI image edit with **gpt-image-2**, quality medium, 1024×1024, credential **"OpenAi c2 account"** → Respond with the image.
- Privacy: execution saving is off (success, error, manual and progress), so photos and avatars are not kept in n8n. The app keeps only a 320px copy of the cartoon in the browser session. The two test runs used a drawn test face, not a real child.
- Notes: takes about a minute per avatar; each one is a paid OpenAI image call on the c2 account. The webhook is public (anyone with the URL could call it), so add a shared-secret check before wider use. `input_fidelity` is not supported by gpt-image-2 and was removed. Override the URL with `VITE_AVATAR_WEBHOOK_URL` if needed.

- Fixed: Nova's fur gradient used a fixed SVG id, so on phones (where the sidebar copy is hidden) other Novas rendered pale. Each Nova now gets a unique id.

- Founder feedback applied: a photo of just a football instead of the stadium, "Football Stadium" renamed "Football" and "Wrestling Arena" renamed "Wrestling", wrestling image replaced with the client-supplied one.

## Still to build
1. Onboarding extras: parent/guardian setup step, buddy picker (3 to 4 presets), session length, and a way to change picked worlds or the avatar later.
2. Homework scanner: camera view, scanning animation, extracted text, step-by-step feedback.
3. Reading coach: passage, live waveform, word highlighting, encouraging feedback.
4. Focus mode: timed session and break screen.
5. Parent portal: weekly report, mastery by topic, gaps, next steps.
6. Landscape world map for desktop; question types beyond fractions; an English tutor script.
7. Final QA on phone, tablet and desktop, accessibility pass, then push and redeploy.

## Tech
React 19, TypeScript, Vite 6, Tailwind 3, lucide-react 0.460. framer-motion 12.23.24 is pinned together with motion-dom 12.23.23 and motion-utils 12.23.6; mismatched versions break the build. Fonts: Fredoka (display) and Atkinson Hyperlegible Next (body), self-hosted through Fontsource.

| File | What it holds |
| --- | --- |
| `src/App.tsx` | Passcode, intake and tab routing |
| `src/data/profile.tsx` | Child profile (name, year, worlds, avatar), kept in session storage |
| `src/data/world.ts` | Worlds, quests, the 8 question specs per world, photo IDs |
| `src/data/stars.ts` | Editable star cast: 4 footballers and 4 wrestlers (name, nickname, he/she, role) |
| `src/screens/Onboarding.tsx` | Child intake (name and year, worlds, avatar) |
| `src/screens/AvatarStep.tsx` | Avatar step: build or use a photo |
| `src/components/avatar.tsx` | Avatar parts, drawn figure, `ChildAvatar` display |
| `src/data/avatarApi.ts` | Photo prep and the call to the n8n webhook |
| `src/screens/Home.tsx` | Child home and world sheet |
| `src/screens/Tutor.tsx` | Tutor chat; `makeProblem` builds answers, hints and mistake messages |
| `src/components/art.tsx` | Nova, photo with fallback, world artwork, world map |
| `src/components/shell.tsx` | Tab bar and side rail |
| `src/screens/Gate.tsx`, `src/screens/Soon.tsx` | Passcode screen, placeholder tabs |

## Photos (Unsplash License)
Football: photo-1617144519956-bba853571334 (a ball on its own on grass, Ben Hershey). Wrestling: client-supplied image (founder's choice) stored at `public/worlds/wrestling.jpg`; it shows real WWE wrestlers and branding, so its usage rights are the client's to confirm before any public launch. Music: photo-1768053921689-1bc09db904c9 (Nicolás Flor). Space: photo-1541185933-ef5d8ed016c2 (SpaceX). The Bricks and Story photo IDs are unverified; if they fail to load, a coloured fallback shows instead.

## Updating the live site
Edit or unzip files into the local repo folder (when replacing the whole app, delete the old `src` first), then in PowerShell:
```
$env:Path += ";C:\Program Files\Git\cmd;$env:LOCALAPPDATA\Programs\Git\cmd"
cd "C:\Users\HamzaAbid\OneDrive - Cleartwo LTD\Desktop\New folder (2)"
git add -A
git commit -m "Describe the change"
git push
```
Netlify redeploys automatically within a minute or two.

## Starting a new chat
Upload this file and say: "Continue the Study Buddy demo from this handover. Next: [task]." If the repo has changed since (for example, renamed stars), also upload the changed files or say what changed.
