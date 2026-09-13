import type { Content } from '../content/types';
import { getSubstep, substepIndex } from './availability';
import { decayStrengths, updateStrengths } from './strength';
import { cardKey, type ProfileState, type ScoredResponse, type SessionLog } from './types';

export const ADVANCE = {
  minSessions: 3,
  window: 3,
  current: 0.9,
  review: 0.85,
  readAloud: 0.85,
  readAloudGrace: 5,
  groupReverse: 0.8,
};

export function accuracy(responses: ScoredResponse[]): number | null {
  if (responses.length === 0) return null;
  return responses.filter((r) => r.correct).length / responses.length;
}

export function shouldAdvance(state: ProfileState, logs: SessionLog[], content: Content): boolean {
  const here = logs.filter((l) => l.substep === state.currentSubstep && l.complete && l.sessionNumber > state.substepEnteredAt);
  if (here.length < ADVANCE.minSessions) return false;
  if (state.sessionsCompleted - state.substepEnteredAt < ADVANCE.minSessions) return false;

  const recent = here.slice(-ADVANCE.window).flatMap((l) => l.responses).filter((r) => !r.parentMarked);
  const cur = accuracy(recent.filter((r) => !r.isReview));
  const rev = accuracy(recent.filter((r) => r.isReview));
  if (cur === null || cur < ADVANCE.current) return false;
  if (rev !== null && rev < ADVANCE.review) return false;

  const lastRA = [...here].reverse().find((l) => l.readAloudDone);
  if (lastRA) {
    const a = accuracy(lastRA.responses.filter((r) => r.parentMarked));
    return a === null || a >= ADVANCE.readAloud;
  }
  const lastFew = [...logs].sort((a, b) => a.sessionNumber - b.sessionNumber).slice(-ADVANCE.readAloudGrace);
  return !lastFew.some((l) => l.readAloudDone);
}

export interface FinishResult {
  state: ProfileState;
  advancedTo: string | null;
  groupAdvanced: boolean;
}

export function finishSession(state: ProfileState, log: SessionLog, previousLogs: SessionLog[], content: Content): FinishResult {
  const n = state.sessionsCompleted + 1;
  const sub = getSubstep(content, state.currentSubstep);
  const strengths = decayStrengths(updateStrengths(state.strengths, log.responses, n), n);
  const next: ProfileState = {
    ...state,
    strengths,
    sessionsCompleted: n,
    lessonPending: false,
    pendingReadAloud: !log.readAloudDone,
    lastReadAloudSession: log.readAloudDone ? n : state.lastReadAloudSession,
  };

  const groupIndex = Math.min(state.currentGroup, sub.groups.length - 1);
  if (groupIndex < sub.groups.length - 1) {
    const groupCards = new Set(sub.groups[groupIndex].cards.map(cardKey));
    const acc = accuracy(log.responses.filter((r) => r.activity === 'sound-reverse' && groupCards.has(r.itemKey)));
    if (acc !== null && acc >= ADVANCE.groupReverse) {
      return { state: { ...next, currentGroup: groupIndex + 1, lessonPending: true }, advancedTo: null, groupAdvanced: true };
    }
    return { state: next, advancedTo: null, groupAdvanced: false };
  }

  const idx = substepIndex(content, sub.id);
  if (idx < content.substeps.length - 1 && shouldAdvance(next, [...previousLogs, log], content)) {
    const to = content.substeps[idx + 1].id;
    return { state: { ...next, currentSubstep: to, currentGroup: 0, substepEnteredAt: n, lessonPending: true }, advancedTo: to, groupAdvanced: false };
  }
  return { state: next, advancedTo: null, groupAdvanced: false };
}

export function moveTo(state: ProfileState, substepId: string): ProfileState {
  return { ...state, currentSubstep: substepId, currentGroup: 0, substepEnteredAt: state.sessionsCompleted, lessonPending: true };
}

export const PLACEMENT_SUBSTEPS = ['1.1', '1.3', '1.6', '2.2', '2.5', '3.1', '3.4'];
export const PLACEMENT_PASS = 0.75;

export interface PlacementResult {
  substep: string;
  correct: number;
  total: number;
}

/** Results are given in PLACEMENT_SUBSTEPS order; the check stops at the first failure. */
export function suggestPlacement(results: PlacementResult[]): string {
  let last = '1.1';
  for (const r of results) {
    if (r.total === 0 || r.correct / r.total < PLACEMENT_PASS) break;
    last = r.substep;
  }
  return last;
}
