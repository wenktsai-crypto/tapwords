// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from '../../src/ui/screens/Home';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { renderWithServices } from './helpers';

/** A store whose first `listProfiles` fails, then works — for the retry path. */
class FlakyListStore extends MemoryStore {
  private failed = false;
  async listProfiles() {
    if (!this.failed) {
      this.failed = true;
      throw new Error('storage unavailable');
    }
    return super.listProfiles();
  }
}

describe('Home', () => {
  it('explains a failed load and reloads when the grown-up taps Try again', async () => {
    const user = userEvent.setup();
    const store = new FlakyListStore();
    await store.saveProfile({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });
    renderWithServices(<Home onStart={vi.fn()} onParent={vi.fn()} />, { store });

    expect(await screen.findByText(/couldn't open the saved children/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('button', { name: /^Sam$/ })).toBeInTheDocument();
    expect(screen.queryByText(/couldn't open the saved children/i)).not.toBeInTheDocument();
  });

  it('will not save a child with a blank name', async () => {
    const user = userEvent.setup();
    renderWithServices(<Home onStart={vi.fn()} onParent={vi.fn()} />, { store: new MemoryStore() });

    await user.click(await screen.findByRole('button', { name: /add a child/i }));
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    await user.type(screen.getByLabelText(/name/i), 'Sam');
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
  });

  it('creates a profile with a starting point and starts a session', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const onStart = vi.fn();
    renderWithServices(<Home onStart={onStart} onParent={vi.fn()} />, { store });

    await user.click(await screen.findByRole('button', { name: /add a child/i }));
    await user.type(screen.getByLabelText(/name/i), 'Sam');
    await user.selectOptions(screen.getByLabelText(/start/i), '1.1');
    await user.click(screen.getByRole('button', { name: /save/i }));

    const saved = await store.listProfiles();
    expect(saved.length).toBe(1);
    expect(saved[0].name).toBe('Sam');
    expect(saved[0].state.currentSubstep).toBe('1.1');
    expect(saved[0].state.lessonPending).toBe(true);

    await user.click(await screen.findByRole('button', { name: /^Sam$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam' }));
  });

  it('opens the grown-up area only after a long press', async () => {
    const store = new MemoryStore();
    await store.saveProfile({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });
    const onParent = vi.fn();
    renderWithServices(<Home onStart={vi.fn()} onParent={onParent} />, { store });
    const btn = await screen.findByRole('button', { name: /grown-ups/i });
    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(btn);
      act(() => { vi.advanceTimersByTime(500); });
      fireEvent.pointerUp(btn);
      act(() => { vi.advanceTimersByTime(2000); });
      expect(onParent).not.toHaveBeenCalled();
      fireEvent.pointerDown(btn);
      act(() => { vi.advanceTimersByTime(1600); });
      expect(onParent).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
    } finally {
      vi.useRealTimers();
    }
  });
});
