import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../../src/store/memory';
import { initialState } from '../../src/engine/types';
import { backupFileName, base64ToBlob, blobToBase64, createBackup, parseBackup, restoreBackup } from '../../src/store/backup';
import type { Profile, Store } from '../../src/store/types';

const profile = (id: string, name: string): Profile => ({ id, name, color: 'sky', createdAt: '2026-09-12T00:00:00Z', state: { ...initialState('1.1'), sessionsCompleted: 2 } });
const log = (n: number) => ({ sessionNumber: n, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });

async function seeded() {
  const s = new MemoryStore();
  await s.saveProfile(profile('p1', 'Sam'));
  await s.saveProfile(profile('p2', 'Ava'));
  await s.appendLog('p1', log(1));
  await s.appendLog('p1', log(2));
  await s.saveClip('m', new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'audio/webm' }));
  return s;
}

describe('base64 helpers', () => {
  it('round-trips binary data', async () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255]);
    const b64 = await blobToBase64(new Blob([bytes], { type: 'audio/mp4' }));
    const back = base64ToBlob(b64, 'audio/mp4');
    expect(back.type).toBe('audio/mp4');
    expect(new Uint8Array(await back.arrayBuffer())).toEqual(bytes);
  });
});

describe('backup', () => {
  it('captures every profile, its logs, and every clip', async () => {
    const b = await createBackup(await seeded());
    expect(b.app).toBe('tapwords');
    expect(b.version).toBe(1);
    expect(b.profiles.map((p) => p.profile.name).sort()).toEqual(['Ava', 'Sam']);
    expect(b.profiles.find((p) => p.profile.id === 'p1')?.logs.map((l) => l.sessionNumber)).toEqual([1, 2]);
    expect(b.clips.map((c) => c.cardId)).toEqual(['m']);
  });

  it('serialises to JSON text and parses back', async () => {
    const b = await createBackup(await seeded());
    const text = JSON.stringify(b);
    expect(parseBackup(text)).toEqual(b);
  });

  it('rejects text that is not a backup', () => {
    expect(() => parseBackup('not json')).toThrow(/not a Tapwords backup/);
    expect(() => parseBackup(JSON.stringify({ app: 'other' }))).toThrow(/not a Tapwords backup/);
    expect(() => parseBackup(JSON.stringify({ app: 'tapwords', version: 1, profiles: 'nope', clips: [] }))).toThrow(/not a Tapwords backup/);
  });

  it('replace mode ends with only the backup\'s profiles and clips', async () => {
    const b = await createBackup(await seeded());
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    await target.saveClip('z', new Blob(['z'], { type: 'audio/webm' }));
    const n = await restoreBackup(target, b, 'replace');
    expect(n).toBe(2);
    expect((await target.listProfiles()).map((p) => p.id).sort()).toEqual(['p1', 'p2']);
    expect((await target.listLogs('p1')).length).toBe(2);
    expect(await target.listClipIds()).toEqual(['m']);
    expect((await target.getClip('m'))?.size).toBe(4);
  });

  it('merge mode keeps other profiles and overwrites matching ids', async () => {
    const b = await createBackup(await seeded());
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    await target.saveProfile({ ...profile('p1', 'Sam on this device'), state: initialState('1.1') });
    await target.appendLog('p1', log(7));
    await restoreBackup(target, b, 'merge');
    const ids = (await target.listProfiles()).map((p) => p.id).sort();
    expect(ids).toEqual(['p1', 'p2', 'p9']);
    expect((await target.listProfiles()).find((p) => p.id === 'p1')?.name).toBe('Sam');
    expect((await target.listLogs('p1')).map((l) => l.sessionNumber)).toEqual([1, 2]);
  });

  it('leaves the device untouched when a replace restore fails part way', async () => {
    const b = await createBackup(await seeded());
    const target = new MemoryStore();
    await target.saveProfile(profile('p9', 'Old'));
    await target.saveProfile(profile('p8', 'Older'));
    await target.appendLog('p9', log(3));
    await target.saveClip('z', new Blob(['z'], { type: 'audio/webm' }));

    let saves = 0;
    const failing: Store = {
      ...target,
      listProfiles: () => target.listProfiles(),
      saveProfile: async (p) => {
        saves++;
        if (saves === 3) throw new Error('disk full');
        await target.saveProfile(p);
      },
      deleteProfile: (id) => target.deleteProfile(id),
      listLogs: (id) => target.listLogs(id),
      appendLog: (id, l) => target.appendLog(id, l),
      getClip: (id) => target.getClip(id),
      saveClip: (id, blob) => target.saveClip(id, blob),
      deleteClip: (id) => target.deleteClip(id),
      listClipIds: () => target.listClipIds(),
      setLogs: (id, logs) => target.setLogs(id, logs),
      clearAll: () => target.clearAll(),
    };
    // Three profiles in the backup means the third saveProfile throws mid-restore.
    const big = { ...b, profiles: [...b.profiles, { profile: profile('p3', 'Third'), logs: [] }] };

    await expect(restoreBackup(failing, big, 'replace')).rejects.toThrow('disk full');
    const ids = (await target.listProfiles()).map((p) => p.id).sort();
    expect(ids).toEqual(['p1', 'p2', 'p8', 'p9']);
    expect((await target.listLogs('p9')).length).toBe(1);
    expect(await target.listClipIds()).toEqual(['z']);
  });

  it('names the file by date', () => {
    expect(backupFileName(new Date('2026-09-13T15:00:00Z'))).toMatch(/^tapwords-backup-2026-09-1[34]\.json$/);
  });
});
