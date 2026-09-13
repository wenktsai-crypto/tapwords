import type { SessionLog } from '../engine/types';
import type { Profile, Store } from './types';

export interface BackupFile {
  app: 'tapwords';
  version: 1;
  createdAt: string;
  profiles: { profile: Profile; logs: SessionLog[] }[];
  clips: { cardId: string; type: string; base64: string }[];
}

export const NOT_A_BACKUP = 'This file is not a Tapwords backup.';

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export function backupFileName(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `tapwords-backup-${y}-${m}-${d}.json`;
}

export async function createBackup(store: Store): Promise<BackupFile> {
  const profiles = await store.listProfiles();
  const withLogs = await Promise.all(profiles.map(async (profile) => ({ profile, logs: await store.listLogs(profile.id) })));
  const clipIds = await store.listClipIds();
  const clips: BackupFile['clips'] = [];
  for (const cardId of clipIds) {
    const blob = await store.getClip(cardId);
    if (blob) clips.push({ cardId, type: blob.type || 'audio/mp4', base64: await blobToBase64(blob) });
  }
  return { app: 'tapwords', version: 1, createdAt: new Date().toISOString(), profiles: withLogs, clips };
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

function isProfile(x: unknown): x is Profile {
  return isRecord(x) && typeof x.id === 'string' && typeof x.name === 'string' && isRecord(x.state) && typeof x.state.currentSubstep === 'string';
}

export function parseBackup(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(NOT_A_BACKUP);
  }
  if (!isRecord(raw) || raw.app !== 'tapwords' || raw.version !== 1 || !Array.isArray(raw.profiles) || !Array.isArray(raw.clips)) throw new Error(NOT_A_BACKUP);
  for (const entry of raw.profiles) {
    if (!isRecord(entry) || !isProfile(entry.profile) || !Array.isArray(entry.logs)) throw new Error(NOT_A_BACKUP);
  }
  for (const clip of raw.clips) {
    if (!isRecord(clip) || typeof clip.cardId !== 'string' || typeof clip.base64 !== 'string' || typeof clip.type !== 'string') throw new Error(NOT_A_BACKUP);
  }
  return raw as unknown as BackupFile;
}

/** Writes the backup into the store. `replace` wipes the device first; `merge` keeps profiles the
 * backup does not mention and overwrites any profile whose id it does. Returns how many profiles were written. */
export async function restoreBackup(store: Store, backup: BackupFile, mode: 'replace' | 'merge'): Promise<number> {
  if (mode === 'replace') await store.clearAll();
  for (const { profile, logs } of backup.profiles) {
    await store.saveProfile(profile);
    await store.setLogs(profile.id, logs);
  }
  for (const clip of backup.clips) await store.saveClip(clip.cardId, base64ToBlob(clip.base64, clip.type));
  return backup.profiles.length;
}
