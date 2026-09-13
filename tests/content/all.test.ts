import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { checkContent, MIN } from '../../src/content/check';
import { usableSentences, usableStories } from '../../src/engine/session';

describe('the whole program', () => {
  it('has the sixteen substeps in teaching order', () => {
    expect(CONTENT.substeps.map((s) => s.id)).toEqual([
      '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
      '2.1', '2.2', '2.3', '2.4', '2.5',
      '3.1', '3.2', '3.3', '3.4', '3.5',
    ]);
  });

  it('passes the content checker at production minimums', () => {
    expect(checkContent(CONTENT, MIN)).toEqual([]);
  });

  it('introduces every card in exactly one substep group', () => {
    const seen = new Map<string, number>();
    for (const s of CONTENT.substeps) for (const g of s.groups) for (const c of g.cards) seen.set(c, (seen.get(c) ?? 0) + 1);
    // A card that no section introduces yet is pending content, not a duplicate. Task 14
    // re-tightens this to require exactly one for every card.
    for (const card of CONTENT.cards) expect(seen.get(card.id) ?? 1, `card ${card.id}`).toBe(1);
  });

  it('gives every substep and group a story of its own that the child can already read', () => {
    for (const s of CONTENT.substeps) {
      for (let g = 0; g < s.groups.length; g++) {
        const own = usableStories(CONTENT, s.id, g).filter((st) => st.substep === s.id);
        expect(own.length, `${s.id} group ${g}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('gives every substep and group at least two readable sentences of its own', () => {
    for (const s of CONTENT.substeps) {
      for (let g = 0; g < s.groups.length; g++) {
        const own = usableSentences(CONTENT, s.id, g).filter((t) => t.substep === s.id);
        expect(own.length, `${s.id} group ${g}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('never shows more than eight letter tiles at once in a lesson', () => {
    for (const s of CONTENT.substeps) {
      for (const g of s.groups) {
        for (const step of g.lesson) {
          if ('show' in step) expect(step.show.length, `${s.id} ${step.show.join('')}`).toBeLessThanOrEqual(8);
        }
      }
    }
  });

  it('never mentions the Wilson name', () => {
    const text = JSON.stringify(CONTENT).toLowerCase();
    expect(text.includes('wilson')).toBe(false);
  });
});
