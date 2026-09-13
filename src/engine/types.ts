export type Activity =
  | 'sound-reverse'
  | 'tap'
  | 'find'
  | 'build'
  | 'spell-sound'
  | 'spell-word'
  | 'spell-sentence'
  | 'read-aloud'
  | 'story-question';

export interface Strength {
  value: number;      // 0..1
  lastSeen: number;   // session number
}
export type Strengths = Record<string, Strength>;

export interface ProfileState {
  currentSubstep: string;
  currentGroup: number;
  sessionsCompleted: number;
  substepEnteredAt: number;          // sessionsCompleted when this substep was entered
  strengths: Strengths;
  pendingReadAloud: boolean;         // a read-aloud was skipped; offer it first next time
  lessonPending: boolean;            // run the full mini-lesson next session
  lastReadAloudSession: number | null;
}

export interface ScoredResponse {
  itemKey: string;
  activity: Activity;
  correct: boolean;
  isReview: boolean;
  parentMarked: boolean;
}

export interface SessionLog {
  sessionNumber: number;
  date: string;          // ISO
  substep: string;
  complete: boolean;     // false if the child stopped early
  readAloudDone: boolean;
  responses: ScoredResponse[];
}

export const cardKey = (id: string) => `card:${id}`;
export const wordKey = (substep: string, text: string) => `word:${substep}:${text}`;
export const sentenceKey = (substep: string, text: string) => `sentence:${substep}:${text}`;
export const storyKey = (substep: string, title: string, i: number) => `story:${substep}:${title}:${i}`;

export function initialState(substep: string): ProfileState {
  return {
    currentSubstep: substep,
    currentGroup: 0,
    sessionsCompleted: 0,
    substepEnteredAt: 0,
    strengths: {},
    pendingReadAloud: false,
    lessonPending: true,
    lastReadAloudSession: null,
  };
}
