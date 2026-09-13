// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TileBuilder } from '../../src/ui/components/TileBuilder';
import { renderWithServices } from './helpers';

describe('TileBuilder', () => {
  it('numbers repeated tray pieces so each one can be picked on its own', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<TileBuilder tray={['t', 'o', 't', 'a', 'm']} expected={['t', 'o', 't']} onDone={onDone} />);

    const tray = await screen.findByTestId('tray');
    for (const name of ['t 1', 'o', 't 2']) await user.click(within(tray).getByRole('button', { name }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    expect(onDone).toHaveBeenCalledWith(true);
  });

  it('leaves a tray of distinct pieces labelled by their letter alone', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithServices(<TileBuilder tray={['l', 'o', 'g', 'a']} expected={['l', 'o', 'g']} onDone={onDone} />);

    const tray = await screen.findByTestId('tray');
    for (const name of ['l', 'o', 'g']) await user.click(within(tray).getByRole('button', { name }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    expect(onDone).toHaveBeenCalledWith(true);
  });
});
