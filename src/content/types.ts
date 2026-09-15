export type CardType =
  | 'consonant'
  | 'vowel'
  | 'digraph'
  | 'welded'
  /** A long vowel that owes its sound to a silent letter later in the same syllable. */
  | 'vce'
  /** A letter that is shown but makes no sound, and is never tapped. */
  | 'silent';

export interface Card {
  id: string;            // e.g. "sh"
  grapheme: string;      // the letters as they appear inside a word: "a" for the a_e card
  /** What the sound card itself shows, when that differs from the letters in a word: "a_e". */
  display?: string;
  keyword: string;       // e.g. "ship"
  phonemeLabel: string;  // spoken by the computer voice when no clip is recorded
  type: CardType;
  /** False for a card that is never drilled on its own: a silent letter, or a second sound
   * of a spelling that already has a card in the deck. Defaults to true. */
  drill?: boolean;
}

export interface WordPart {
  grapheme: string;      // letters shown, e.g. "ff"
  card: string;          // card id it is pronounced as, e.g. "f"
}

export interface Word {
  text: string;
  parts: WordPart[];     // in order; also the tapping pattern
  kind: 'real' | 'nonsense';
  concepts?: string[];   // concept tags this word relies on, e.g. ["suffix-s"]
  syllables?: number[];  // indexes into parts where a new syllable begins (step 3)
}

export interface Question {
  prompt: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
}

export interface Story {
  title: string;
  sentences: string[];
  questions: Question[];
}

export type LessonStep =
  | { say: string }       // spoken by the app
  | { show: string[] }    // graphemes displayed as tiles
  | { tap: string }       // a word from this substep's bank, tapped out by the app
  | { try: string };      // a word from this substep's bank, tapped by the child

export interface CardGroup {
  cards: string[];        // card ids introduced by this group
  lesson: LessonStep[];   // the mini-lesson for this group
}

export interface Substep {
  id: string;             // "1.1"
  title: string;
  parentSummary: string;
  groups: CardGroup[];    // at least one; most substeps have exactly one
  concepts: string[];     // concept tags introduced here
  sightWords: string[];   // high-frequency words allowed in sentences from here on
  words: Word[];
  sentences: string[];
  stories: Story[];
}

export interface Content {
  cards: Card[];
  substeps: Substep[];    // in teaching order
}
