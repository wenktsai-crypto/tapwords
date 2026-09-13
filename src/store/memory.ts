import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

export class MemoryStore implements Store {
  private profiles = new Map<string, Profile>();
  private logs = new Map<string, SessionLog[]>();
  private clips = new Map<string, Blob>();

  async listProfiles() { return [...this.profiles.values()].map((p) => structuredClone(p)); }
  async saveProfile(p: Profile) { this.profiles.set(p.id, structuredClone(p)); }
  async deleteProfile(id: string) { this.profiles.delete(id); this.logs.delete(id); }
  async listLogs(profileId: string) { return [...(this.logs.get(profileId) ?? [])].sort((a, b) => a.sessionNumber - b.sessionNumber).map((l) => structuredClone(l)); }
  async appendLog(profileId: string, log: SessionLog) { this.logs.set(profileId, [...(this.logs.get(profileId) ?? []), structuredClone(log)]); }
  async getClip(cardId: string) { return this.clips.get(cardId); }
  async saveClip(cardId: string, blob: Blob) { this.clips.set(cardId, blob); }
  async deleteClip(cardId: string) { this.clips.delete(cardId); }
  async listClipIds() { return [...this.clips.keys()]; }
  async setLogs(profileId: string, logs: SessionLog[]) { this.logs.set(profileId, logs.map((l) => structuredClone(l))); }
  async clearAll() { this.profiles.clear(); this.logs.clear(); this.clips.clear(); }
}
