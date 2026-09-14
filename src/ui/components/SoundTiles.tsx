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

/** How far the curve's control point is pulled below the tiles.
 *
 * A quadratic Bezier only reaches HALF its control offset: the midpoint is (P0 + 2*P1 + P2) / 4,
 * so the dip the child actually sees is ARC_PULL / 2. At 52 that is a 26px scoop under a 180px
 * span, which reads as a curve joining two letters rather than a flat underline.
 * `.tilerow`'s padding-bottom must stay above the visible dip or the arc runs into whatever
 * sits below the word. */
const ARC_PULL = 52;

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
    if (ro) {
      // Watching the row alone is not enough: it is a full-width block, so when the tiles change
      // width the row's own box does not, and the arc would stay pinned to stale positions.
      // The tiles are what actually move.
      if (rowRef.current) ro.observe(rowRef.current);
      for (const tile of tileRefs.current) if (tile) ro.observe(tile);
    }
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // The letter font is a real download. On a cold first load — a child's iPad, exactly when this
  // matters — it can swap in after the first measurement, moving every tile centre. Remeasure
  // once the fonts have settled. jsdom has no document.fonts, hence the guard.
  useEffect(() => {
    if (pairs.length === 0) return;
    let live = true;
    document.fonts?.ready.then(() => { if (live) measure(); });
    return () => { live = false; };
  }, [measure]);

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
            <path key={i} d={`M ${a.x1} ${a.y} Q ${(a.x1 + a.x2) / 2} ${a.y + ARC_PULL} ${a.x2} ${a.y}`} />
          ))}
        </svg>
      )}
    </div>
  );
}
