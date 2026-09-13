import { describe, it, expect } from 'vitest';
import { CARDS } from '../../src/content/cards';
import { CONTENT } from '../../src/content';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content, Substep, Word } from '../../src/content/types';
import { buildSession, findChoices, COUNTS } from '../../src/engine/session';
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
});
