export type Level = 1 | 2 | 3;
export type Hints = [string, string, string];

/** Words that change per world. Numbers never come from here. */
export interface Ctx {
  actor: string;   // character name (football/wrestling: from src/data/stars.ts)
  thing: string;   // plural countable noun, e.g. "stickers"
  thing2: string;  // a different plural noun, for two-item problems
  crowd: string;   // plural people noun, e.g. "fans"
  place: string;   // e.g. "the stadium" (use mid-sentence only)
}

export interface Skin {
  id: string;
  name: string;
  actors: string[];
  things: string[];
  crowd: string;
  place: string;
}

export interface Mistake { value: number; message: string }

/** What a template's build() returns. */
export interface Draft {
  text: string;
  answer: number;
  hints: Hints;                       // 1 nudge, 2 method, 3 walk-through
  mistakes: Mistake[];                // specific wrong answers and why
  params: Record<string, number | string | undefined>; // numbers only: identical across worlds
  alt?: number;                       // independent recomputation, checked by verify.ts
}

export interface Template {
  id: string;
  curriculumId: string;               // e.g. MA-Y4-FR-03
  year: 4 | 5 | 6;
  /** Hand-written item with fixed numbers: one variant, one level. */
  fixed?: boolean;
  /** Levels this template covers (default 1, 2 and 3). */
  levels?: Level[];
  /** Return null to reject these random numbers and let the generator retry. */
  build(r: () => number, ctx: Ctx, level: Level): Draft | null;
}

export interface Question {
  id: string;        // coreId@world
  coreId: string;    // same across worlds: use this for mastery tracking
  templateId: string;
  curriculumId: string;
  year: number;
  level: Level;
  world: string;
  text: string;
  answer: number;
  hints: Hints;
  mistakes: Record<string, string>;  // keyed by the wrong number as typed
  params: Record<string, number | string | undefined>;
}
