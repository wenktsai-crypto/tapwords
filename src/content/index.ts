import type { Content } from './types';
import { CARDS } from './cards';
import { SUBSTEP_1_1 } from './substeps/s1-1';

export const CONTENT: Content = {
  cards: CARDS,
  substeps: [SUBSTEP_1_1],
};
