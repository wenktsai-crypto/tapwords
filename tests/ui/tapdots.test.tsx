// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
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
});
