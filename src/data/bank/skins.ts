import type { Skin } from './types';

/**
 * Football and wrestling actors are PLACEHOLDERS with invented names.
 * In the app, replace them with the names from src/data/stars.ts via withActors().
 * (Check real names with the client first; many ring names are WWE trademarks.)
 */
export const SKINS: Skin[] = [
  {
    id: 'football', name: 'Football Stadium',
    actors: ['Rio Vale', 'Jax Mercer', 'Sam Okoro', 'Lena Fox'],
    things: ['stickers', 'tickets', 'scarves', 'water bottles'],
    crowd: 'fans', place: 'the stadium',
  },
  {
    id: 'wrestling', name: 'Wrestling Arena',
    actors: ['Big Bruno', 'Titan Tess', 'Iron Ivo', 'Mighty Mae'],
    things: ['tickets', 'posters', 'foam fingers', 'gym towels'],
    crowd: 'fans', place: 'the arena',
  },
  {
    id: 'music', name: 'Music Stage',
    actors: ['Luna', 'Ziggy', 'Echo', 'Melody'],
    things: ['guitar picks', 'tickets', 'glow sticks', 'drumsticks'],
    crowd: 'fans', place: 'the stage',
  },
  {
    id: 'story', name: 'Story Forest',
    actors: ['Pip', 'Willow', 'Fern', 'Rowan'],
    things: ['acorns', 'golden leaves', 'fireflies', 'map pieces'],
    crowd: 'villagers', place: 'the forest',
  },
  {
    id: 'bricks', name: 'Brick City',
    actors: ['Builder Bo', 'Brick Betty', 'Architect Ade', 'Tiny Tom'],
    things: ['bricks', 'blocks', 'windows', 'roof tiles'],
    crowd: 'visitors', place: 'Brick City',
  },
  {
    id: 'space', name: 'Space Station',
    actors: ['Commander Ada', 'Cadet Juno', 'Pilot Kit', 'Dr Orbit'],
    things: ['star crystals', 'moon rocks', 'fuel cells', 'space stickers'],
    crowd: 'visitors', place: 'the space station',
  },
];

export function withActors(skin: Skin, names: string[]): Skin {
  return names.length ? { ...skin, actors: names } : skin;
}
