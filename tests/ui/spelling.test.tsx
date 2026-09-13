// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpellingPart } from '../../src/ui/session/SpellingPart';
import type { SpellingItem } from '../../src/engine/session';
import { cvc } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const items: SpellingItem[] = [
  { type: 'sound', card: 'm', choices: ['a', 'm', 'p', 's'], isReview: false },
  { type: 'word', word: cvc('sit'), substep: '1.1', tray: ['t', 's', 'a', 'i', 'm'], isReview: true },
  { type: 'sentence', text: 'The rat sat.', substep: '1.1', words: ['sat.', 'The', 'rat'] },
];

describe('SpellingPart', () => {
  it('scores a sound, a word and a sentence, with feedback on misses', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<SpellingPart items={items} onComplete={onComplete} />, { audio });

    // sound: wrong then Next
    await waitFor(() => expect(audio.played).toContain('m'));
    await user.click(screen.getByRole('button', { name: 's' }));
    await user.click(await screen.findByRole('button', { name: /next/i }));

    // word: correct
    await waitFor(() => expect(audio.spoken).toContain('sit'));
    const tray = screen.getByTestId('tray');
    for (const g of ['s', 'i', 't']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    // sentence: wrong order then Next
    await waitFor(() => expect(audio.spoken).toContain('The rat sat.'));
    const tray2 = screen.getByTestId('tray');
    for (const w of ['rat', 'The', 'sat.']) await user.click(within(tray2).getByRole('button', { name: w }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(await screen.findByText('The rat sat.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'card:m', activity: 'spell-sound', correct: false, isReview: false, parentMarked: false },
      { itemKey: 'word:1.1:sit', activity: 'spell-word', correct: true, isReview: true, parentMarked: false },
      { itemKey: 'sentence:1.1:The rat sat.', activity: 'spell-sentence', correct: false, isReview: false, parentMarked: false },
    ]);
  });

  it('runs the miss review after a misspelled word', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<SpellingPart items={[items[1]]} onComplete={onComplete} />);
    const tray = await screen.findByTestId('tray');
    for (const g of ['s', 'a', 't']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    for (let k = 1; k <= 3; k++) await user.click(await screen.findByRole('button', { name: `Sound ${k}` }));
    await user.click(await screen.findByRole('button', { name: 'Blend' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0][0][0].correct).toBe(false);
  });

  it('does not double-record when a sound tile is tapped twice quickly', async () => {
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const single: SpellingItem[] = [{ type: 'sound', card: 'm', choices: ['a', 'm', 'p', 's'], isReview: false }];
    renderWithServices(<SpellingPart items={single} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.played).toContain('m'));
    const tile = screen.getByRole('button', { name: 'm' });
    fireEvent.click(tile);
    fireEvent.click(tile);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'card:m', activity: 'spell-sound', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('calls onComplete exactly once under StrictMode with an empty items list', async () => {
    const onComplete = vi.fn();
    renderWithServices(
      <StrictMode>
        <SpellingPart items={[]} onComplete={onComplete} />
      </StrictMode>,
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
