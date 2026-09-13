// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SoundCardsPart } from '../../src/ui/session/SoundCardsPart';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const reverse = [
  { target: 'm', choices: ['m', 'a', 'p'], isReview: false },
  { target: 'a', choices: ['p', 'a', 'm'], isReview: true },
];

describe('SoundCardsPart', () => {
  it('walks the forward drill then scores the reverse drill', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<SoundCardsPart forwardCards={['m', 'a']} reverseItems={reverse} onComplete={onComplete} />, { audio });

    await user.click(await screen.findByRole('button', { name: /hear it$/i }));
    expect(audio.played).toContain('m');
    await user.click(screen.getByRole('button', { name: /that's it/i }));
    await user.click(screen.getByRole('button', { name: /not sure/i }));

    // reverse item 1: correct
    await waitFor(() => expect(audio.played.at(-1)).toBe('m'));
    await user.click(screen.getByRole('button', { name: 'm' }));
    // reverse item 2: wrong, then Next
    await waitFor(() => expect(audio.played.at(-1)).toBe('a'));
    await user.click(screen.getByRole('button', { name: 'p' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const rs = onComplete.mock.calls[0][0];
    expect(rs).toEqual([
      { itemKey: 'card:m', activity: 'sound-reverse', correct: true, isReview: false, parentMarked: false },
      { itemKey: 'card:a', activity: 'sound-reverse', correct: false, isReview: true, parentMarked: false },
    ]);
  });

  it('completes immediately with nothing to do', async () => {
    const onComplete = vi.fn();
    renderWithServices(<SoundCardsPart forwardCards={[]} reverseItems={[]} onComplete={onComplete} />);
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith([]));
  });

  it('does not double-record when the last reverse item is tapped twice quickly', async () => {
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const single = [{ target: 'm', choices: ['m', 'a', 'p'], isReview: false }];
    renderWithServices(<SoundCardsPart forwardCards={[]} reverseItems={single} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.played.at(-1)).toBe('m'));
    const tile = screen.getByRole('button', { name: 'm' });
    fireEvent.click(tile);
    fireEvent.click(tile);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'card:m', activity: 'sound-reverse', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('does not double-record a miss when the wrong tile is tapped twice quickly', async () => {
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const single = [{ target: 'm', choices: ['m', 'a', 'p'], isReview: false }];
    renderWithServices(<SoundCardsPart forwardCards={[]} reverseItems={single} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.played.at(-1)).toBe('m'));
    const tile = screen.getByRole('button', { name: 'p' });
    fireEvent.click(tile);
    fireEvent.click(tile);

    const next = await screen.findByRole('button', { name: /next/i });
    fireEvent.click(next);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'card:m', activity: 'sound-reverse', correct: false, isReview: false, parentMarked: false },
    ]);
  });
});
