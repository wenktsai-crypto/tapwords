import type { Word, WordPart } from './types';

/** "o,ff:f" -> [{grapheme:'o',card:'o'},{grapheme:'ff',card:'f'}] */
export function parts(spec: string): WordPart[] {
  return spec.split(',').map((piece) => {
    const [grapheme, card] = piece.trim().split(':');
    return { grapheme, card: card ?? grapheme };
  });
}

export function word(text: string, spec: string, extra: Partial<Word> = {}): Word {
  return { text, parts: parts(spec), kind: 'real', ...extra };
}

export function nonsense(text: string, spec: string): Word {
  return { text, parts: parts(spec), kind: 'nonsense' };
}

/** One card per letter, e.g. cvc('map'). */
export function cvc(text: string): Word {
  return word(text, text.split('').join(','));
}

export function cvcNonsense(text: string): Word {
  return nonsense(text, text.split('').join(','));
}
