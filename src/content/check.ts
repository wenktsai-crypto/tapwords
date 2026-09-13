import type { Content } from './types';

/** Graphemes that are spellings of an existing card and need a rule taught first. */
export const SPELLING_RULES: Record<string, string> = {
  ff: 'doubling',
  ll: 'doubling',
  ss: 'doubling',
  zz: 'doubling',
};

export const MIN = { real: 20, nonsense: 10, sentences: 6, stories: 1 };

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
  const introducedCards = new Set<string>();
  const introducedConcepts = new Set<string>();
  const knownWords = new Set<string>();
  const knownSight = new Set<string>();
  const seenIds = new Set<string>();

  for (const s of content.substeps) {
    if (seenIds.has(s.id)) errors.push(`${s.id}: duplicate substep id`);
    seenIds.add(s.id);
    if (s.groups.length === 0) errors.push(`${s.id}: needs at least one card group`);

    for (const g of s.groups) {
      for (const c of g.cards) {
        if (!cardById.has(c)) errors.push(`${s.id}: introduces unknown card "${c}"`);
        if (introducedCards.has(c)) errors.push(`${s.id}: card "${c}" was already introduced`);
        introducedCards.add(c);
      }
    }
    for (const c of s.concepts) introducedConcepts.add(c);
    for (const sw of s.sightWords) knownSight.add(sw.toLowerCase());

    const bank = new Set(s.words.map((w) => w.text));
    for (const g of s.groups) {
      for (const step of g.lesson) {
        const ref = 'tap' in step ? step.tap : 'try' in step ? step.try : null;
        if (ref !== null && !bank.has(ref)) errors.push(`${s.id}: lesson refers to "${ref}" which is not in this substep's word bank`);
      }
    }

    let real = 0;
    let nonsenseCount = 0;
    for (const w of s.words) {
      if (w.kind === 'real') real++;
      else nonsenseCount++;
      const joined = w.parts.map((p) => p.grapheme).join('');
      if (joined !== w.text) errors.push(`${s.id}: "${w.text}" parts spell "${joined}"`);
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
