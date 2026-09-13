// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadAloudPart } from '../../src/ui/session/ReadAloudPart';
import { cvc } from '../../src/content/build';
import { renderWithServices } from './helpers';

const words = [{ word: cvc('map'), substep: '1.1', isReview: false }, { word: cvc('sit'), substep: '1.1', isReview: true }];

describe('ReadAloudPart', () => {
  it('skips when no grown-up is present', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<ReadAloudPart words={words} sentences={['The map.']} substep="1.1" onComplete={onComplete} />);
    await user.click(await screen.findByRole('button', { name: /not right now/i }));
    expect(onComplete).toHaveBeenCalledWith([], false);
  });

  it('lets a parent mark each word and sentence', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<ReadAloudPart words={words} sentences={['The map.']} substep="1.1" onComplete={onComplete} />);
    await user.click(await screen.findByRole('button', { name: /^yes$/i }));
    expect(screen.getByText('map')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /got it/i }));
    expect(screen.getByText('sit')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /missed it/i }));
    expect(screen.getByText('The map.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /got it/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0]).toEqual([
      [
        { itemKey: 'word:1.1:map', activity: 'read-aloud', correct: true, isReview: false, parentMarked: true },
        { itemKey: 'word:1.1:sit', activity: 'read-aloud', correct: false, isReview: true, parentMarked: true },
        { itemKey: 'sentence:1.1:The map.', activity: 'read-aloud', correct: true, isReview: false, parentMarked: true },
      ],
      true,
    ]);
  });

  it('records exactly one response when "Got it" is clicked twice synchronously', async () => {
    const onComplete = vi.fn();
    const single = [{ word: cvc('map'), substep: '1.1', isReview: false }];
    renderWithServices(<ReadAloudPart words={single} sentences={[]} substep="1.1" onComplete={onComplete} />);
    fireEvent.click(await screen.findByRole('button', { name: /^yes$/i }));
    const gotIt = await screen.findByRole('button', { name: /got it/i });
    fireEvent.click(gotIt);
    fireEvent.click(gotIt);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete).toHaveBeenCalledWith(
      [{ itemKey: 'word:1.1:map', activity: 'read-aloud', correct: true, isReview: false, parentMarked: true }],
      true,
    );
  });
});
