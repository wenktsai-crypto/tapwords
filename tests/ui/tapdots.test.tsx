// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TapDots } from '../../src/ui/components/TapDots';
import { MissReview } from '../../src/ui/components/MissReview';
import { cvc } from '../../src/content/build';
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
  });

  it('does not shrink or split a short word', () => {
    const word = { text: 'map', parts: 'map'.split('').map((g) => ({ grapheme: g, card: g })), kind: 'real' as const };
    const { container } = renderWithServices(<TapDots word={word} mode="try" onResult={() => {}} />);
    expect(container.querySelector('.tapdots')?.classList.contains('tapdots-long')).toBe(false);
    expect(container.querySelectorAll('.tile-syllable-start').length).toBe(0);
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
