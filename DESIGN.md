# Design: Study Buddy preview (round 1)

World: an illustrated game world in a warm picture-book style. The child explores interest islands with Nova the fox; real photos appear as postcards and banners.

Colour: night #1E1B4F (shell, headers, rail), mist #EEF0FB (ground), white cards. Sun #FFC93C (primary action, rewards, current step), grape #7C5CFF (send, child messages, focus), mint #22C58B / #0F8A5F (done, correct), coral #FF6B57 (streak, mistakes), sea #3E8EF0 (map water, gems). Ink #17153A, secondary #4A4870.

Type: Fredoka for display (headings, numbers, buttons); Atkinson Hyperlegible Next for body, chosen for young and neurodivergent readers.

Components: chunky buttons with a bottom "press" shadow; 24 to 32px radius cards; chips; bottom sheet (phone) / dialog (wider); chat bubbles (buddy white left, child grape right); hint cards in sun-soft with a ring.

Motion: card rise-in, sheet spring, typing dots, floating buddy, confetti on a correct answer, gem counter pop. Reduced motion disables decorative loops.

Layout: phone first. Bottom tab bar under 1024px; side rail at 1024px and up. Home splits into main column and sticky aside on wide screens. Tutor hides navigation and adds a side panel on wide screens.

## Round 2 (visual refresh, 10 Nov)

Ground: a daytime sky gradient (#E6F2FF to #F1ECFF to #FFF4E3) with a faint dotted texture, in place of flat mist. Headers are sky scenes (`SkyScene`): violet-to-blue by day with a sun, deep indigo with a moon after 6pm and on sign-in and set-up. Added rose #FF5FA2 and sky #5BC0FF as accents.

Surfaces: cards have a 2px hairline and a 5px solid lower edge. Buttons have a glossy top edge and a solid press edge (`.btn-*`). Counters are glass tokens (`.hud`). Icons sit on gradient tiles (`.tile`). Progress uses the striped candy bar (`Bar`, `.track`, `.fill`).

World colour: each world's tint washes its world screen and question screen (banner overlay, header gradient, trail, stones, star chip).

Motion added: twinkling stars, drifting clouds, bobbing islands, moving dashes on the current island, a sheen across primary buttons, spring tab bubble, gem "+15" pop, pop-in stars. All loops stop under reduced motion.
