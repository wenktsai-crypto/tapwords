import type { Content, LessonStep, Question, Story, Word } from '../content/types';
import type { ProfileState } from './types';
import { cardKey, wordKey } from './types';
import { availableCards, availableWords, getSubstep, substepIndex } from './availability';
import { pickReview, type Candidate } from './review';
import { sample, shuffle, type Rng } from './rng';
import { tokenize } from '../content/check';

export interface ReverseItem { target: string; choices: string[]; isReview: boolean }
export interface WordRef { word: Word; substep: string; isReview: boolean }
export type WordWorkItem =
  | (WordRef & { type: 'tap' })
  | (WordRef & { type: 'find'; choices: string[] })
  | (WordRef & { type: 'build' });
export type SpellingItem =
  | { type: 'sound'; card: string; choices: string[]; isReview: boolean }
  | { type: 'word'; word: Word; substep: string; tray: string[]; isReview: boolean }
  | { type: 'sentence'; text: string; substep: string; words: string[] };

export interface SessionPlan {
  sessionNumber: number;
  substep: string;
  substepTitle: string;
  lessonMode: 'full' | 'review';
  readAloudFirst: boolean;
  forwardCards: string[];
  reverseItems: ReverseItem[];
  lesson: LessonStep[];
  wordWork: WordWorkItem[];
  spelling: SpellingItem[];
  readAloud: { words: WordRef[]; sentences: string[] };
  story: Story;
}

export const COUNTS = {
  forwardReview: 6,
  reverse: 6,
  reverseCurrent: 4,
  wordWork: 12,
  wordWorkCurrent: 8,
  minNonsense: 4,
  spellSound: 3,
  spellSoundCurrent: 2,
  spellWord: 5,
  spellWordCurrent: 4,
  spellWordNonsense: 1,
  spellSentence: 2,
  readAloudWords: 8,
  readAloudCurrent: 6,
  readAloudSentences: 3,
};

export function shuffleQuestion(q: Question, rng: Rng): Question {
  const order = shuffle([0, 1, 2], rng);
  const choices = order.map((i) => q.choices[i]) as [string, string, string];
  return { ...q, choices, answer: order.indexOf(q.answer) as 0 | 1 | 2 };
}

export function findChoices(target: Word, pool: Word[], rng: Rng): string[] {
  const others = pool.filter((w) => w.text !== target.text);
  const sameLen = others.filter((w) => w.parts.length === target.parts.length);
  const oneOff = sameLen.filter((w) => w.parts.filter((p, i) => p.card !== target.parts[i].card).length === 1);
  const rest = sameLen.filter((w) => !oneOff.includes(w));
  const picks: Word[] = sample(oneOff, 2, rng);
  if (picks.length < 2) picks.push(...sample(rest, 2 - picks.length, rng));
  if (picks.length < 2) picks.push(...sample(others.filter((w) => !picks.includes(w)), 2 - picks.length, rng));
  return shuffle([target.text, ...picks.map((w) => w.text)], rng);
}

function readableWordSet(content: Content, substepId: string, groupIndex: number): Set<string> {
  const idx = substepIndex(content, substepId);
  const words = new Set(
    availableWords(content, substepId, groupIndex)
      .filter((w) => w.word.kind === 'real')
      .map((w) => w.word.text.toLowerCase()),
  );
  content.substeps.slice(0, idx + 1).forEach((s) => s.sightWords.forEach((sw) => words.add(sw.toLowerCase())));
  return words;
}

const readable = (text: string, known: Set<string>) => tokenize(text).every((t) => known.has(t));

/** Current-substep sentences the child can read at this group, then earlier substeps' sentences (latest first). */
export function usableSentences(content: Content, substepId: string, groupIndex: number): { text: string; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const known = readableWordSet(content, substepId, groupIndex);
  const cur = content.substeps[idx].sentences.filter((t) => readable(t, known)).map((text) => ({ text, substep: substepId }));
  const earlier = content.substeps
    .slice(0, idx)
    .reverse()
    .flatMap((s) => s.sentences.map((text) => ({ text, substep: s.id })));
  return [...cur, ...earlier];
}

/** Current-substep stories fully readable at this group; if none, the nearest earlier substep's stories. */
export function usableStories(content: Content, substepId: string, groupIndex: number): { story: Story; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const known = readableWordSet(content, substepId, groupIndex);
  const cur = content.substeps[idx].stories.filter((st) => st.sentences.every((t) => readable(t, known))).map((story) => ({ story, substep: substepId }));
  if (cur.length > 0) return cur;
  for (let i = idx - 1; i >= 0; i--) {
    const s = content.substeps[i];
    if (s.stories.length > 0) return s.stories.map((story) => ({ story, substep: s.id }));
  }
  return [];
}

export function buildSession(content: Content, state: ProfileState, rng: Rng): SessionPlan {
  const sub = getSubstep(content, state.currentSubstep);
  const idx = substepIndex(content, sub.id);
  const earlier = content.substeps.slice(0, idx);
  const groupIndex = Math.min(state.currentGroup, sub.groups.length - 1);
  const group = sub.groups[groupIndex];
  const n = state.sessionsCompleted + 1;
  const strengths = state.strengths;

  const currentCards = sub.groups.slice(0, groupIndex + 1).flatMap((g) => g.cards);
  const allCards = availableCards(content, sub.id, groupIndex);
  const earlierCards: Candidate<string>[] = earlier.flatMap((s) => s.groups.flatMap((g) => g.cards.map((c) => ({ key: cardKey(c), substep: s.id, item: c }))));
  const available = availableWords(content, sub.id, groupIndex);
  const currentWords = available.filter((w) => w.substep === sub.id);
  const allWords = available.map((w) => w.word);
  const earlierWords: Candidate<{ word: Word; substep: string }>[] = earlier.flatMap((s) => s.words.map((word) => ({ key: wordKey(s.id, word.text), substep: s.id, item: { word, substep: s.id } })));

  const distractors = (exclude: string[], k: number) => sample(allCards.filter((c) => !exclude.includes(c)), k, rng);
  /** When there is little or nothing to review (a fresh profile on 1.1), fill the slots from current items instead. */
  const topUp = <T,>(picked: T[], pool: T[], n: number): T[] => [...picked, ...sample(pool.filter((x) => !picked.includes(x)), n - picked.length, rng)];

  // 1. sound cards
  const forwardCards = shuffle([...currentCards, ...pickReview(earlierCards, strengths, COUNTS.forwardReview, n, rng)], rng);
  const reverseCur = sample(currentCards, COUNTS.reverseCurrent, rng);
  const reverseRev = pickReview(earlierCards, strengths, COUNTS.reverse - reverseCur.length, n, rng);
  const reverseTargets = [
    ...topUp(reverseCur, currentCards, COUNTS.reverse - reverseRev.length).map((c) => ({ c, isReview: false })),
    ...reverseRev.map((c) => ({ c, isReview: true })),
  ];
  const reverseItems: ReverseItem[] = reverseTargets.map(({ c, isReview }) => ({ target: c, isReview, choices: shuffle([c, ...distractors([c], 2)], rng) }));

  // 2. lesson
  const lesson = state.lessonPending ? group.lesson : group.lesson.filter((s) => 'try' in s);

  // 3. word work
  const curNonsense = currentWords.filter((w) => w.word.kind === 'nonsense');
  const curReal = currentWords.filter((w) => w.word.kind === 'real');
  const pickedNonsense = sample(curNonsense, COUNTS.minNonsense, rng);
  const pickedReal = sample(curReal, COUNTS.wordWorkCurrent - pickedNonsense.length, rng);
  const picked = [...pickedNonsense, ...pickedReal];
  const review = pickReview(earlierWords, strengths, COUNTS.wordWork - picked.length, n, rng).map((w) => ({ ...w, isReview: true }));
  const current = topUp(picked, currentWords, COUNTS.wordWork - review.length).map((w) => ({ ...w, isReview: false }));
  const types: WordWorkItem['type'][] = ['tap', 'find', 'build'];
  const wordWork: WordWorkItem[] = shuffle([...current, ...review], rng).map((w, i) => {
    const type = types[i % 3];
    return type === 'find' ? { ...w, type, choices: findChoices(w.word, allWords, rng) } : { ...w, type };
  });

  // 4. spelling
  const soundCur = sample(currentCards, COUNTS.spellSoundCurrent, rng);
  const soundRev = pickReview(earlierCards, strengths, COUNTS.spellSound - soundCur.length, n, rng);
  const soundCurrent = topUp(soundCur, currentCards, COUNTS.spellSound - soundRev.length).map((c) => ({ c, isReview: false }));
  const soundReview = soundRev.map((c) => ({ c, isReview: true }));
  const spellSounds: SpellingItem[] = [...soundCurrent, ...soundReview].map(({ c, isReview }) => ({ type: 'sound', card: c, isReview, choices: shuffle([c, ...distractors([c], 3)], rng) }));
  // Spec 4.2: at least a quarter of word dictation is nonsense, so reserve a nonsense slot
  // before the rest of the current picks are drawn (when the bank has any nonsense at all).
  const spellNonsense = sample(curNonsense, COUNTS.spellWordNonsense, rng);
  const spellPick = [...spellNonsense, ...sample(currentWords.filter((w) => !spellNonsense.includes(w)), COUNTS.spellWordCurrent - spellNonsense.length, rng)];
  const spellRev = pickReview(earlierWords, strengths, COUNTS.spellWord - spellPick.length, n, rng).map((w) => ({ ...w, isReview: true }));
  // Shuffled so the reserved nonsense word is not always the first thing dictated.
  const spellCur = shuffle(topUp(spellPick, currentWords, COUNTS.spellWord - spellRev.length), rng).map((w) => ({ ...w, isReview: false }));
  const spellWords: SpellingItem[] = [...spellCur, ...spellRev].map((w) => ({
    type: 'word',
    word: w.word,
    substep: w.substep,
    isReview: w.isReview,
    tray: shuffle([...w.word.parts.map((p) => p.grapheme), ...distractors(w.word.parts.map((p) => p.card), 2)], rng),
  }));
  // Sentences the child can actually read at this group; earlier substeps' sentences fill any gap.
  const sentencePool = usableSentences(content, sub.id, groupIndex);
  const curSentences = sentencePool.filter((s) => s.substep === sub.id).map((s) => s.text);
  const pickSentences = (k: number) => {
    const picked = sample(curSentences, k, rng);
    const rest = sentencePool.filter((s) => s.substep !== sub.id).map((s) => s.text);
    return topUp(picked, rest, k);
  };
  const spellSentences: SpellingItem[] = pickSentences(COUNTS.spellSentence).map((text) => ({ type: 'sentence', text, substep: sub.id, words: shuffle(text.split(/\s+/), rng) }));
  const spelling = [...spellSounds, ...spellWords, ...spellSentences];

  // 5. read aloud
  const raPick = sample(curReal, COUNTS.readAloudCurrent, rng);
  const raRev = pickReview(earlierWords, strengths, COUNTS.readAloudWords - raPick.length, n, rng).map((w) => ({ ...w, isReview: true }));
  const raCur = topUp(raPick, curReal, COUNTS.readAloudWords - raRev.length).map((w) => ({ ...w, isReview: false }));
  const readAloud = { words: [...raCur, ...raRev], sentences: pickSentences(COUNTS.readAloudSentences) };

  // 6. story
  const stories = usableStories(content, sub.id, groupIndex);
  const chosen = stories.length > 0 ? stories[(n - 1) % stories.length].story : sub.stories[(n - 1) % sub.stories.length];
  const story = { ...chosen, questions: chosen.questions.map((q) => shuffleQuestion(q, rng)) };

  return {
    sessionNumber: n,
    substep: sub.id,
    substepTitle: sub.title,
    lessonMode: state.lessonPending ? 'full' : 'review',
    readAloudFirst: state.pendingReadAloud,
    forwardCards,
    reverseItems,
    lesson,
    wordWork,
    spelling,
    readAloud,
    story,
  };
}
