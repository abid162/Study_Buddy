# Design: Study Buddy demo

World: building-brick instruction booklet. Practice is a build: each question is a numbered build step and each correct answer clicks a row of bricks into the child's chosen model.

## Colour (Full palette, four brick roles)
- Ground `#CFE3F6` sky (booklet page); second layer `#B4D2EF`; soft fill `#E6F1FB`
- Panels `#FFFFFF`; ink `#14284B`; secondary text `#3D5478`; faint `#7F93B2` (ghost outlines only, never text)
- Blue `#1C5FCC` primary action, selection, focus ring, next ghost row
- Green `#2E9E4F` correct bricks; `#1F7A3B` for green buttons/text (contrast)
- Yellow `#F6C21C` hints and parts callouts; `#FFF4CC` callout fill
- Red `#D9312B` / `#B3221D` wrong answers and "needs practice" only
- Shell header in ink. Text selection yellow on ink.

## Type
- Atkinson Hyperlegible Next (variable, self-hosted): all UI, body, buttons, data. Chosen for young and neurodivergent readers.
- Lilita One (self-hosted): screen titles, the wordmark, step numerals and part counts only. Never in buttons or labels.
- Body 17px/1.5; question scene 22px; question ask 24px bold; step numeral 72px.

## Components
- Buttons: 52px min height, 12px radius, 2px press-down on active. Primary blue, go green, hint yellow, quiet white with sky ring.
- Bricks: SVG rectangles with studs, face/edge/shine per colour; ghost bricks dashed (blue for the next row).
- Interest tiles are bricks with four studs; selected = filled in the theme colour and pressed down.
- Parts callout ("You'll need"): yellow-ringed box with count chips like "8x equal parts", then numbered hint rungs.
- Number pad: 3x4 grid, 60-64px keys, also driven by the physical keyboard.

## Motion
- One authored moment: a correct answer drops the new brick row in (420ms ease-out, slight settle). Wrong answers nudge the answer box. Hints rise in. All disabled under prefers-reduced-motion.

## Layout
- Tablet landscape first: question panel with pad beside it, build model in a sticky right column. Below 1024px the model becomes a compact strip above the panel.
