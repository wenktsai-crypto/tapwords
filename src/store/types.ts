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
  listClipIds(): Promise<string[]>;
}
