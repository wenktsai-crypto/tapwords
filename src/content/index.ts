import type { Content } from './types';
import { CARDS } from './cards';
import { SUBSTEP_1_1 } from './substeps/s1-1';
import { SUBSTEP_1_2 } from './substeps/s1-2';
import { SUBSTEP_1_3 } from './substeps/s1-3';
import { SUBSTEP_1_4 } from './substeps/s1-4';
import { SUBSTEP_1_5 } from './substeps/s1-5';
import { SUBSTEP_1_6 } from './substeps/s1-6';
import { SUBSTEP_2_1 } from './substeps/s2-1';
import { SUBSTEP_2_2 } from './substeps/s2-2';
import { SUBSTEP_2_3 } from './substeps/s2-3';
import { SUBSTEP_2_4 } from './substeps/s2-4';
import { SUBSTEP_2_5 } from './substeps/s2-5';
import { SUBSTEP_3_1 } from './substeps/s3-1';
import { SUBSTEP_3_2 } from './substeps/s3-2';
import { SUBSTEP_3_3 } from './substeps/s3-3';
import { SUBSTEP_3_4 } from './substeps/s3-4';
import { SUBSTEP_3_5 } from './substeps/s3-5';
import { SUBSTEP_4_1 } from './substeps/s4-1';
import { SUBSTEP_4_2 } from './substeps/s4-2';
import { SUBSTEP_4_3 } from './substeps/s4-3';
import { SUBSTEP_4_4 } from './substeps/s4-4';
import { SUBSTEP_4_5 } from './substeps/s4-5';
import { SUBSTEP_4_6 } from './substeps/s4-6';

export const CONTENT: Content = {
  cards: CARDS,
  substeps: [
    SUBSTEP_1_1, SUBSTEP_1_2, SUBSTEP_1_3, SUBSTEP_1_4, SUBSTEP_1_5, SUBSTEP_1_6,
    SUBSTEP_2_1, SUBSTEP_2_2, SUBSTEP_2_3, SUBSTEP_2_4, SUBSTEP_2_5,
    SUBSTEP_3_1, SUBSTEP_3_2, SUBSTEP_3_3, SUBSTEP_3_4, SUBSTEP_3_5,
    SUBSTEP_4_1, SUBSTEP_4_2, SUBSTEP_4_3, SUBSTEP_4_4, SUBSTEP_4_5, SUBSTEP_4_6,
  ],
};
