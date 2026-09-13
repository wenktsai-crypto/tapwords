import type { Card, Content, Substep, Word } from '../content/types';

export function substepIndex(content: Content, id: string): number {
  const i = content.substeps.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`Unknown substep ${id}`);
  return i;
}

export function getSubstep(content: Content, id: string): Substep {
  return content.substeps[substepIndex(content, id)];
}

export function getCard(content: Content, id: string): Card {
  const c = content.cards.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card ${id}`);
  return c;
}

/** Matched without regard to case, so a lesson may refer to a capitalised name as "sam". */
export function findWord(substep: Substep, text: string): Word {
  const w = substep.words.find((x) => x.text.toLowerCase() === text.toLowerCase());
  if (!w) throw new Error(`Word "${text}" is not in substep ${substep.id}`);
  return w;
}

/** All card ids taught up to and including the given group of the given substep, in teaching order. */
export function availableCards(content: Content, substepId: string, groupIndex: number): string[] {
  const idx = substepIndex(content, substepId);
  const out: string[] = [];
  content.substeps.slice(0, idx).forEach((s) => s.groups.forEach((g) => out.push(...g.cards)));
  content.substeps[idx].groups.slice(0, groupIndex + 1).forEach((g) => out.push(...g.cards));
  return out;
}

/** Earlier substeps' words plus current-substep words whose cards are all taught so far. */
export function availableWords(content: Content, substepId: string, groupIndex: number): { word: Word; substep: string }[] {
  const idx = substepIndex(content, substepId);
  const cards = new Set(availableCards(content, substepId, groupIndex));
  const out: { word: Word; substep: string }[] = [];
  content.substeps.slice(0, idx).forEach((s) => s.words.forEach((word) => out.push({ word, substep: s.id })));
  const cur = content.substeps[idx];
  cur.words.filter((w) => w.parts.every((p) => cards.has(p.card))).forEach((word) => out.push({ word, substep: cur.id }));
  return out;
}
