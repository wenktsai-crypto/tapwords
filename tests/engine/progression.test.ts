import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep } from '../../src/content/types';
import { ADVANCE, accuracy, finishSession, moveTo, placementLists, shouldAdvance, suggestPlacement } from '../../src/engine/progression';
import { cardKey, initialState, type ProfileState, type ScoredResponse, type SessionLog } from '../../src/engine/types';
import { seeded } from '../../src/engine/rng';

const base: Omit<Substep, 'id' | 'groups'> = { title: '', parentSummary: '', concepts: [], sightWords: [], sentences: [], stories: [], words: [cvc('map'), cvcNonsense('mip')] };
const s11: Substep = { ...base, id: '1.1', groups: [{ cards: ['m', 'a', 'p'], lesson: [] }] };
const s12: Substep = { ...base, id: '1.2', groups: [{ cards: ['b'], lesson: [] }, { cards: ['u'], lesson: [] }] };
const s13: Substep = { ...base, id: '1.3', groups: [{ cards: [], lesson: [] }] };
const content: Content = { cards: CARDS, substeps: [s11, s12, s13] };

const resp = (correct: boolean, over: Partial<ScoredResponse> = {}): ScoredResponse => ({ itemKey: 'word:1.1:map', activity: 'tap', correct, isReview: false, parentMarked: false, ...over });

function log(sessionNumber: number, responses: ScoredResponse[], over: Partial<SessionLog> = {}): SessionLog {
  return { sessionNumber, date: '2026-09-12T00:00:00Z', substep: '1.1', complete: true, readAloudDone: false, responses, ...over };
}

/** n good sessions: 10 current correct, 4 review correct each. */
function goodLogs(n: number, from = 1): SessionLog[] {
  return Array.from({ length: n }, (_, i) => log(from + i, [...Array(10).fill(0).map(() => resp(true)), ...Array(4).fill(0).map(() => resp(true, { isReview: true }))]));
}

describe('accuracy', () => {
  it('returns null for no responses', () => expect(accuracy([])).toBeNull());
  it('computes the fraction correct', () => expect(accuracy([resp(true), resp(false)])).toBe(0.5));
});

describe('shouldAdvance', () => {
  const at = (sessions: number): ProfileState => ({ ...initialState('1.1'), sessionsCompleted: sessions });

  it('needs at least three complete sessions at the substep', () => {
    expect(shouldAdvance(at(2), goodLogs(2))).toBe(false);
    expect(shouldAdvance(at(3), goodLogs(3))).toBe(true);
    const oneIncomplete = goodLogs(3).map((l, i) => (i === 0 ? { ...l, complete: false } : l));
    expect(shouldAdvance(at(3), oneIncomplete)).toBe(false);
  });

  it('ignores sessions from before the child entered the substep', () => {
    const state = { ...at(6), substepEnteredAt: 4 };
    expect(shouldAdvance(state, goodLogs(6))).toBe(false);
  });

  it('requires 90% on current items and 85% on review over the last three sessions', () => {
    const weakCurrent = [...goodLogs(2), log(3, [...Array(8).fill(0).map(() => resp(true)), resp(false), resp(false), resp(false), resp(false)])];
    expect(shouldAdvance(at(3), weakCurrent)).toBe(false);
    const weakReview = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(4).fill(0).map(() => resp(false, { isReview: true }))])];
    expect(shouldAdvance(at(3), weakReview)).toBe(false);
  });

  it('holds the child when the latest read-aloud at this substep failed', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), resp(false, { activity: 'read-aloud', parentMarked: true }), resp(false, { activity: 'read-aloud', parentMarked: true })], { readAloudDone: true })];
    expect(shouldAdvance(at(3), logs)).toBe(false);
  });

  it('advances when the latest read-aloud passed', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(5).fill(0).map(() => resp(true, { activity: 'read-aloud', parentMarked: true }))], { readAloudDone: true })];
    expect(shouldAdvance(at(3), logs)).toBe(true);
  });

  it('does not use parent-marked responses in the solo accuracy', () => {
    const logs = [...goodLogs(2), log(3, [...Array(10).fill(0).map(() => resp(true)), ...Array(5).fill(0).map(() => resp(true, { activity: 'read-aloud', parentMarked: true })), resp(false, { parentMarked: true, activity: 'read-aloud' })], { readAloudDone: true })];
    // read-aloud 5/6 = 0.83 < 0.85 -> hold; solo accuracy would be fine
    expect(shouldAdvance(at(3), logs)).toBe(false);
  });

  it('allows advancing with no read-aloud only if none happened in the last five sessions', () => {
    const state = { ...at(8), substepEnteredAt: 5 };
    const earlierRA = log(4, [resp(true, { activity: 'read-aloud', parentMarked: true })], { substep: '1.0', readAloudDone: true });
    const logs = [log(1, []), log(2, []), log(3, []), earlierRA, ...goodLogs(4, 5)];
    expect(shouldAdvance(state, logs)).toBe(false);
    const older = [earlierRA, log(2, []), log(3, []), log(4, []), ...goodLogs(4, 5)].map((l, i) => ({ ...l, sessionNumber: i + 1 }));
    expect(shouldAdvance({ ...state, substepEnteredAt: 4 }, older)).toBe(true);
  });
});

describe('finishSession', () => {
  it('increments the session count, applies strengths, clears lessonPending, queues read-aloud if skipped', () => {
    const state = initialState('1.1');
    const l = log(1, [resp(true), resp(false, { itemKey: cardKey('a'), activity: 'sound-reverse' })]);
    const out = finishSession(state, l, [], content);
    expect(out.state.sessionsCompleted).toBe(1);
    expect(out.state.lessonPending).toBe(false);
    expect(out.state.pendingReadAloud).toBe(true);
    expect(out.state.strengths['word:1.1:map'].value).toBeCloseTo(0.6);
    expect(out.state.strengths[cardKey('a')].value).toBeCloseTo(0.25);
    expect(out.advancedTo).toBeNull();
    expect(out.groupAdvanced).toBe(false);
  });

  it('records a done read-aloud', () => {
    const out = finishSession(initialState('1.1'), log(1, [], { readAloudDone: true }), [], content);
    expect(out.state.pendingReadAloud).toBe(false);
    expect(out.state.lastReadAloudSession).toBe(1);
  });

  it('advances to the next substep when the rule is met', () => {
    const state = { ...initialState('1.1'), sessionsCompleted: 2, lessonPending: false };
    const prev = goodLogs(2);
    const out = finishSession(state, goodLogs(1, 3)[0], prev, content);
    expect(out.advancedTo).toBe('1.2');
    expect(out.state.currentSubstep).toBe('1.2');
    expect(out.state.currentGroup).toBe(0);
    expect(out.state.substepEnteredAt).toBe(3);
    expect(out.state.lessonPending).toBe(true);
  });

  /** n reverse-drill answers on card "b", the only card in group 1 of substep 1.2. */
  const reverseB = (n: number, correct = true) =>
    Array.from({ length: n }, () => resp(correct, { itemKey: cardKey('b'), activity: 'sound-reverse' }));
  const atGroup0 = (): ProfileState => ({ ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 });

  it('moves to the next card group when reverse-drill accuracy on the group is high, before advancing the substep', () => {
    const l = log(6, reverseB(3), { substep: '1.2' });
    const out = finishSession(atGroup0(), l, [], content);
    expect(out.groupAdvanced).toBe(true);
    expect(out.state.currentGroup).toBe(1);
    expect(out.state.lessonPending).toBe(true);
    expect(out.advancedTo).toBeNull();
  });

  it('does not move groups on a weak reverse drill', () => {
    const l = log(6, [...reverseB(2), ...reverseB(1, false)], { substep: '1.2' });
    expect(finishSession(atGroup0(), l, [], content).state.currentGroup).toBe(0);
  });

  it('does not move groups when the session was stopped early, however good the group drill was', () => {
    const l = log(6, reverseB(4), { substep: '1.2', complete: false });
    const out = finishSession(atGroup0(), l, [], content);
    expect(out.groupAdvanced).toBe(false);
    expect(out.state.currentGroup).toBe(0);
  });

  it('does not move groups on fewer than three reverse answers for the group', () => {
    const l = log(6, reverseB(2), { substep: '1.2' });
    const out = finishSession(atGroup0(), l, [], content);
    expect(out.groupAdvanced).toBe(false);
    expect(out.state.currentGroup).toBe(0);
  });

  it('never advances past the last substep', () => {
    const state = { ...initialState('1.3'), sessionsCompleted: 2 };
    const out = finishSession(state, { ...goodLogs(1, 3)[0], substep: '1.3' }, goodLogs(2).map((l) => ({ ...l, substep: '1.3' })), content);
    expect(out.advancedTo).toBeNull();
    expect(out.state.currentSubstep).toBe('1.3');
  });
});

describe('moveTo', () => {
  it('resets group, entry point and lesson flag', () => {
    const s = moveTo({ ...initialState('1.1'), sessionsCompleted: 7, currentGroup: 1, lessonPending: false }, '1.3');
    expect(s).toMatchObject({ currentSubstep: '1.3', currentGroup: 0, substepEnteredAt: 7, lessonPending: true, sessionsCompleted: 7 });
  });
});

describe('suggestPlacement', () => {
  it('returns the last list that passed, or 1.1', () => {
    expect(suggestPlacement([])).toBe('1.1');
    expect(suggestPlacement([{ substep: '1.1', correct: 4, total: 8 }])).toBe('1.1');
    expect(suggestPlacement([{ substep: '1.1', correct: 8, total: 8 }, { substep: '1.3', correct: 6, total: 8 }, { substep: '1.6', correct: 3, total: 8 }])).toBe('1.3');
    expect(suggestPlacement([{ substep: '1.1', correct: 8, total: 8 }, { substep: '1.3', correct: 5, total: 8 }, { substep: '1.6', correct: 8, total: 8 }])).toBe('1.1');
  });
  it('exposes the thresholds', () => {
    expect(ADVANCE.current).toBe(0.9);
  });
});

describe('placementLists', () => {
  it('returns 5 real and 3 nonsense words for each placement substep that exists, in order', () => {
    const one = CONTENT.substeps[0];
    const content: Content = {
      cards: CARDS,
      substeps: [one, { ...one, id: '1.2', title: 'x', words: [cvc('bat')] }, { ...one, id: '1.3', title: 'Digraphs', words: one.words }],
    };
    const lists = placementLists(content, seeded(1));
    expect(lists.map((l) => l.substep)).toEqual(['1.1', '1.3']);
    expect(lists[1].title).toBe('Digraphs');
    for (const l of lists) {
      expect(l.words.filter((w) => w.kind === 'real').length).toBe(5);
      expect(l.words.filter((w) => w.kind === 'nonsense').length).toBe(3);
      expect(new Set(l.words.map((w) => w.text)).size).toBe(8);
    }
  });
});
