import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Word } from '../../content/types';
import { cardMap, silentPartners, soundingIndexes } from '../../content/parts';
import { useServices } from '../services';
import { cardTypeById } from '../tiles';
import { Tile } from './Tile';

interface Props {
  word: Word;
  /** How many of the word's *sounds* have been tapped. A silent letter has no sound of its own
   * and lights up with the vowel it serves. */
  tapped?: number;
  size?: 'normal' | 'large';
  className?: string;
}

interface Arc { x1: number; x2: number; y: number }

function sameArcs(a: Arc[], b: Arc[]): boolean {
  return a.length === b.length && a.every((x, i) => x.x1 === b[i].x1 && x.x2 === b[i].x2 && x.y === b[i].y);
}

export function SoundTiles({ word, tapped = 0, size = 'normal', className }: Props) {
  const { content } = useServices();

  // Everything the measuring effect depends on has to keep the same identity between renders.
  // Recomputed inline, each one is a new object every render, which makes the effect run every
  // render, which sets state, which renders again: the word row would never stop redrawing.
  const cards = useMemo(() => cardMap(content.cards), [content.cards]);
  const pairs = useMemo(() => silentPartners(word, cards), [word, cards]);
  const sounding = useMemo(() => soundingIndexes(word, cards), [word, cards]);
  const starts = useMemo(() => new Set(word.syllables ?? []), [word]);

  const rowRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  // Mirrors `arcs` so measuring can compare without reading state, which would make the
  // measuring function change identity on every render — the loop we are avoiding.
  const lastArcs = useRef<Arc[]>(arcs);

  // The arc has to start and end on real tiles, so it is measured after layout and again on
  // resize. Under jsdom every rectangle is zero; the overlay still renders, which is what the
  // tests assert on, and the browser test covers how it actually looks.
  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const base = row.getBoundingClientRect();
    const next: Arc[] = [];
    for (const { vowel, silent } of pairs) {
      const a = tileRefs.current[vowel]?.getBoundingClientRect();
      const b = tileRefs.current[silent]?.getBoundingClientRect();
      if (!a || !b) continue;
      next.push({
        x1: a.left - base.left + a.width / 2,
        x2: b.left - base.left + b.width / 2,
        y: a.bottom - base.top,
      });
    }
    // Measuring the same geometry must not count as a change, or a resize — or a parent that
    // rebuilds the word object each render — would repaint the row without end.
    if (sameArcs(lastArcs.current, next)) return;
    lastArcs.current = next;
    setArcs((prev) => (sameArcs(prev, next) ? prev : next));
  }, [pairs]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    if (pairs.length === 0) return;
    // ResizeObserver does not exist in jsdom, so guard rather than polyfill.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && rowRef.current) ro.observe(rowRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, pairs]);

  const litVowels = new Set(sounding.slice(0, tapped));
  const isLit = (i: number) => litVowels.has(i) || pairs.some((p) => p.silent === i && litVowels.has(p.vowel));

  return (
    <div className={['tilerow', className].filter(Boolean).join(' ')} ref={rowRef}>
      <div className="row row-tight">
        {word.parts.map((p, i) => {
          const type = cardTypeById(content.cards, p.card);
          return (
            <Tile
              key={i}
              ref={(el: HTMLElement | null) => { tileRefs.current[i] = el; }}
              grapheme={p.grapheme}
              type={type}
              size={size}
              selected={isLit(i)}
              dim={type === 'silent' && !isLit(i)}
              className={starts.has(i) ? 'tile-syllable-start' : ''}
            />
          );
        })}
      </div>
      {pairs.length > 0 && (
        <svg
          className="vce-bridge"
          data-testid="vce-bridge"
          data-pairs={pairs.map((p) => `${p.vowel}-${p.silent}`).join(' ')}
          aria-hidden="true"
        >
          {arcs.map((a, i) => (
            <path key={i} d={`M ${a.x1} ${a.y} Q ${(a.x1 + a.x2) / 2} ${a.y + 26} ${a.x2} ${a.y}`} />
          ))}
        </svg>
      )}
    </div>
  );
}
