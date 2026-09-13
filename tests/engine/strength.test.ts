import { describe, it, expect } from 'vitest';
import { INITIAL_STRENGTH, decayStrengths, updateStrengths } from '../../src/engine/strength';
import type { ScoredResponse } from '../../src/engine/types';

const r = (itemKey: string, correct: boolean): ScoredResponse => ({ itemKey, correct, activity: 'tap', isReview: false, parentMarked: false });

describe('strengths', () => {
  it('starts new items at the initial value and moves up on correct', () => {
    const s = updateStrengths({}, [r('word:1.1:map', true)], 1);
    expect(s['word:1.1:map'].value).toBeCloseTo(INITIAL_STRENGTH + (1 - INITIAL_STRENGTH) * 0.2);
    expect(s['word:1.1:map'].lastSeen).toBe(1);
  });

  it('halves on a miss', () => {
    const s = updateStrengths({ 'card:a': { value: 0.8, lastSeen: 1 } }, [r('card:a', false)], 2);
    expect(s['card:a'].value).toBeCloseTo(0.4);
    expect(s['card:a'].lastSeen).toBe(2);
  });

  it('does not mutate the input', () => {
    const before = { 'card:a': { value: 0.8, lastSeen: 1 } };
    updateStrengths(before, [r('card:a', false)], 2);
    expect(before['card:a'].value).toBe(0.8);
  });

  it('decays unseen items toward the middle without touching lastSeen', () => {
    const s = decayStrengths({ old: { value: 1, lastSeen: 1 }, fresh: { value: 1, lastSeen: 9 } }, 10);
    expect(s.old.value).toBeCloseTo(0.95);
    expect(s.old.lastSeen).toBe(1);
    expect(s.fresh.value).toBe(1);
  });
});
