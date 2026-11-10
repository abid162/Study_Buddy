import { Y4_TEMPLATES } from './templates.y4';
import { Y4_DECIMAL_TEMPLATES } from './templates.y4.decimals';
import { Y4_AUTHORED } from './authored.y4';
import { Y5_NUMBER } from './templates.y5.number';
import { Y5_REST } from './templates.y5.rest';
import { Y6_NUMBER } from './templates.y6.number';
import { Y6_REST } from './templates.y6.rest';
import { Y56_AUTHORED } from './authored.y56';
import type { Template } from './types';

/** Every Year 4 maths template and hand-written item built so far. */
export const ALL_TEMPLATES: Template[] = [...Y4_TEMPLATES, ...Y4_DECIMAL_TEMPLATES, ...Y4_AUTHORED, ...Y5_NUMBER, ...Y5_REST, ...Y6_NUMBER, ...Y6_REST, ...Y56_AUTHORED];
export { SKINS, withActors } from './skins';
export { render, seedsFor, generateBank, checkAnswer } from './generate';
export type { Question, Template, Skin, Level } from './types';
