// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from '../../src/ui/screens/Home';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { CorruptDataError } from '../../src/store/types';
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

  it('can create a child from the placement check', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store });
    await user.click(await screen.findByRole('button', { name: /add a child/i }));
    await user.type(screen.getByLabelText(/name/i), 'Ava');
    await user.click(screen.getByRole('button', { name: /find the starting point/i }));
    await user.click(screen.getByRole('button', { name: /begin/i }));
    for (let i = 0; i < 8; i++) await user.click(screen.getByRole('button', { name: /missed it/i }));
    await user.click(await screen.findByRole('button', { name: /use this/i }));
    expect(await screen.findByRole('button', { name: /^Ava$/ })).toBeInTheDocument();
    expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.1');
  });

  it('offers restore or a fresh start when the saved data is damaged', async () => {
    let broken = true;
    class CorruptStore extends MemoryStore {
      async listProfiles() {
        if (broken) throw new CorruptDataError();
        return super.listProfiles();
      }
      async clearAll() { broken = false; await super.clearAll(); }
    }
    const store = new CorruptStore();
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store });
    expect(await screen.findByText(/saved data on this device is damaged/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/restore from a backup/i)).toBeInTheDocument();
    const fresh = screen.getByRole('button', { name: /start fresh/i });
    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(fresh);
      act(() => { vi.advanceTimersByTime(1600); });
    } finally {
      vi.useRealTimers();
    }
    expect(await screen.findByText(/add a child to get started/i)).toBeInTheDocument();
  });

  it('shows a restore control on the home screen when no child is saved yet', async () => {
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store: new MemoryStore() });
    expect(await screen.findByLabelText(/restore from a backup/i)).toBeInTheDocument();
  });

  it('hides the restore control once a child is saved, keeping the home screen for the child', async () => {
    const store = new MemoryStore();
    await store.saveProfile({ id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') });
    renderWithServices(<Home onStart={() => {}} onParent={() => {}} />, { store });
    expect(await screen.findByRole('button', { name: /^Sam$/ })).toBeInTheDocument();
    expect(screen.queryByLabelText(/restore from a backup/i)).toBeNull();
  });
});
