import type { Strengths } from './types';
import { INITIAL_STRENGTH } from './strength';
import { sample, type Rng } from './rng';

export interface Candidate<T> {
  key: string;
  substep: string;
  item: T;
}

/** A substep untouched for this many sessions gets one forced review item. */
export const REVIEW_FLOOR_SESSIONS = 4;

export function pickReview<T>(cands: Candidate<T>[], strengths: Strengths, n: number, sessionNumber: number, rng: Rng): T[] {
  if (n <= 0 || cands.length === 0) return [];
  const chosen: Candidate<T>[] = [];
  const remaining = [...cands];
  const take = (c: Candidate<T>) => {
    chosen.push(c);
    remaining.splice(remaining.indexOf(c), 1);
  };

  for (const s of [...new Set(cands.map((c) => c.substep))]) {
    if (chosen.length >= n) break;
    const items = remaining.filter((c) => c.substep === s);
    const touched = items.some((c) => {
      const st = strengths[c.key];
      return st !== undefined && sessionNumber - st.lastSeen <= REVIEW_FLOOR_SESSIONS;
    });
    if (!touched && items.length > 0) take(sample(items, 1, rng)[0]);
  }

  while (chosen.length < n && remaining.length > 0) {
    const weights = remaining.map((c) => 1 - (strengths[c.key]?.value ?? INITIAL_STRENGTH) + 0.05);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let i = 0;
    while (i < remaining.length - 1 && r >= weights[i]) {
      r -= weights[i];
      i++;
    }
    take(remaining[i]);
  }
  return chosen.map((c) => c.item);
}
