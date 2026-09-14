// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
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
    const { commits } = countingRender(<SoundTiles word={cake} tapped={0} />);
    // One mount commit, plus at most one more for the measured geometry.
    expect(commits()).toBeLessThanOrEqual(2);
    const settled = commits();
    // Nothing further is scheduled: flushing again changes nothing.
    act(() => {});
    expect(commits()).toBe(settled);
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
    renderWithServices(
      <StrictMode>
        <Profiler id="strict" onRender={() => { commits += 1; }}>
          <SoundTiles word={cake} tapped={0} />
        </Profiler>
      </StrictMode>,
    );
    expect(commits).toBeLessThanOrEqual(4);
  });
});
