import type { Content } from './types';
import { cardMap, silentPartners } from './parts';

/** Graphemes that are spellings of an existing card and need a rule taught first. */
export const SPELLING_RULES: Record<string, string> = {
  ff: 'doubling',
  ll: 'doubling',
  ss: 'doubling',
  zz: 'doubling',
};

export const MIN = { real: 20, nonsense: 10, sentences: 6, stories: 1, questions: 1 };

/** Endings that must always be tapped as the welded card of the same spelling. ild, ind and ost
 * are left out because "wind", "cost" and "lost" are regular closed syllables. */
export const WELDED_ENDINGS = ['ang', 'ing', 'ong', 'ung', 'ank', 'ink', 'onk', 'unk', 'all', 'old', 'olt', 'am', 'an'];

export function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function checkContent(content: Content, min: typeof MIN = MIN): string[] {
  const errors: string[] = [];
  const cardById = new Map(content.cards.map((c) => [c.id, c]));
  const cards = cardMap(content.cards);
  const introducedCards = new Set<string>();
  const introducedGraphemes = new Set<string>();
  const introducedConcepts = new Set<string>();
  const knownWords = new Set<string>();
  const knownSight = new Set<string>();
  const seenIds = new Set<string>();
  /** Lower-cased word text -> the substep whose bank owns it, so a text is never taught twice. */
  const wordOwner = new Map<string, string>();

  for (const s of content.substeps) {
    if (seenIds.has(s.id)) errors.push(`${s.id}: duplicate substep id`);
    seenIds.add(s.id);
    if (s.groups.length === 0) errors.push(`${s.id}: needs at least one card group`);

    // Concepts count as introduced for the whole substep, so a group's lesson may show a
    // spelling such as "ff" whose rule this substep teaches.
    for (const c of s.concepts) introducedConcepts.add(c);
    for (const sw of s.sightWords) knownSight.add(sw.toLowerCase());

    // Word texts are matched without regard to case, so a proper noun can be stored the way a
    // child should see it ("Sam") while its parts, cards and sentences stay lower case.
    const bank = new Map(s.words.map((w) => [w.text.toLowerCase(), w]));
    // Groups are taught in order (spec 3.4), so a group's lesson may only lean on cards its own
    // group or an earlier one has introduced. Word banks are checked against the whole substep
    // further down, because availableWords already filters them by group at runtime.
    for (const g of s.groups) {
      for (const c of g.cards) {
        if (!cardById.has(c)) errors.push(`${s.id}: introduces unknown card "${c}"`);
        if (introducedCards.has(c)) errors.push(`${s.id}: card "${c}" was already introduced`);
        introducedCards.add(c);
        const card = cardById.get(c);
        if (card) {
          introducedGraphemes.add(card.grapheme);
          // A lesson may show "a_e", the face of the card, as well as the bare letter a word uses.
          if (card.display) introducedGraphemes.add(card.display);
        }
      }
      for (const step of g.lesson) {
        if ('show' in step) {
          for (const grapheme of step.show) {
            const rule = SPELLING_RULES[grapheme];
            if (rule) {
              if (!introducedConcepts.has(rule)) errors.push(`${s.id}: lesson shows "${grapheme}" before the ${rule} rule is taught`);
            } else if (!introducedGraphemes.has(grapheme)) {
              errors.push(`${s.id}: lesson shows "${grapheme}" before its card is taught`);
            }
          }
          continue;
        }
        const ref = 'tap' in step ? step.tap : 'try' in step ? step.try : null;
        if (ref === null) continue;
        const w = bank.get(ref.toLowerCase());
        if (!w) {
          errors.push(`${s.id}: lesson refers to "${ref}" which is not in this substep's word bank`);
          continue;
        }
        for (const p of w.parts) {
          if (!introducedCards.has(p.card)) errors.push(`${s.id}: lesson word "${ref}" uses card "${p.card}" before it is taught`);
        }
      }
    }

    let real = 0;
    let nonsenseCount = 0;
    for (const w of s.words) {
      if (w.kind === 'real') real++;
      else nonsenseCount++;
      const joined = w.parts.map((p) => p.grapheme).join('');
      if (joined !== w.text.toLowerCase()) errors.push(`${s.id}: "${w.text}" parts spell "${joined}"`);
      const ending = WELDED_ENDINGS.find((g) => w.text.toLowerCase().endsWith(g));
      const lastPart = w.parts[w.parts.length - 1];
      if (ending && lastPart && lastPart.grapheme !== ending) {
        errors.push(`${s.id}: "${w.text}" ends in "${ending}" which must be tapped as the welded card "${ending}"`);
      }
      // A silent letter only makes sense as the partner of a vowel earlier in its syllable, and
      // such a vowel is silent-e only if it has exactly one partner. Either half alone is a typo.
      const pairs = silentPartners(w, cards);
      w.parts.forEach((p, i) => {
        const type = cards.get(p.card)?.type;
        if (type === 'silent' && !pairs.some((pair) => pair.silent === i)) {
          errors.push(`${s.id}: "${w.text}" has a silent "${p.grapheme}" with no silent-e vowel before it in the same syllable`);
        }
        if (type === 'vce') {
          const n = pairs.filter((pair) => pair.vowel === i).length;
          if (n !== 1) errors.push(`${s.id}: "${w.text}" has a silent-e vowel with ${n} silent partners in its syllable (need exactly 1)`);
        }
      });
      if (w.syllables) {
        const ok = w.syllables.every((x, i) => Number.isInteger(x) && x > 0 && x < w.parts.length && (i === 0 || x > w.syllables![i - 1]));
        if (!ok) errors.push(`${s.id}: "${w.text}" has invalid syllables [${w.syllables}]`);
      }
      const owner = wordOwner.get(w.text.toLowerCase());
      if (owner !== undefined && owner !== s.id) errors.push(`${s.id}: "${w.text}" is already in substep ${owner}'s word bank`);
      else wordOwner.set(w.text.toLowerCase(), s.id);
      for (const p of w.parts) {
        const card = cardById.get(p.card);
        if (!card) {
          errors.push(`${s.id}: "${w.text}" uses unknown card "${p.card}"`);
          continue;
        }
        if (!introducedCards.has(p.card)) errors.push(`${s.id}: "${w.text}" uses card "${p.card}" before it is taught`);
        const rule = SPELLING_RULES[p.grapheme];
        if (rule) {
          if (!introducedConcepts.has(rule)) errors.push(`${s.id}: "${w.text}" uses "${p.grapheme}" before the ${rule} rule is taught`);
        } else if (p.grapheme !== card.grapheme) {
          errors.push(`${s.id}: "${w.text}" part "${p.grapheme}" does not match card "${p.card}"`);
        }
      }
      for (const c of w.concepts ?? []) {
        if (!introducedConcepts.has(c)) errors.push(`${s.id}: "${w.text}" needs concept "${c}" before it is taught`);
      }
      if (w.kind === 'real') knownWords.add(w.text.toLowerCase());
    }

    if (real < min.real) errors.push(`${s.id}: only ${real} real words (need ${min.real})`);
    if (nonsenseCount < min.nonsense) errors.push(`${s.id}: only ${nonsenseCount} nonsense words (need ${min.nonsense})`);
    if (s.sentences.length < min.sentences) errors.push(`${s.id}: only ${s.sentences.length} sentences (need ${min.sentences})`);
    if (s.stories.length < min.stories) errors.push(`${s.id}: only ${s.stories.length} stories (need ${min.stories})`);
    for (const st of s.stories) {
      if (st.questions.length < min.questions) errors.push(`${s.id}: story "${st.title}" has ${st.questions.length} questions (need ${min.questions})`);
    }

    const checkSentence = (text: string, where: string) => {
      for (const t of tokenize(text)) {
        if (!knownWords.has(t) && !knownSight.has(t)) errors.push(`${s.id}: ${where} uses "${t}" which is not a taught word or sight word`);
      }
    };
    s.sentences.forEach((t, i) => checkSentence(t, `sentence ${i + 1}`));
    for (const st of s.stories) st.sentences.forEach((t, i) => checkSentence(t, `story "${st.title}" sentence ${i + 1}`));
  }
  return errors;
}
