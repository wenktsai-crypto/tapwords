// @vitest-environment jsdom
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordWorkPart } from '../../src/ui/session/WordWorkPart';
import type { WordWorkItem } from '../../src/engine/session';
import { cvc, word } from '../../src/content/build';
import { FakeAudio } from '../../src/audio/fake';
import { renderWithServices } from './helpers';

const items: WordWorkItem[] = [
  { type: 'tap', word: cvc('map'), substep: '1.1', isReview: false },
  { type: 'find', word: cvc('sat'), substep: '1.1', isReview: true, choices: ['sad', 'sat', 'sap'] },
  { type: 'build', word: cvc('log'), substep: '1.1', isReview: false },
];

/** A voice that always fails, as an iPad can when speech synthesis is unavailable. */
class BrokenAudio extends FakeAudio {
  async speak(text: string) {
    await super.speak(text);
    throw new Error('no voice');
  }
}

async function tapOut(user: ReturnType<typeof userEvent.setup>, n: number) {
  for (let k = 1; k <= n; k++) await user.click(await screen.findByRole('button', { name: `Sound ${k}` }));
  await user.click(await screen.findByRole('button', { name: 'Blend' }));
}

describe('WordWorkPart', () => {
  it('scores tap, find and build items and reviews a miss', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    renderWithServices(<WordWorkPart items={items} onComplete={onComplete} />, { audio });

    // 1. tap "map" correctly
    await tapOut(user, 3);

    // 2. find "sat": choose wrong, then work through the miss review
    await waitFor(() => expect(audio.spoken).toContain('sat'));
    await user.click(screen.getByRole('button', { name: 'sad' }));
    expect(await screen.findByText(/let's look at that one/i)).toBeInTheDocument();
    await tapOut(user, 3);

    // 3. build "log": tap l, o, g from the tray then Done
    const tray = await screen.findByTestId('tray');
    for (const g of ['l', 'o', 'g']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'word:1.1:map', activity: 'tap', correct: true, isReview: false, parentMarked: false },
      { itemKey: 'word:1.1:sat', activity: 'find', correct: false, isReview: true, parentMarked: false },
      { itemKey: 'word:1.1:log', activity: 'build', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('lets the child remove a tile from the answer row', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithServices(<WordWorkPart items={[items[2]]} onComplete={onComplete} />);
    const tray = await screen.findByTestId('tray');
    await user.click(within(tray).getByRole('button', { name: 'o' }));
    await user.click(within(screen.getByTestId('answer')).getByRole('button', { name: /remove o/i }));
    for (const g of ['l', 'o', 'g']) await user.click(within(tray).getByRole('button', { name: g }));
    await user.click(screen.getByRole('button', { name: /done/i }));
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete.mock.calls[0][0][0].correct).toBe(true);
  });

  it('does not double-record when a find choice is tapped twice quickly', async () => {
    const onComplete = vi.fn();
    const audio = new FakeAudio();
    const single: WordWorkItem[] = [{ type: 'find', word: cvc('sat'), substep: '1.1', isReview: false, choices: ['sad', 'sat', 'sap'] }];
    renderWithServices(<WordWorkPart items={single} onComplete={onComplete} />, { audio });

    await waitFor(() => expect(audio.spoken).toContain('sat'));
    const choice = screen.getByRole('button', { name: 'sat' });
    fireEvent.click(choice);
    fireEvent.click(choice);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { itemKey: 'word:1.1:sat', activity: 'find', correct: true, isReview: false, parentMarked: false },
    ]);
  });

  it('still shows the build tray when the voice fails', async () => {
    const onComplete = vi.fn();
    renderWithServices(<WordWorkPart items={[items[2]]} onComplete={onComplete} />, { audio: new BrokenAudio() });
    expect(await screen.findByTestId('tray')).toBeInTheDocument();
  });

  it('calls onComplete exactly once under StrictMode with an empty items list', async () => {
    const onComplete = vi.fn();
    renderWithServices(
      <StrictMode>
        <WordWorkPart items={[]} onComplete={onComplete} />
      </StrictMode>,
    );
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a silent-e word with its bridge line when the word is displayed', () => {
    const buildItem: WordWorkItem = { type: 'build', word: word('cake', 'c,a:a_e,k,e:e_silent'), substep: '4.1', isReview: false };
    const { container } = renderWithServices(<WordWorkPart items={[buildItem]} onComplete={vi.fn()} />);
    expect(container.querySelector('[data-testid="vce-bridge"]')?.getAttribute('data-pairs')).toBe('1-3');
    expect(container.querySelectorAll('.tile').length).toBe(4);
  });

  it('completes two tap items for the same word with two responses', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const mapWord = cvc('map');
    const twoItems: WordWorkItem[] = [
      { type: 'tap', word: mapWord, substep: '1.1', isReview: false },
      { type: 'tap', word: mapWord, substep: '1.1', isReview: false },
    ];
    renderWithServices(<WordWorkPart items={twoItems} onComplete={onComplete} />);

    await tapOut(user, 3);
    await tapOut(user, 3);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toHaveLength(2);
  });
});
