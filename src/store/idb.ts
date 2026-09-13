import { clear, createStore, del, get, keys, set, type UseStore } from 'idb-keyval';
import type { SessionLog } from '../engine/types';
import { CorruptDataError, type Profile, type Store } from './types';

const PROFILES = 'profiles';
const logsKey = (id: string) => `logs:${id}`;
const clipKey = (id: string) => `clip:${id}`;

export class IdbStore implements Store {
  private db: UseStore;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(dbName = 'tapwords') {
    this.db = createStore(dbName, 'kv');
  }
  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }
  async listProfiles() {
    const raw = await get<unknown>(PROFILES, this.db);
    if (raw === undefined) return [];
    const ok = Array.isArray(raw) && raw.every((p) => typeof p === 'object' && p !== null && typeof (p as Profile).id === 'string' && typeof (p as Profile).name === 'string' && typeof (p as Profile).state?.currentSubstep === 'string');
    if (!ok) throw new CorruptDataError();
    return raw as Profile[];
  }
  async saveProfile(p: Profile) {
    return this.serial(async () => {
      const all = await this.listProfiles();
      const i = all.findIndex((x) => x.id === p.id);
      if (i >= 0) all[i] = p; else all.push(p);
      await set(PROFILES, all, this.db);
    });
  }
  async deleteProfile(id: string) {
    return this.serial(async () => {
      await set(PROFILES, (await this.listProfiles()).filter((p) => p.id !== id), this.db);
      await del(logsKey(id), this.db);
    });
  }
  async listLogs(profileId: string) {
    return ((await get<SessionLog[]>(logsKey(profileId), this.db)) ?? []).sort((a, b) => a.sessionNumber - b.sessionNumber);
  }
  async appendLog(profileId: string, log: SessionLog) {
    return this.serial(async () => {
      await set(logsKey(profileId), [...(await this.listLogs(profileId)), log], this.db);
    });
  }
  async getClip(cardId: string) { return get<Blob>(clipKey(cardId), this.db); }
  async saveClip(cardId: string, blob: Blob) { await set(clipKey(cardId), blob, this.db); }
  async deleteClip(cardId: string) { await del(clipKey(cardId), this.db); }
  async listClipIds() {
    return (await keys<string>(this.db)).filter((k) => k.startsWith('clip:')).map((k) => k.slice(5));
  }
  async setLogs(profileId: string, logs: SessionLog[]) {
    return this.serial(async () => {
      await set(logsKey(profileId), [...logs], this.db);
    });
  }
  async clearAll() {
    return this.serial(async () => {
      await clear(this.db);
    });
  }
}
