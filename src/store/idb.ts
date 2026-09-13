import { createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

const PROFILES = 'profiles';
const logsKey = (id: string) => `logs:${id}`;
const clipKey = (id: string) => `clip:${id}`;

export class IdbStore implements Store {
  private db: UseStore;
  constructor(dbName = 'tapwords') {
    this.db = createStore(dbName, 'kv');
  }
  async listProfiles() { return ((await get<Profile[]>(PROFILES, this.db)) ?? []); }
  async saveProfile(p: Profile) {
    const all = await this.listProfiles();
    const i = all.findIndex((x) => x.id === p.id);
    if (i >= 0) all[i] = p; else all.push(p);
    await set(PROFILES, all, this.db);
  }
  async deleteProfile(id: string) {
    await set(PROFILES, (await this.listProfiles()).filter((p) => p.id !== id), this.db);
    await del(logsKey(id), this.db);
  }
  async listLogs(profileId: string) {
    return ((await get<SessionLog[]>(logsKey(profileId), this.db)) ?? []).sort((a, b) => a.sessionNumber - b.sessionNumber);
  }
  async appendLog(profileId: string, log: SessionLog) {
    await set(logsKey(profileId), [...(await this.listLogs(profileId)), log], this.db);
  }
  async getClip(cardId: string) { return get<Blob>(clipKey(cardId), this.db); }
  async saveClip(cardId: string, blob: Blob) { await set(clipKey(cardId), blob, this.db); }
  async listClipIds() {
    return (await keys<string>(this.db)).filter((k) => k.startsWith('clip:')).map((k) => k.slice(5));
  }
}
