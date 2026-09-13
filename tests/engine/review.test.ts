import { describe, it, expect } from 'vitest';
import { pickReview, type Candidate } from '../../src/engine/review';
import { seeded } from '../../src/engine/rng';

const cands: Candidate<string>[] = [
  { key: 'card:a', substep: '1.1', item: 'a' },
  { key: 'card:b', substep: '1.1', item: 'b' },
  { key: 'card:c', substep: '1.2', item: 'c' },
  { key: 'card:d', substep: '1.2', item: 'd' },
];

describe('pickReview', () => {
  it('returns nothing for n <= 0 or no candidates', () => {
    expect(pickReview(cands, {}, 0, 5, seeded(1))).toEqual([]);
    expect(pickReview([], {}, 3, 5, seeded(1))).toEqual([]);
  });

  it('never returns duplicates and never more than n', () => {
    for (let seed = 0; seed < 20; seed++) {
      const out = pickReview(cands, {}, 3, 5, seeded(seed));
      expect(out.length).toBe(3);
      expect(new Set(out).size).toBe(3);
    }
  });

  it('prefers weak items', () => {
    const strengths = { 'card:a': { value: 0.05, lastSeen: 5 }, 'card:b': { value: 0.99, lastSeen: 5 }, 'card:c': { value: 0.99, lastSeen: 5 }, 'card:d': { value: 0.99, lastSeen: 5 } };
    let hits = 0;
    for (let seed = 0; seed < 50; seed++) if (pickReview(cands, strengths, 1, 5, seeded(seed))[0] === 'a') hits++;
    expect(hits).toBeGreaterThan(35);
  });

  it('forces one item from any substep not touched recently', () => {
    // 1.1 seen this session, strong; 1.2 never seen -> 1.2 must appear
    const strengths = { 'card:a': { value: 0.99, lastSeen: 5 }, 'card:b': { value: 0.99, lastSeen: 5 } };
    for (let seed = 0; seed < 20; seed++) {
      const out = pickReview(cands, strengths, 1, 5, seeded(seed));
      expect(['c', 'd']).toContain(out[0]);
    }
  });
});
