/**
 * STAR CAST: the players and wrestlers who appear in the Football and Wrestling questions.
 *
 * To change a star, edit the text between the quotes and save. Every question that uses
 * that star updates automatically, including "he/she" and "his/her".
 *
 *   name      Full name shown in questions, e.g. 'Lionel Messi'
 *   nickname  Shown on the question card, e.g. 'La Pulga' (use '' for none)
 *   pronoun   'he' or 'she' (used for "He scores...", "his team")
 *   role      Short description shown on the question card
 *
 * Keep exactly 4 stars in each list (questions refer to stars 1 to 4 by position).
 * These are real people. Roles avoid clubs and current titles so they don't go out of date.
 */

export interface Star {
  name: string
  nickname: string
  pronoun: 'he' | 'she'
  role: string
}

export const FOOTBALL_STARS: Star[] = [
  { name: 'Lionel Messi', nickname: 'La Pulga', pronoun: 'he', role: 'Argentina forward' },
  { name: 'Emiliano Martínez', nickname: 'Dibu', pronoun: 'he', role: 'Argentina goalkeeper' },
  { name: 'Cristiano Ronaldo', nickname: 'CR7', pronoun: 'he', role: 'Portugal captain' },
  { name: 'Mohamed Salah', nickname: 'The Egyptian King', pronoun: 'he', role: 'Egypt winger' },
]

export const WRESTLING_STARS: Star[] = [
  { name: 'John Cena', nickname: 'The Champ', pronoun: 'he', role: 'Record-breaking world champion' },
  { name: 'Rhea Ripley', nickname: 'The Eradicator', pronoun: 'she', role: 'WWE women\u2019s champion' },
  { name: 'Roman Reigns', nickname: 'The Tribal Chief', pronoun: 'he', role: 'Heavyweight superstar' },
  { name: 'Bianca Belair', nickname: 'The EST', pronoun: 'she', role: 'Fan favourite' },
]