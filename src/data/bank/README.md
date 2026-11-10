# Study Buddy question bank (Maths, Years 4 to 6)

Drop these files into `src/data/bank/`. Built so far: 112 of 140 statements (everything tagged TEMPLATE or HAND). Not built yet: the 23 DIAGRAM statements (the pictures will be built separately) and the 5 INTERACTIVE ones. See the tagging workbook.

| File | Purpose |
| --- | --- |
| `types.ts` | Shared types (Template, Question, Skin) |
| `rng.ts` | Seeded random numbers and number formatting |
| `skins.ts` | The 6 worlds: character names, objects, crowd, place |
| `templates.y4.ts` | 25 Year 4 whole-number templates, each with 3 difficulty levels |
| `templates.y4.decimals.ts` | 5 Year 4 decimal templates (FR-05 to FR-09) |
| `authored.y4.ts` | 18 hand-written problems (PV-08, MD-05, FR-10): fixed numbers, 6 per statement |
| `templates.y5.number.ts`, `templates.y5.rest.ts` | Year 5: number and calculation; fractions, measures, geometry, statistics (33 statements) |
| `templates.y6.number.ts`, `templates.y6.rest.ts` | Year 6: number and fractions; ratio, algebra, measures, geometry, statistics (35 statements) |
| `authored.y56.ts` | 42 hand-written Year 5 problems and 42 Year 6 problems (the HAND statements) |
| `helpers.ts` | Shared maths helpers (gcd, lcm, primes, mistake lists) |
| `index.ts` | `ALL_TEMPLATES` plus the main exports: import from here |
| `generate.ts` | `render()` one question; `generateBank()` for many; `checkAnswer()` for what the child types |
| `verify.ts` | Checks every generated question (run before every push) |
| `coverage.ts`, `dump.ts` | Helpers that print JSON for review sheets |

## How it works
- A **core question** is a template + level + seed. The numbers depend only on those, so the same core question has the same numbers in every world, and `coreId` can be used for mastery tracking.
- A **skin** only changes words: who, what object, what place. Adding a 7th world means one new entry in `skins.ts`.
- Answers, hints and wrong-answer messages are produced in code. No AI call at runtime.

## Use in the app
```ts
import { ALL_TEMPLATES, SKINS, withActors, render, seedsFor, checkAnswer } from './bank';

const skin = withActors(SKINS.find(s => s.id === 'football')!, starNamesFromStarsTs);
const t = ALL_TEMPLATES.find(x => x.curriculumId === 'MA-Y4-FR-03')!;
const seed = seedsFor(t, 2, 4)[0]!;          // level 2, first of 4 distinct variants
const q = render(t, 2, seed, skin)!;         // { text, answer, hints[3], mistakes, ... }

const res = checkAnswer(q, childTypedText);  // { valid, correct, message? }
```
`checkAnswer` accepts `7.5`, `7.50`, `.5`, `£7.50`, `1,250` and the minus sign (`-2` or `−2`).
If `valid` is false the text is not a number. If `correct` is false and `message` is set, show it as Nova's specific feedback.

## Checks
`npx tsx verify.ts` (needs `tsx`). Set `PER_LEVEL=12` to test more variants.
It checks: integer answers; an independent recomputation matches; no broken or double-spaced text;
exactly 3 hints; hints 1 and 2 do not reveal the answer; at least one wrong-answer message and none equal to the right answer;
numbers vary but wording differs by world; enough distinct variants per level.

## Notes
- Football and wrestling names in `skins.ts` are invented placeholders. Pass the real cast from `src/data/stars.ts` through `withActors()`.
- `verify.ts` and the helpers are Node scripts: keep them out of the Vite bundle.
- Negative answers (PV-03 and one hand-written problem) and decimal answers (FR-05 to FR-10) need an answer box that allows `-` and `.`.
- Hand-written items have a fixed `levels` and `fixed: true`; the verifier does not expect 4 variants from them.
