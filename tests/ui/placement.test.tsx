// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacementScreen } from '../../src/ui/screens/PlacementScreen';
import { CONTENT } from '../../src/content';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content } from '../../src/content/types';
import { renderWithServices } from './helpers';

const one = CONTENT.substeps[0];
const three: Content = {
  cards: CARDS,
  substeps: [
    one,
    { ...one, id: '1.2', title: 'Second', words: [cvc('bat'), cvcNonsense('bip')] },
    { ...one, id: '1.3', title: 'Third', words: one.words },
    { ...one, id: '1.4', title: 'Fourth', words: one.words },
    { ...one, id: '1.5', title: 'Fifth', words: one.words },
    { ...one, id: '1.6', title: 'Sixth', words: one.words },
  ],
};

async function markList(user: ReturnType<typeof userEvent.setup>, got: number, missed: number) {
  for (let i = 0; i < got; i++) await user.click(screen.getByRole('button', { name: /got it/i }));
  for (let i = 0; i < missed; i++) await user.click(screen.getByRole('button', { name: /missed it/i }));
}

describe('PlacementScreen', () => {
  it('shows lists in order, stops after the first list below 75%, and suggests the last passed one', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<PlacementScreen onDone={onDone} onCancel={() => {}} />, { content: three });

    await user.click(screen.getByRole('button', { name: /begin/i }));
    expect(screen.getByText(/list 1 of 3/i)).toBeInTheDocument();
    await markList(user, 8, 0);          // 1.1 passes
    expect(screen.getByText(/list 2 of 3/i)).toBeInTheDocument();
    await markList(user, 6, 2);          // 1.3 passes at exactly 75%
    expect(screen.getByText(/list 3 of 3/i)).toBeInTheDocument();
    await markList(user, 3, 5);          // 1.6 fails; the check stops

    expect(await screen.findByText(/we suggest starting at 1\.3/i)).toBeInTheDocument();
    expect((screen.getByLabelText(/start at/i) as HTMLSelectElement).value).toBe('1.3');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    expect(onDone).toHaveBeenCalledWith('1.3');
  });

  it('lets the parent change the suggestion before accepting', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<PlacementScreen onDone={onDone} onCancel={() => {}} />, { content: three });
    await user.click(screen.getByRole('button', { name: /begin/i }));
    await markList(user, 0, 8);          // 1.1 fails straight away
    expect(await screen.findByText(/we suggest starting at 1\.1/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/start at/i), '1.2');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    expect(onDone).toHaveBeenCalledWith('1.2');
  });

  it('can be cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithServices(<PlacementScreen onDone={() => {}} onCancel={onCancel} />, { content: three });
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
