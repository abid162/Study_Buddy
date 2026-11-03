/**
 * STAR CAST: the players and wrestlers who appear in the Football and Wrestling questions.
 *
 * To change a star, edit the text between the quotes and save. Every question that uses
 * that star updates automatically, including "he/she" and "his/her".
 *
 *   name      Full name shown in questions, e.g. 'Leo Santos'
 *   nickname  Shown on the question card, e.g. 'The Rocket' (use '' for none)
 *   pronoun   'he' or 'she' (used for "He scores...", "his team")
 *   role      Short description shown on the question card
 *
 * Keep exactly 4 stars in each list (questions refer to stars 1 to 4 by position).
 * These are invented characters. If you swap in real people, check with the client first.
 */

export interface Star {
  name: string
  nickname: string
  pronoun: 'he' | 'she'
  role: string
}

export const FOOTBALL_STARS: Star[] = [
  { name: 'Leo Santos', nickname: 'The Rocket', pronoun: 'he', role: 'Stadium FC striker' },
  { name: 'Ava Okafor', nickname: 'Safe Hands', pronoun: 'she', role: 'Stadium FC goalkeeper' },
  { name: 'Kai Moreno', nickname: 'The Magician', pronoun: 'he', role: 'Stadium FC captain' },
  { name: 'Zara Bell', nickname: 'Lightning', pronoun: 'she', role: 'Stadium FC winger' },
]

export const WRESTLING_STARS: Star[] = [
  { name: 'Titan Torres', nickname: 'The Thunder', pronoun: 'he', role: 'Thunder Belt champion' },
  { name: 'Ruby Steel', nickname: 'The Red Storm', pronoun: 'she', role: 'Tag team champion' },
  { name: 'Max Mountain', nickname: 'The Unmovable', pronoun: 'he', role: 'Heavyweight contender' },
  { name: 'Jade Phoenix', nickname: 'High Flyer', pronoun: 'she', role: 'Arena fan favourite' },
]
