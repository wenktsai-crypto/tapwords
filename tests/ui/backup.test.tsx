// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackupPanel } from '../../src/ui/screens/BackupPanel';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { createBackup } from '../../src/store/backup';
import { renderWithServices } from './helpers';

const profile = (id: string, name: string) => ({ id, name, color: 'sky', createdAt: 'd', state: initialState('1.1') });

describe('BackupPanel', () => {
  it('hands a backup file to saveFile', async () => {
    const user = userEvent.setup();
    const store = new MemoryStore();
    await store.saveProfile(profile('p1', 'Sam'));
    const saveFile = vi.fn(async () => {});
    renderWithServices(<BackupPanel />, { store, saveFile });
    await user.click(screen.getByRole('button', { name: /back up/i }));
    await waitFor(() => expect(saveFile).toHaveBeenCalled());
    const [name, text] = saveFile.mock.calls[0] as unknown as [string, string];
    expect(name).toMatch(/^tapwords-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(JSON.parse(text).profiles[0].profile.name).toBe('Sam');
    expect(await screen.findByText(/backup saved/i)).toBeInTheDocument();
  });

  it('restores a chosen file after asking replace or add', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    const onRestored = vi.fn();
    renderWithServices(<BackupPanel onRestored={onRestored} />, { store: target });

    const file = new File([text], 'tapwords-backup.json', { type: 'application/json' });
    await user.upload(screen.getByLabelText(/restore from a backup/i), file);
    await user.click(await screen.findByRole('button', { name: /add to what is here/i }));
    await waitFor(() => expect(onRestored).toHaveBeenCalled());
    expect((await target.listProfiles()).map((p) => p.name).sort()).toEqual(['Old', 'Sam']);
    expect(await screen.findByText(/restored 1 child/i)).toBeInTheDocument();
  });

  it('replace mode removes what was there', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    renderWithServices(<BackupPanel />, { store: target });
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File([text], 'b.json', { type: 'application/json' }));
    await user.click(await screen.findByRole('button', { name: /replace everything/i }));
    await waitFor(async () => expect((await target.listProfiles()).map((p) => p.name)).toEqual(['Sam']));
  });

  it('refuses a file that is not a backup', async () => {
    const user = userEvent.setup();
    renderWithServices(<BackupPanel />);
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File(['hello'], 'x.json', { type: 'application/json' }));
    expect(await screen.findByText(/not a Tapwords backup/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /replace everything/i })).toBeNull();
  });

  it('in restore-only mode offers only replace', async () => {
    const user = userEvent.setup();
    const source = new MemoryStore();
    await source.saveProfile(profile('p1', 'Sam'));
    const text = JSON.stringify(await createBackup(source));
    renderWithServices(<BackupPanel restoreOnly />);
    expect(screen.queryByRole('button', { name: /back up/i })).toBeNull();
    await user.upload(screen.getByLabelText(/restore from a backup/i), new File([text], 'b.json', { type: 'application/json' }));
    expect(await screen.findByRole('button', { name: /replace everything/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add to what is here/i })).toBeNull();
  });
});
