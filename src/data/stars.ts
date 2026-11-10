/**
 * STAR CAST: the real, well-known people who appear in every world's questions (4 per world).
 *
 * To change a star, edit the text between the quotes and save. Every question that uses
 * that star updates automatically, including "he/she" and "his/her".
 *
 *   name      Full name shown in questions, e.g. 'Leo Santos'
 *   nickname  Shown on the question card, e.g. 'The Rocket' (use '' for none)
 *   pronoun   'he' or 'she' (used for "He scores...", "his team")
 *   role      Short description shown on the question card
 *
 * Keep exactly 4 stars in each list.
 * Real athletes, chosen by the team (10 Nov 2026). Questions are made-up practice scenarios, not real events.
 */

import type { IslandId } from './world'

export interface Star {
  name: string
  nickname: string
  pronoun: 'he' | 'she'
  role: string
}

export const FOOTBALL_STARS: Star[] = [
  { name: 'Lionel Messi', nickname: 'La Pulga', pronoun: 'he', role: 'Argentina forward' },
  { name: 'Cristiano Ronaldo', nickname: 'CR7', pronoun: 'he', role: 'Portugal forward' },
  { name: 'Mohamed Salah', nickname: 'The Egyptian King', pronoun: 'he', role: 'Egypt forward' },
  { name: 'Alessia Russo', nickname: '', pronoun: 'she', role: 'England striker' },
]

export const WRESTLING_STARS: Star[] = [
  { name: 'Roman Reigns', nickname: 'The Tribal Chief', pronoun: 'he', role: 'WWE Superstar' },
  { name: 'Cody Rhodes', nickname: 'The American Nightmare', pronoun: 'he', role: 'WWE Superstar' },
  { name: 'Drew McIntyre', nickname: 'The Scottish Warrior', pronoun: 'he', role: 'WWE Superstar' },
  { name: 'Rhea Ripley', nickname: '', pronoun: 'she', role: 'WWE Superstar' },
]

export const MUSIC_STARS: Star[] = [
  { name: 'Taylor Swift', nickname: '', pronoun: 'she', role: 'Singer-songwriter' },
  { name: 'Ed Sheeran', nickname: '', pronoun: 'he', role: 'Singer-songwriter' },
  { name: 'Jungkook', nickname: '', pronoun: 'he', role: 'BTS singer' },
  { name: 'Lisa', nickname: '', pronoun: 'she', role: 'BLACKPINK rapper and dancer' },
]

export const STORY_STARS: Star[] = [
  { name: 'Julia Donaldson', nickname: '', pronoun: 'she', role: 'Author of The Gruffalo' },
  { name: 'David Walliams', nickname: '', pronoun: 'he', role: 'Children’s author' },
  { name: 'Michael Morpurgo', nickname: '', pronoun: 'he', role: 'Author of War Horse' },
  { name: 'Jacqueline Wilson', nickname: '', pronoun: 'she', role: 'Children’s author' },
]

export const BRICKS_STARS: Star[] = [
  { name: 'Norman Foster', nickname: '', pronoun: 'he', role: 'Architect' },
  { name: 'Zaha Hadid', nickname: 'Queen of the Curve', pronoun: 'she', role: 'Architect' },
  { name: 'Isambard Kingdom Brunel', nickname: '', pronoun: 'he', role: 'Engineer' },
  { name: 'Roma Agrawal', nickname: '', pronoun: 'she', role: 'Structural engineer' },
]

export const SPACE_STARS: Star[] = [
  { name: 'Tim Peake', nickname: '', pronoun: 'he', role: 'British astronaut' },
  { name: 'Sunita Williams', nickname: 'Suni', pronoun: 'she', role: 'Astronaut' },
  { name: 'Neil Armstrong', nickname: '', pronoun: 'he', role: 'First person on the Moon' },
  { name: 'Rosemary Coogan', nickname: '', pronoun: 'she', role: 'British astronaut' },
]

/** Every world's cast, used by the maths and English questions and the question cards. */
export const STARS: Record<IslandId, Star[]> = {
  football: FOOTBALL_STARS,
  wrestling: WRESTLING_STARS,
  music: MUSIC_STARS,
  story: STORY_STARS,
  bricks: BRICKS_STARS,
  space: SPACE_STARS,
}
