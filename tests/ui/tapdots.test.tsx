// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TapDots } from '../../src/ui/components/TapDots';
import { MissReview } from '../../src/ui/components/MissReview';
import { cvc, word } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

describe('TapDots', () => {
  it('in try mode, tapping dots in order then blending reports correct', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />, { audio });
    expect(screen.queryByRole('button', { name: 'Blend' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    expect(audio.played).toEqual(['m', 'a', 'p']);
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.spoken).toContain('map');
  });

  it('in try mode, tapping out of order reports a miss', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />);
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });

  it('in demo mode, plays each sound then the word and reports done', async () => {
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('sit')} mode="demo" onResult={onResult} />, { audio });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.played).toEqual(['s', 'i', 't']);
    expect(audio.spoken).toContain('sit');
  });

  it('an extra tap once all sounds are tapped does not double-count', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />, { audio });
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    // a ghost/rapid extra tap on the last dot, fired synchronously with no await
    fireEvent.click(screen.getByRole('button', { name: 'Sound 3' }));
    expect(audio.played.length).toBe(3);
    expect(await screen.findByRole('button', { name: 'Blend' })).toBeInTheDocument();
  });

  it('clicking Blend twice in quick succession reports the result only once', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<TapDots word={cvc('map')} mode="try" onResult={onResult} />, { audio });
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    const blendButton = await screen.findByRole('button', { name: 'Blend' });
    // two synchronous clicks, no await between them
    fireEvent.click(blendButton);
    fireEvent.click(blendButton);
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(1));
    expect(onResult).toHaveBeenCalledWith(true);
  });

  it('under StrictMode (mount/cleanup/remount), tapping then blending still reports a result', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(
      <StrictMode>
        <TapDots word={cvc('map')} mode="try" onResult={onResult} />
      </StrictMode>,
      { audio },
    );
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
  });

  it('marks syllable starts and shrinks long words', () => {
    const word = { text: 'sunsetlamp', parts: 'sunsetlamp'.split('').map((g) => ({ grapheme: g, card: g })), kind: 'real' as const, syllables: [3, 6] };
    const { container } = renderWithServices(<TapDots word={word} mode="try" onResult={() => {}} />);
    expect(container.querySelector('.tapdots')?.classList.contains('tapdots-long')).toBe(true);
    const starts = container.querySelectorAll('.tile-syllable-start');
    expect(starts.length).toBe(2);
    expect(starts[0].textContent).toBe('s');
    expect(starts[1].textContent).toBe('l');
    const dotButtons = container.querySelectorAll('button.dot');
    expect(dotButtons.length).toBe(word.parts.length);
  });

  it('does not shrink or split a short word', () => {
    const word = { text: 'map', parts: 'map'.split('').map((g) => ({ grapheme: g, card: g })), kind: 'real' as const };
    const { container } = renderWithServices(<TapDots word={word} mode="try" onResult={() => {}} />);
    expect(container.querySelector('.tapdots')?.classList.contains('tapdots-long')).toBe(false);
    expect(container.querySelectorAll('.tile-syllable-start').length).toBe(0);
  });
});

describe('TapDots with a silent letter', () => {
  const cake = () => word('cake', 'c,a:a_e,k,e:e_silent');

  it('puts each dot in the same column as the letter it stands for, and leaves the silent letter none', () => {
    const { container } = renderWithServices(<TapDots word={cake()} mode="try" onResult={() => {}} />);
    const cols = [...container.querySelectorAll('.tilecol')];
    // One column per LETTER, not per sound: c a k e.
    expect(cols.map((c) => c.querySelector('.tile')?.textContent)).toEqual(['c', 'a', 'k', 'e']);
    // The dot for sound N lives inside the column of the letter that makes it. Laid out as two
    // separately centred rows, as it used to be, every dot drifted right of its own letter as
    // soon as a silent letter made the counts differ.
    expect(cols.map((c) => c.querySelector('button.dot')?.getAttribute('aria-label') ?? null))
      .toEqual(['Sound 1', 'Sound 2', 'Sound 3', null]);
    // The silent e keeps an empty slot, so the row stays square and it still has no dot.
    expect(cols[3].querySelector('.dot-slot')).not.toBeNull();
    expect(cols[3].querySelector('button.dot')).toBeNull();
  });

  it('gives a four-letter word three dots and four tiles', () => {
    const { container } = renderWithServices(<TapDots word={cake()} mode="try" onResult={() => {}} />);
    expect(container.querySelectorAll('button.dot').length).toBe(3);
    expect(container.querySelectorAll('.tile').length).toBe(4);
    expect(screen.queryByRole('button', { name: 'Sound 4' })).toBeNull();
  });

  it('plays the three sounds it has, not the silent one', async () => {
    const user = userEvent.setup();
    const audio = new FakeAudio();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cake()} mode="try" onResult={onResult} />, { audio });
    await user.click(screen.getByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    expect(audio.played).toEqual(['c', 'a_e', 'k']);
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.spoken).toContain('cake');
  });

  it('in demo mode, steps through the sounds only', async () => {
    const audio = new FakeAudio();
    const onResult = vi.fn();
    renderWithServices(<TapDots word={cake()} mode="demo" onResult={onResult} />, { audio });
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    expect(audio.played).toEqual(['c', 'a_e', 'k']);
  });

  it('marks the syllable start on the dot that belongs to it', () => {
    const w = word('invite', 'i,n,v,i:i_e,t,e:e_silent', { syllables: [2] });
    const { container } = renderWithServices(<TapDots word={w} mode="try" onResult={() => {}} />);
    expect(container.querySelectorAll('button.dot').length).toBe(5);
    const marked = container.querySelectorAll('button.dot.dot-syllable-start');
    expect(marked.length).toBe(1);
    expect(marked[0].getAttribute('aria-label')).toBe('Sound 3');
  });

  it('marks the syllable start on the right dot when a silent letter comes before it', () => {
    // "homemade": h,o:o_e,m,e:e_silent,m,a:a_e,d,e:e_silent -> sounding = [0,1,2,4,5,6],
    // the second syllable starts at part index 4, which is sounding position 3 (the fourth dot).
    // A buggy implementation that tests the sounding position instead of the part index would
    // mark the fifth dot ("Sound 5") instead.
    const w = word('homemade', 'h,o:o_e,m,e:e_silent,m,a:a_e,d,e:e_silent', { syllables: [4] });
    const { container } = renderWithServices(<TapDots word={w} mode="try" onResult={() => {}} />);
    expect(container.querySelectorAll('button.dot').length).toBe(6);
    const marked = container.querySelectorAll('button.dot.dot-syllable-start');
    expect(marked.length).toBe(1);
    expect(marked[0].getAttribute('aria-label')).toBe('Sound 4');
  });
});

describe('MissReview', () => {
  it('explains, demonstrates, lets the child try, then finishes', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<MissReview word={cvc('log')} onDone={onDone} />, { audio });
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    // demo runs by itself, then the try appears
    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(audio.played.slice(0, 3)).toEqual(['l', 'o', 'g']);
  });

  it('still reaches the demo and finishes even if the intro speech rejects', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    class FlakyAudio extends FakeAudio {
      private failedOnce = false;
      async speak(text: string) {
        if (!this.failedOnce) {
          this.failedOnce = true;
          throw new Error('speech synthesis unavailable');
        }
        return super.speak(text);
      }
    }
    const audio = new FlakyAudio();
    renderWithServices(<MissReview word={cvc('log')} onDone={onDone} />, { audio });
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    // the intro speech rejected, but the demo still runs and hands off to the try
    await waitFor(() => expect(audio.played).toEqual(['l', 'o', 'g']));
    await user.click(await screen.findByRole('button', { name: 'Sound 1' }));
    await user.click(screen.getByRole('button', { name: 'Sound 2' }));
    await user.click(screen.getByRole('button', { name: 'Sound 3' }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
