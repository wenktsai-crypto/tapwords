import { describe, it, expect } from 'vitest';
import { CONTENT } from '../../src/content';
import { cardMap, isDrillable } from '../../src/content/parts';
import { buildSession } from '../../src/engine/session';
import { seeded } from '../../src/engine/rng';
import { initialState, type ProfileState } from '../../src/engine/types';
import type { Content, Substep } from '../../src/content/types';

const cards = cardMap(CONTENT.cards);
const undrillable = CONTENT.cards.filter((c) => !isDrillable(c)).map((c) => c.id);

function stateFor(substep: string): ProfileState {
  return initialState(substep);
}

describe('the sound-card drill', () => {
  it('knows there are cards that must never be drilled', () => {
    expect(undrillable).toContain('e_silent');
    expect(undrillable).toContain('u_e_oo');
  });

  it('never shows one, in any drill, in any section', () => {
    for (const s of CONTENT.substeps) {
      for (let seed = 1; seed <= 5; seed++) {
        const plan = buildSession(CONTENT, stateFor(s.id), seeded(seed));
        const shown = [
          ...plan.forwardCards,
          ...plan.reverseItems.flatMap((r) => [r.target, ...r.choices]),
          ...plan.spelling.flatMap((item) => (item.type === 'sound' ? [item.card, ...item.choices] : [])),
        ];
        for (const id of shown) {
          expect(isDrillable(cards.get(id)!), `${s.id} seed ${seed} showed ${id}`).toBe(true);
        }
      }
    }
  });

  it('excludes a silent card from a synthetic section whose word bank genuinely uses one', () => {
    // A section that declares no cards of its own falls back to the distinct cards of its own
    // word bank for the drill's "current" set. A word containing a silent part exercises the
    // filter directly, without waiting for real Book 4 content to exist.
    const substep: Substep = {
      id: 'synthetic.1',
      title: 'synthetic',
      parentSummary: '',
      groups: [{ cards: [], lesson: [] }],
      concepts: [],
      sightWords: [],
      words: [
        {
          text: 'cake',
          kind: 'real',
          parts: [
            { grapheme: 'c', card: 'c' },
            { grapheme: 'a', card: 'a_e' },
            { grapheme: 'k', card: 'k' },
            { grapheme: 'e', card: 'e_silent' },
          ],
        },
      ],
      sentences: [],
      stories: [{ title: 'A story', sentences: ['cake'], questions: [] }],
    };
    const content: Content = { cards: CONTENT.cards, substeps: [substep] };
    for (let seed = 1; seed <= 5; seed++) {
      const plan = buildSession(content, stateFor(substep.id), seeded(seed));
      const shown = [
        ...plan.forwardCards,
        ...plan.reverseItems.flatMap((r) => [r.target, ...r.choices]),
        ...plan.spelling.flatMap((item) => (item.type === 'sound' ? [item.card, ...item.choices] : [])),
      ];
      expect(shown, `seed ${seed}`).not.toContain('e_silent');
    }
  });
});
