import type { ProfileState, SessionLog } from '../engine/types';

export interface Profile {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  state: ProfileState;
}

export interface Store {
  listProfiles(): Promise<Profile[]>;
  saveProfile(p: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  listLogs(profileId: string): Promise<SessionLog[]>;
  appendLog(profileId: string, log: SessionLog): Promise<void>;
  getClip(cardId: string): Promise<Blob | undefined>;
  saveClip(cardId: string, blob: Blob): Promise<void>;
  /** Remove one recorded clip, leaving everything else alone. */
  deleteClip(cardId: string): Promise<void>;
  listClipIds(): Promise<string[]>;
  /** Replace every log for a profile (used by restore). */
  setLogs(profileId: string, logs: SessionLog[]): Promise<void>;
  /** Remove every profile, log and clip on this device. */
  clearAll(): Promise<void>;
}

export class CorruptDataError extends Error {
  constructor() {
    super('The saved data on this device is damaged.');
    this.name = 'CorruptDataError';
  }
}
