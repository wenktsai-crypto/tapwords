import type { Content } from './types';
import { CARDS } from './cards';
import { SUBSTEP_1_1 } from './substeps/s1-1';
import { SUBSTEP_1_2 } from './substeps/s1-2';
import { SUBSTEP_1_3 } from './substeps/s1-3';
import { SUBSTEP_1_4 } from './substeps/s1-4';
import { SUBSTEP_1_5 } from './substeps/s1-5';

export const CONTENT: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5],
};
