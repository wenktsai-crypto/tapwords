// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Profiler, StrictMode, useState, type ReactElement } from 'react';
import { act } from '@testing-library/react';
import { SoundTiles } from '../../src/ui/components/SoundTiles';
import { word } from '../../src/content/build';
import { renderWithServices } from './helpers';

describe('SoundTiles', () => {
  it('shows every letter, including the silent one', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    expect([...container.querySelectorAll('.tile')].map((t) => t.textContent)).toEqual(['c', 'a', 'k', 'e']);
  });

  it('dims the silent letter and marks it as the silent type', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles[3].classList.contains('tile-silent')).toBe(true);
    expect(tiles[3].classList.contains('tile-dim')).toBe(true);
    expect(tiles[1].classList.contains('tile-vce')).toBe(true);
  });

  it('draws a bridge from the vowel to the e it belongs to', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('1-3');
  });

  it('bridges the right pair in a long word', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<SoundTiles word={w} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('3-5');
  });

  it('draws no bridge for a word with no silent letter', () => {
    const { container } = renderWithServices(<SoundTiles word={word('map', 'm,a,p')} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')).toBeNull();
  });

  it('lights a silent letter together with the vowel it serves', () => {
    const w = word('cake', 'c,a:a_e,k,e:e_silent');
    const { container } = renderWithServices(<SoundTiles word={w} tapped={2} />);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles[1].classList.contains('tile-selected')).toBe(true); // the a is tapped
    expect(tiles[3].classList.contains('tile-selected')).toBe(true); // so its e lights too
    expect(tiles[2].classList.contains('tile-selected')).toBe(false); // the k is not yet
  });

  it('stops dimming a silent letter once it lights up with its vowel', () => {
    const w = word('cake', 'c,a:a_e,k,e:e_silent');
    const { container } = renderWithServices(<SoundTiles word={w} tapped={2} />);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles[3].classList.contains('tile-selected')).toBe(true);
    expect(tiles[3].classList.contains('tile-dim')).toBe(false);
  });

  it('marks syllable starts', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<SoundTiles word={w} tapped={0} />);
    const starts = container.querySelectorAll('.tile-syllable-start');
    expect(starts.length).toBe(1);
    expect(starts[0].textContent).toBe('v');
  });

  it('hides the bridge from anyone reading the word aloud', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('aria-hidden')).toBe('true');
  });
});

/**
 * The measuring effect writes to state, so it can feed itself: measure -> setArcs -> render ->
 * new measure identity -> measure again, forever. On an iPad that is a locked-up screen, and
 * under jsdom it looks like a flaky timeout rather than a bug. These count real commits.
 */
describe('SoundTiles settles instead of re-rendering forever', () => {
  const cake = word('cake', 'c,a:a_e,k,e:e_silent');

  function countingRender(ui: ReactElement) {
    let commits = 0;
    const res = renderWithServices(
      <Profiler id="tiles" onRender={() => { commits += 1; }}>
        {ui}
      </Profiler>,
    );
    return { ...res, commits: () => commits };
  }

  it('stops committing once the first measurement lands', () => {
    const { commits, container } = countingRender(<SoundTiles word={cake} tapped={0} />);
    // Pin the precondition first. Bounded commits prove nothing on their own - an effect that
    // did no work at all would satisfy that just as well. The arc must actually have been
    // measured and drawn, and it must have cost exactly one extra commit to do it.
    expect(container.querySelectorAll('.vce-bridge path').length).toBe(1);
    expect(commits()).toBe(2); // the mount, plus one for the measured geometry
    // Nothing further is scheduled: flushing again changes nothing.
    act(() => {});
    expect(commits()).toBe(2);
  });

  it('ignores a storm of resizes that measure the same geometry', () => {
    const { commits } = countingRender(<SoundTiles word={cake} tapped={0} />);
    const settled = commits();
    act(() => {
      for (let i = 0; i < 500; i++) window.dispatchEvent(new Event('resize'));
    });
    // Five hundred resizes, not one repaint: equal geometry is not a change. The cost is flat,
    // so a child dragging the iPad around cannot make the word row thrash.
    expect(commits()).toBe(settled);
  });

  it('does not multiply commits when the parent hands it a fresh word object each time', () => {
    let bump = () => {};
    function Parent() {
      const [n, setN] = useState(0);
      bump = () => setN((v) => v + 1);
      // A brand new Word object every render, as the session screens build.
      return (
        <div data-n={n}>
          <SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />
        </div>
      );
    }
    const { commits } = countingRender(<Parent />);
    const afterMount = commits();
    const bumps = 100;
    for (let i = 0; i < bumps; i++) act(() => { bump(); });
    // Exactly one commit per parent render - the unavoidable minimum. Anything above this slope
    // means the measuring effect is feeding itself.
    expect(commits() - afterMount).toBe(bumps);
  });

  it('settles under StrictMode double-invocation too', () => {
    let commits = 0;
    const { container } = renderWithServices(
      <StrictMode>
        <Profiler id="strict" onRender={() => { commits += 1; }}>
          <SoundTiles word={cake} tapped={0} />
        </Profiler>
      </StrictMode>,
    );
    // Exact, so a regression to 3 cannot hide under a loose bound.
    expect(commits).toBe(2);
    expect(container.querySelectorAll('.vce-bridge path').length).toBe(1);
  });
});

/**
 * jsdom reports every rectangle as zero, which hides whether the arc is anchored to anything at
 * all. Standing in fake but real-shaped rectangles lets the arithmetic be checked: an effect that
 * quietly did nothing would leave the path sitting at the origin.
 */
describe('SoundTiles anchors the arc to the tiles it measured', () => {
  const GAP = 10;
  const TILE_H = 80;
  const layout = { tileW: 80 };
  /** Every rectangle measure asks for. Counting these catches an effect that re-runs per render. */
  let rectCalls = 0;
  let restore: (() => void) | undefined;

  function rect(left: number, top: number, width: number, height: number): DOMRect {
    return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}) } as DOMRect;
  }

  beforeEach(() => {
    layout.tileW = 80;
    rectCalls = 0;
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const el = this as HTMLElement;
      if (el.classList?.contains('tilerow')) {
        rectCalls += 1;
        return rect(0, 0, 600, 124);
      }
      if (el.classList?.contains('tile')) {
        rectCalls += 1;
        const i = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
        return rect(i * (layout.tileW + GAP), 0, layout.tileW, TILE_H);
      }
      return rect(0, 0, 0, 0);
    };
    restore = () => { Element.prototype.getBoundingClientRect = original; };
  });

  afterEach(() => { restore?.(); restore = undefined; });

  /** A quadratic Bezier's midpoint, which is the deepest point of a symmetric arc. */
  const midY = (y0: number, cy: number, y2: number) => (y0 + 2 * cy + y2) / 4;

  it('puts the arc ends on the two tile centres, and scoops far enough to be seen', () => {
    const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    const d = container.querySelector('.vce-bridge path')?.getAttribute('d');
    // Tile i sits at left i*90 and is 80 wide, so the a's centre is 130, the e's is 310, both
    // hanging off the bottom of the tiles at y 80.
    expect(d).toBe('M 130 80 Q 220 132 310 80');

    const dip = midY(80, 132, 80) - 80;
    // A quadratic curve only reaches half its control offset, and that half is all the child
    // sees. Across a 180px span anything under about 20px reads as a straight underline.
    expect(dip).toBe(26);
    expect(dip).toBeGreaterThan(20);
  });

  it('measures once on mount, not once per render', () => {
    renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
    // The row, the a, and the e: one measuring pass. Mounting settles over two renders, so if
    // the memoised inputs stopped holding `measure`'s identity steady this would read 6.
    expect(rectCalls).toBe(3);
  });

  it('re-anchors the arc when the letter font swaps in and moves every tile', async () => {
    let letFontsLoad!: () => void;
    const ready = new Promise<void>((resolve) => { letFontsLoad = resolve; });
    Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
    try {
      const { container } = renderWithServices(<SoundTiles word={word('cake', 'c,a:a_e,k,e:e_silent')} tapped={0} />);
      expect(container.querySelector('.vce-bridge path')?.getAttribute('d')).toBe('M 130 80 Q 220 132 310 80');

      // Lexend finishes downloading and the letters get wider, shifting every tile centre.
      layout.tileW = 100;
      await act(async () => { letFontsLoad(); await ready; });

      // Centres are now 160 and 380. An arc left pinned to the old layout would still read 130/310.
      expect(container.querySelector('.vce-bridge path')?.getAttribute('d')).toBe('M 160 80 Q 270 132 380 80');
    } finally {
      delete (document as unknown as Record<string, unknown>).fonts;
    }
  });
});
