import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { CONTENT } from '../../src/content';
import { cvc, cvcNonsense, word } from '../../src/content/build';
import type { Content, Substep, Word } from '../../src/content/types';
import { buildSession, findChoices, COUNTS, usableSentences, usableStories, shuffleQuestion } from '../../src/engine/session';
import { initialState } from '../../src/engine/types';
import { seeded } from '../../src/engine/rng';

describe('buildSession on substep 1.1 with a fresh profile', () => {
  const plan = buildSession(CONTENT, initialState('1.1'), seeded(3));

  it('numbers the session and names the substep', () => {
    expect(plan.sessionNumber).toBe(1);
    expect(plan.substep).toBe('1.1');
    expect(plan.substepTitle.length).toBeGreaterThan(0);
  });

  it('runs the full lesson the first time and the review version after', () => {
    expect(plan.lessonMode).toBe('full');
    expect(plan.lesson.length).toBeGreaterThan(3);
    const later = buildSession(CONTENT, { ...initialState('1.1'), lessonPending: false, sessionsCompleted: 1 }, seeded(3));
    expect(later.lessonMode).toBe('review');
    expect(later.lesson.every((s) => 'try' in s)).toBe(true);
  });

  it('shows every current card in the forward drill when there is nothing to review', () => {
    expect([...plan.forwardCards].sort()).toEqual([...CONTENT.substeps[0].groups[0].cards].sort());
  });

  it('builds reverse items with three distinct choices including the target, filling from current cards when there is nothing to review', () => {
    expect(plan.reverseItems.length).toBe(COUNTS.reverse);
    expect(new Set(plan.reverseItems.map((r) => r.target)).size).toBe(COUNTS.reverse);
    for (const it of plan.reverseItems) {
      expect(it.choices.length).toBe(3);
      expect(new Set(it.choices).size).toBe(3);
      expect(it.choices).toContain(it.target);
      expect(it.isReview).toBe(false);
    }
  });

  it('builds 12 word-work items cycling tap/find/build with at least 4 nonsense', () => {
    expect(plan.wordWork.length).toBe(COUNTS.wordWork);
    expect(plan.wordWork.map((w) => w.type)).toEqual(['tap', 'find', 'build', 'tap', 'find', 'build', 'tap', 'find', 'build', 'tap', 'find', 'build']);
    expect(plan.wordWork.filter((w) => w.word.kind === 'nonsense').length).toBeGreaterThanOrEqual(COUNTS.minNonsense);
    expect(new Set(plan.wordWork.map((w) => w.word.text)).size).toBe(COUNTS.wordWork);
    for (const w of plan.wordWork) if (w.type === 'find') {
      expect(w.choices.length).toBe(3);
      expect(w.choices).toContain(w.word.text);
    }
  });

  it('builds 3 sound, 5 word, 2 sentence spelling items', () => {
    const types = plan.spelling.map((s) => s.type);
    expect(types.filter((t) => t === 'sound').length).toBe(COUNTS.spellSound);
    expect(types.filter((t) => t === 'word').length).toBe(COUNTS.spellWord);
    expect(types.filter((t) => t === 'sentence').length).toBe(COUNTS.spellSentence);
    for (const s of plan.spelling) {
      if (s.type === 'sound') { expect(s.choices.length).toBe(4); expect(s.choices).toContain(s.card); }
      if (s.type === 'word') { expect(s.tray.length).toBe(s.word.parts.length + 2); for (const p of s.word.parts) expect(s.tray).toContain(p.grapheme); }
      if (s.type === 'sentence') expect([...s.words].sort().join(' ')).toBe(s.text.split(/\s+/).sort().join(' '));
    }
  });

  it('builds a read-aloud list and picks a story by session number', () => {
    expect(plan.readAloud.words.length).toBe(COUNTS.readAloudWords);
    expect(plan.readAloud.sentences.length).toBe(COUNTS.readAloudSentences);
    expect(plan.story.title).toBe(CONTENT.substeps[0].stories[0].title);
    const second = buildSession(CONTENT, { ...initialState('1.1'), sessionsCompleted: 1 }, seeded(3));
    expect(second.story.title).toBe(CONTENT.substeps[0].stories[1].title);
  });

  it('offers a queued read-aloud first', () => {
    expect(plan.readAloudFirst).toBe(false);
    expect(buildSession(CONTENT, { ...initialState('1.1'), pendingReadAloud: true }, seeded(3)).readAloudFirst).toBe(true);
  });

  it('is deterministic for a seed', () => {
    expect(buildSession(CONTENT, initialState('1.1'), seeded(9))).toEqual(buildSession(CONTENT, initialState('1.1'), seeded(9)));
  });
});

describe('buildSession with an earlier substep to review', () => {
  const s11: Substep = { ...CONTENT.substeps[0] };
  const s12: Substep = {
    id: '1.2', title: 'Next', parentSummary: '', concepts: [], sightWords: [], stories: CONTENT.substeps[0].stories,
    groups: [{ cards: ['b', 'u'], lesson: [{ try: 'bat' }] }],
    words: [cvc('bat'), cvc('bud'), cvc('bag'), cvc('bit'), cvc('sub'), cvc('tub'), cvcNonsense('bip'), cvcNonsense('bup'), cvcNonsense('lub'), cvcNonsense('mub')],
    sentences: ['The bat sat.', 'A bud is on the log.', 'The tub is in the fog.'],
  };
  const content: Content = { cards: CARDS, substeps: [s11, s12] };
  const plan = buildSession(content, { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 }, seeded(1));

  it('mixes review items in', () => {
    expect(plan.wordWork.filter((w) => w.isReview).length).toBe(COUNTS.wordWork - COUNTS.wordWorkCurrent);
    expect(plan.wordWork.filter((w) => !w.isReview).every((w) => w.substep === '1.2')).toBe(true);
    // 1.2 here has only two cards, so two current targets and four review targets
    expect(plan.reverseItems.filter((r) => !r.isReview).length).toBe(2);
    expect(plan.reverseItems.filter((r) => r.isReview).length).toBe(COUNTS.reverse - 2);
    expect(plan.forwardCards.length).toBe(2 + COUNTS.forwardReview);
  });

});

describe('buildSession with a substep whose word bank is smaller than word-work capacity', () => {
  const small: Substep = {
    id: '1.2', title: 'Small bank', parentSummary: '', concepts: [], sightWords: [],
    groups: [{ cards: ['b', 'u'], lesson: [] }],
    words: [cvc('bat'), cvc('bud'), cvc('bag'), cvcNonsense('bip'), cvcNonsense('bup')],
    sentences: CONTENT.substeps[0].sentences,
    stories: CONTENT.substeps[0].stories,
  };
  const content: Content = { cards: CARDS, substeps: [CONTENT.substeps[0], small] };
  const plan = buildSession(content, { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 }, seeded(1));

  it('still fills all 12 word-work items by pulling more review when the current bank is too small', () => {
    expect(plan.wordWork.length).toBe(COUNTS.wordWork);
    const currentItems = plan.wordWork.filter((w) => !w.isReview);
    const currentTexts = currentItems.map((w) => w.word.text);
    // every current word in the 5-word bank appears at most once
    expect(new Set(currentTexts).size).toBe(currentTexts.length);
    expect(currentTexts.length).toBeLessThanOrEqual(small.words.length);
    // review items fill whatever the current bank could not
    expect(plan.wordWork.filter((w) => w.isReview).length).toBe(COUNTS.wordWork - currentTexts.length);
  });
});

describe('word dictation nonsense share', () => {
  it('always picks at least one nonsense word among the current dictation words, whatever the seed', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const plan = buildSession(CONTENT, initialState('1.1'), seeded(seed));
      const current = plan.spelling.flatMap((s) => (s.type === 'word' && !s.isReview ? [s.word] : []));
      expect(current.length, `seed ${seed}`).toBeGreaterThanOrEqual(COUNTS.spellWordCurrent);
      expect(current.filter((w) => w.kind === 'nonsense').length, `seed ${seed}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('still fills the dictation list when the current bank has no nonsense words at all', () => {
    const noNonsense: Substep = { ...CONTENT.substeps[0], id: '1.2', groups: [{ cards: ['b'], lesson: [] }], words: [cvc('bat'), cvc('bad'), cvc('bag'), cvc('bid'), cvc('bit')] };
    const content: Content = { cards: CARDS, substeps: [CONTENT.substeps[0], noNonsense] };
    const plan = buildSession(content, { ...initialState('1.2'), sessionsCompleted: 5, substepEnteredAt: 5 }, seeded(4));
    expect(plan.spelling.filter((s) => s.type === 'word').length).toBe(COUNTS.spellWord);
  });
});

describe('findChoices', () => {
  const pool: Word[] = [cvc('map'), cvc('mat'), cvc('mad'), cvc('sit'), cvc('log')];
  it('prefers words that differ by one sound', () => {
    const out = findChoices(cvc('map'), pool, seeded(2));
    expect(out.length).toBe(3);
    expect(out).toContain('map');
    expect(out.filter((t) => t === 'mat' || t === 'mad').length).toBe(2);
  });
  it('falls back to any words when there are no near misses', () => {
    const out = findChoices(cvc('log'), [cvc('log'), cvc('sit'), cvc('map')], seeded(2));
    expect(out.sort()).toEqual(['log', 'map', 'sit']);
  });
  it('never offers a capitalised name among the wrong answers, which would stand out', () => {
    // Same shape as the real 1.5 bank, so "Sam" is a prime one-sound-off distractor for "ham".
    const named: Word[] = [word('Sam', 's,am'), word('ham', 'h,am'), word('jam', 'j,am'), word('ram', 'r,am'), word('yam', 'y,am')];
    for (let seed = 1; seed <= 20; seed++) {
      const out = findChoices(named[1], named, seeded(seed));
      expect(out, `seed ${seed}`).not.toContain('Sam');
      expect(out).toContain('ham');
      expect(out.length).toBe(3);
    }
  });
});

describe('capitalised names in word work', () => {
  it('never asks the child to pick a capitalised name out of a line-up', () => {
    for (let n = 1; n <= 10; n++) {
      const plan = buildSession(CONTENT, initialState('1.5'), seeded(n));
      for (const item of plan.wordWork) {
        if (item.type === 'find') expect(/^[A-Z]/.test(item.word.text), `session ${n}: ${item.word.text}`).toBe(false);
      }
      expect(plan.wordWork.length).toBe(COUNTS.wordWork);
    }
  });

  it('still practises the names some other way', () => {
    const seen = new Set<string>();
    for (let n = 1; n <= 10; n++) {
      for (const item of buildSession(CONTENT, initialState('1.5'), seeded(n)).wordWork) {
        if (/^[A-Z]/.test(item.word.text)) seen.add(item.type);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
    expect(seen.has('find')).toBe(false);
  });
});


describe('sentence and story availability by group', () => {
  const one = CONTENT.substeps[0];
  const grouped: Content = {
    cards: CARDS,
    substeps: [
      one,
      {
        ...one,
        id: '1.2',
        title: 'Grouped',
        groups: [
          { cards: ['b', 'u'], lesson: [] },
          { cards: ['e'], lesson: [] },
        ],
        sightWords: [],
        words: [cvc('bud'), cvc('tub'), cvc('bed'), cvcNonsense('bup')],
        sentences: ['The bud is in the tub.', 'The bed is in the fog.'],
        stories: [
          { title: 'The Tub', sentences: ['The bud is in the tub.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] },
          { title: 'The Bed', sentences: ['The bed is in the fog.'], questions: [{ prompt: 'q', choices: ['a', 'b', 'c'], answer: 0 }] },
        ],
      },
    ],
  };

  it('keeps only sentences whose words are taught by the current group', () => {
    const g0 = usableSentences(grouped, '1.2', 0);
    expect(g0.filter((s) => s.substep === '1.2').map((s) => s.text)).toEqual(['The bud is in the tub.']);
    const g1 = usableSentences(grouped, '1.2', 1).filter((s) => s.substep === '1.2').map((s) => s.text);
    expect(g1).toEqual(['The bud is in the tub.', 'The bed is in the fog.']);
  });

  it('falls back to earlier substeps sentences after the current ones', () => {
    const g0 = usableSentences(grouped, '1.2', 0);
    expect(g0[0].substep).toBe('1.2');
    expect(g0.some((s) => s.substep === '1.1')).toBe(true);
  });

  it('keeps only stories whose sentences are all readable, falling back to earlier substeps', () => {
    expect(usableStories(grouped, '1.2', 0).map((s) => s.story.title)).toEqual(['The Tub']);
    const none: Content = { ...grouped, substeps: [grouped.substeps[0], { ...grouped.substeps[1], stories: [grouped.substeps[1].stories[1]] }] };
    const fallback = usableStories(none, '1.2', 0);
    expect(fallback.length).toBeGreaterThan(0);
    expect(fallback.every((s) => s.substep === '1.1')).toBe(true);
  });

  it('builds a group-one session whose sentences and story avoid untaught sounds', () => {
    const plan = buildSession(grouped, initialState('1.2'), seeded(5));
    const texts = [
      ...plan.spelling.filter((i) => i.type === 'sentence').map((i) => (i as { text: string }).text),
      ...plan.readAloud.sentences,
      ...plan.story.sentences,
    ];
    for (const t of texts) expect(t, t).not.toMatch(/bed/);
  });
});

describe('story question shuffling', () => {
  const q = { prompt: 'p', choices: ['right', 'wrong1', 'wrong2'] as [string, string, string], answer: 0 as const };

  it('keeps the correct text at the remapped answer index and keeps all three choices', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = shuffleQuestion(q, seeded(seed));
      expect(s.choices[s.answer]).toBe('right');
      expect([...s.choices].sort()).toEqual(['right', 'wrong1', 'wrong2']);
      expect(s.prompt).toBe('p');
    }
  });

  it('does not always leave the answer first', () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 20; seed++) positions.add(shuffleQuestion(q, seeded(seed)).answer);
    expect(positions.size).toBeGreaterThan(1);
  });

  it('shuffles the questions of the session story without changing its title or sentences', () => {
    const plan = buildSession(CONTENT, initialState('1.1'), seeded(7));
    const original = CONTENT.substeps[0].stories.find((s) => s.title === plan.story.title)!;
    expect(plan.story.sentences).toEqual(original.sentences);
    plan.story.questions.forEach((sq, i) => {
      expect(sq.choices[sq.answer]).toBe(original.questions[i].choices[original.questions[i].answer]);
    });
  });
});

describe('buildSession on a substep that introduces no new sound cards', () => {
  const plan = buildSession(CONTENT, initialState('1.3'), seeded(1));
  const sub = CONTENT.substeps.find((s) => s.id === '1.3')!;
  const bankCards = new Set(sub.words.flatMap((w) => w.parts.map((p) => p.card)));
  const earlierCards = new Set(
    CONTENT.substeps.slice(0, CONTENT.substeps.indexOf(sub)).flatMap((s) => s.groups.flatMap((g) => g.cards)),
  );

  it('drills the cards its own word bank uses as current work, not as review', () => {
    expect(sub.groups.flatMap((g) => g.cards)).toEqual([]);
    expect(plan.reverseItems.some((r) => !r.isReview)).toBe(true);
    expect(plan.spelling.some((s) => s.type === 'sound' && !s.isReview)).toBe(true);
  });

  it('draws every forward card from its own bank or from an earlier substep', () => {
    expect(plan.forwardCards.length).toBeGreaterThan(0);
    for (const c of plan.forwardCards) expect(bankCards.has(c) || earlierCards.has(c)).toBe(true);
  });
});

describe('the forward drill on a substep whose cards come from its own word bank', () => {
  it('stays about as long as a substep that introduces its own cards', () => {
    const plan = buildSession(CONTENT, initialState('3.4'), seeded(1));
    expect(plan.forwardCards.length).toBeLessThanOrEqual(COUNTS.forwardFallback + COUNTS.forwardReview);
    expect(plan.forwardCards.length).toBeGreaterThan(COUNTS.forwardReview);
  });
});
