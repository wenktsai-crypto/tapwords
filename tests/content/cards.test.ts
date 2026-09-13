import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';

describe('card list', () => {
  it('has unique ids and non-empty fields', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CARDS) {
      expect(c.grapheme.length).toBeGreaterThan(0);
      expect(c.keyword.length).toBeGreaterThan(0);
      expect(c.phonemeLabel.length).toBeGreaterThan(0);
      expect(['consonant', 'vowel', 'digraph', 'welded', 'vce', 'silent']).toContain(c.type);
    }
  });

  it('includes the cards needed through step 3', () => {
    const ids = new Set(CARDS.map((c) => c.id));
    for (const id of ['a', 'i', 'o', 'u', 'e', 'sh', 'ch', 'th', 'wh', 'qu', 'ck', 'all', 'am', 'an', 'ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'ild', 'ind', 'old', 'ost', 'olt', 'ed']) {
      expect(ids.has(id), `missing card ${id}`).toBe(true);
    }
  });

  it('includes the silent-e cards Book 4 needs, written the way the child meets them', () => {
    const byId = new Map(CARDS.map((c) => [c.id, c]));
    for (const id of ['a_e', 'i_e', 'o_e', 'u_e', 'e_e', 'u_e_oo', 'e_silent']) {
      expect(byId.has(id), `missing card ${id}`).toBe(true);
    }
    for (const id of ['a_e', 'i_e', 'o_e', 'u_e', 'e_e', 'u_e_oo']) {
      const c = byId.get(id)!;
      expect(c.type, id).toBe('vce');
      expect(c.grapheme.length, id).toBe(1);
      expect(c.display, id).toBe(`${c.grapheme}_e`);
    }
    expect(byId.get('e_silent')!.type).toBe('silent');
  });
});
