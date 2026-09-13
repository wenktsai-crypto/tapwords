import { it, expect } from 'vitest';
import type { Store, Profile } from '../../src/store/types';
import { initialState } from '../../src/engine/types';

export function storeContract(make: () => Store) {
  const profile = (id: string, name = 'Kid'): Profile => ({ id, name, color: 'sky', createdAt: '2026-09-12T00:00:00Z', state: initialState('1.1') });

  it('saves, lists, replaces and deletes profiles', async () => {
    const s = make();
    expect(await s.listProfiles()).toEqual([]);
    await s.saveProfile(profile('p1'));
    await s.saveProfile(profile('p2', 'Other'));
    expect((await s.listProfiles()).map((p) => p.id)).toEqual(['p1', 'p2']);
    await s.saveProfile(profile('p1', 'Renamed'));
    expect((await s.listProfiles()).find((p) => p.id === 'p1')?.name).toBe('Renamed');
    await s.deleteProfile('p1');
    expect((await s.listProfiles()).map((p) => p.id)).toEqual(['p2']);
  });

  it('appends and lists logs per profile in order, and drops them with the profile', async () => {
    const s = make();
    await s.saveProfile(profile('p1'));
    const l = (n: number) => ({ sessionNumber: n, date: 'd', substep: '1.1', complete: true, readAloudDone: false, responses: [] });
    await s.appendLog('p1', l(1));
    await s.appendLog('p1', l(2));
    await s.appendLog('p2', l(1));
    expect((await s.listLogs('p1')).map((x) => x.sessionNumber)).toEqual([1, 2]);
    await s.deleteProfile('p1');
    expect(await s.listLogs('p1')).toEqual([]);
    expect((await s.listLogs('p2')).length).toBe(1);
  });

  it('stores clips by card id', async () => {
    const s = make();
    expect(await s.getClip('a')).toBeUndefined();
    await s.saveClip('a', new Blob(['x'], { type: 'audio/webm' }));
    expect((await s.getClip('a'))?.size).toBe(1);
    expect(await s.listClipIds()).toEqual(['a']);
  });
}
