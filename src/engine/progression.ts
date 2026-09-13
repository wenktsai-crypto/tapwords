import type { Content, Word } from '../content/types';
import { getSubstep, substepIndex } from './availability';
import { sample, shuffle, type Rng } from './rng';
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
  groupReverseMin: 3,
};

export function accuracy(responses: ScoredResponse[]): number | null {
  if (responses.length === 0) return null;
  return responses.filter((r) => r.correct).length / responses.length;
}

/**
 * `logs` must be in ascending session order — the read-aloud grace check reads the tail of the
 * list as "the last few sessions". The runner's store returns logs already sorted that way.
 */
export function shouldAdvance(state: ProfileState, logs: SessionLog[]): boolean {
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
    // Only a finished session with a real sample of the group's cards can move the child on: a
    // session stopped early, or one that happened to show this group's cards once or twice, is
    // not evidence that the group is learned.
    const groupAnswers = log.responses.filter((r) => r.activity === 'sound-reverse' && groupCards.has(r.itemKey));
    const acc = accuracy(groupAnswers);
    if (log.complete && groupAnswers.length >= ADVANCE.groupReverseMin && acc !== null && acc >= ADVANCE.groupReverse) {
      return { state: { ...next, currentGroup: groupIndex + 1, lessonPending: true }, advancedTo: null, groupAdvanced: true };
    }
    return { state: next, advancedTo: null, groupAdvanced: false };
  }

  const idx = substepIndex(content, sub.id);
  if (idx < content.substeps.length - 1 && shouldAdvance(next, [...previousLogs, log])) {
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

export interface PlacementList {
  substep: string;
  title: string;
  words: Word[];
}

/** Short word lists for the placement check, one per placement substep present in the content. */
export function placementLists(content: Content, rng: Rng, counts = { real: 5, nonsense: 3 }): PlacementList[] {
  return PLACEMENT_SUBSTEPS.filter((id) => content.substeps.some((s) => s.id === id)).map((id) => {
    const sub = getSubstep(content, id);
    const real = sample(sub.words.filter((w) => w.kind === 'real'), counts.real, rng);
    const nonsense = sample(sub.words.filter((w) => w.kind === 'nonsense'), counts.nonsense, rng);
    return { substep: id, title: sub.title, words: shuffle([...real, ...nonsense], rng) };
  });
}
