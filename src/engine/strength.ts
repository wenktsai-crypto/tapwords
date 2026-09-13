import type { ScoredResponse, Strengths } from './types';

export const INITIAL_STRENGTH = 0.5;
export const DECAY_AFTER_SESSIONS = 5;

export function updateStrengths(strengths: Strengths, responses: ScoredResponse[], sessionNumber: number): Strengths {
  const next: Strengths = { ...strengths };
  for (const r of responses) {
    const v = next[r.itemKey]?.value ?? INITIAL_STRENGTH;
    next[r.itemKey] = { value: r.correct ? v + (1 - v) * 0.2 : v * 0.5, lastSeen: sessionNumber };
  }
  return next;
}

/** Items not seen for a while drift 10% toward the middle so they resurface in review. */
export function decayStrengths(strengths: Strengths, sessionNumber: number): Strengths {
  const next: Strengths = {};
  for (const [k, s] of Object.entries(strengths)) {
    const stale = sessionNumber - s.lastSeen > DECAY_AFTER_SESSIONS;
    next[k] = stale ? { value: s.value + (INITIAL_STRENGTH - s.value) * 0.1, lastSeen: s.lastSeen } : s;
  }
  return next;
}
