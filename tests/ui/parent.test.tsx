// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentArea } from '../../src/ui/screens/ParentArea';
import { MemoryStore } from '../../src/store/memory';
import { initialState, type SessionLog } from '../../src/engine/types';
import { CARDS } from '../../src/content/cards';
import { cvc, cvcNonsense } from '../../src/content/build';
import type { Content } from '../../src/content/types';
import { CONTENT } from '../../src/content';
import { renderWithServices } from './helpers';

const twoSubsteps: Content = {
  cards: CARDS,
  substeps: [CONTENT.substeps[0], { ...CONTENT.substeps[0], id: '1.2', title: 'Second step', groups: [{ cards: ['b'], lesson: [] }], words: [cvc('bat'), cvcNonsense('bip')] }],
};

describe('ParentArea', () => {
  it('shows progress and moves the child to another substep', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: { ...initialState('1.1'), sessionsCompleted: 2, strengths: { 'word:1.1:map': { value: 0.1, lastSeen: 2 }, 'card:a': { value: 0.9, lastSeen: 2 } } } };
    await store.saveProfile(profile);
    const today = new Date().toISOString();
    const log = (n: number, correct: number, total: number, ra = false): SessionLog => ({
      sessionNumber: n, date: today, substep: '1.1', complete: true, readAloudDone: ra,
      responses: Array.from({ length: total }, (_, k) => ({ itemKey: 'word:1.1:map', activity: 'tap', correct: k < correct, isReview: false, parentMarked: false })),
    });
    await store.appendLog('p1', log(1, 8, 10));
    await store.appendLog('p1', log(2, 10, 10, true));

    const onBack = vi.fn();
    renderWithServices(<ParentArea profile={profile} onBack={onBack} />, { store, content: twoSubsteps });

    expect(await screen.findByText(/sessions in the last 14 days/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('map, a')).toBeInTheDocument();
    expect(screen.getByText(/last read-aloud/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/move to/i), '1.2');
    await user.click(screen.getByRole('button', { name: /^move$/i }));
    await waitFor(async () => expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.2'));
    expect((await store.listProfiles())[0].state.lessonPending).toBe(true);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('ignores a second synchronous submit while the save is in flight', async () => {
    const user = userEvent.setup();
    let saveCount = 0;
    class CountingStore extends MemoryStore {
      async saveProfile(p: Parameters<MemoryStore['saveProfile']>[0]) {
        saveCount++;
        await super.saveProfile(p);
      }
    }
    const store = new CountingStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') };
    await store.saveProfile(profile);
    saveCount = 0;

    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });

    await user.selectOptions(screen.getByLabelText(/move to/i), '1.2');
    const button = screen.getByRole('button', { name: /^move$/i });
    button.closest('form')!.requestSubmit();
    button.closest('form')!.requestSubmit();

    await waitFor(() => expect(saveCount).toBe(1));
  });

  it('lists only cards and words under "needs the most practice"', async () => {
    const store = new MemoryStore();
    const profile = {
      id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd',
      state: {
        ...initialState('1.1'),
        sessionsCompleted: 2,
        strengths: {
          'story:1.1:Rat on a Log:0': { value: 0.01, lastSeen: 2 },
          'sentence:1.1:The rat sat on a log.': { value: 0.02, lastSeen: 2 },
          'word:1.1:map': { value: 0.1, lastSeen: 2 },
          'card:a': { value: 0.9, lastSeen: 2 },
        },
      },
    };
    await store.saveProfile(profile);
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });

    expect(await screen.findByText('map, a')).toBeInTheDocument();
  });

  it('says so plainly when the progress list cannot be loaded', async () => {
    class BrokenLogsStore extends MemoryStore {
      async listLogs(): Promise<never> {
        throw new Error('storage unavailable');
      }
    }
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') };
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store: new BrokenLogsStore(), content: twoSubsteps });

    expect(await screen.findByText(/couldn't load progress/i)).toBeInTheDocument();
  });

  it('excludes accuracy from sessions before the current stay at this substep', async () => {
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: { ...initialState('1.1'), substepEnteredAt: 2, sessionsCompleted: 3 } };
    await store.saveProfile(profile);
    const today = new Date().toISOString();
    const log = (n: number, correct: number, total: number): SessionLog => ({
      sessionNumber: n, date: today, substep: '1.1', complete: true, readAloudDone: false,
      responses: Array.from({ length: total }, (_, k) => ({ itemKey: 'word:1.1:map', activity: 'tap', correct: k < correct, isReview: false, parentMarked: false })),
    });
    // Sessions 1 and 2 are from an earlier stay at 1.1 (before substepEnteredAt) and score 50%;
    // only session 3, the current stay, should count, at 100%.
    await store.appendLog('p1', log(1, 5, 10));
    await store.appendLog('p1', log(2, 5, 10));
    await store.appendLog('p1', log(3, 10, 10));

    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });

    expect(await screen.findByText('100%')).toBeInTheDocument();
  });

  it('can move the child by running the placement check', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: { ...initialState('1.1'), sessionsCompleted: 4 } };
    await store.saveProfile(profile);
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });
    await user.click(await screen.findByRole('button', { name: /placement check/i }));
    await user.click(screen.getByRole('button', { name: /begin/i }));
    for (let i = 0; i < 8; i++) await user.click(screen.getByRole('button', { name: /got it/i }));
    await user.selectOptions(await screen.findByLabelText(/start at/i), '1.2');
    await user.click(screen.getByRole('button', { name: /use this/i }));
    await waitFor(async () => expect((await store.listProfiles())[0].state.currentSubstep).toBe('1.2'));
    expect((await store.listProfiles())[0].state.substepEnteredAt).toBe(4);
    expect(await screen.findByText(/grown-up area/i)).toBeInTheDocument();
  });

  it('opens the recording page from the tools', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    const profile = { id: 'p1', name: 'Sam', color: 'sky', createdAt: 'd', state: initialState('1.1') };
    await store.saveProfile(profile);
    renderWithServices(<ParentArea profile={profile} onBack={vi.fn()} />, { store, content: twoSubsteps });
    await user.click(await screen.findByRole('button', { name: /record sounds/i }));
    expect(await screen.findByText(/record the sounds/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(await screen.findByText(/grown-up area/i)).toBeInTheDocument();
  });
});
