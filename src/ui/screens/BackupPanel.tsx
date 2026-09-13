import { useRef, useState, type ChangeEvent } from 'react';
import { backupFileName, createBackup, parseBackup, restoreBackup, type BackupFile } from '../../store/backup';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';

/** file.text() is not reliably implemented across browsers and test environments (jsdom's File
 * has no text() method); FileReader is the widely-supported way to read a chosen file's text. */
function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}

interface Props {
  /** Called after a successful restore so the parent screen can reload. */
  onRestored?: () => void;
  /** Hide the back-up button and only offer "replace" (used on the damaged-data screen). */
  restoreOnly?: boolean;
}

export function BackupPanel({ onRestored, restoreOnly = false }: Props) {
  const { store, saveFile } = useServices();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const backUp = async () => {
    setBusy(true);
    setNote('');
    try {
      const b = await createBackup(store);
      await saveFile(backupFileName(), JSON.stringify(b));
      setNote(`Backup saved: ${b.profiles.length} ${b.profiles.length === 1 ? 'child' : 'children'}. Keep the file somewhere safe.`);
    } catch {
      setNote("We couldn't make the backup. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const chose = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNote('');
    try {
      setPending(parseBackup(await readFileText(file)));
    } catch (err) {
      setPending(null);
      setNote((err as Error).message || 'This file could not be read.');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const restore = async (mode: 'replace' | 'merge') => {
    if (!pending) return;
    setBusy(true);
    try {
      const n = await restoreBackup(store, pending, mode);
      setNote(`Restored ${n} ${n === 1 ? 'child' : 'children'}.`);
      setPending(null);
      onRestored?.();
    } catch {
      setNote("We couldn't restore that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card backup">
      {!restoreOnly && (
        <>
          <BigButton variant="quiet" onClick={backUp} disabled={busy}>Back up everything on this device</BigButton>
          <p className="caption">Makes one file with every child's progress and the recorded sounds. Save it to Files, iCloud, or email it to yourself.</p>
        </>
      )}
      <label className="filepick">
        Restore from a backup
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={chose} disabled={busy} />
      </label>
      {pending && (
        <div className="card">
          <p className="caption">This backup holds {pending.profiles.length} {pending.profiles.length === 1 ? 'child' : 'children'} ({pending.profiles.map((p) => p.profile.name).join(', ')}), saved {new Date(pending.createdAt).toLocaleDateString()}.</p>
          <div className="row">
            <BigButton onClick={() => restore('replace')} disabled={busy}>Replace everything on this device</BigButton>
            {!restoreOnly && <BigButton variant="quiet" onClick={() => restore('merge')} disabled={busy}>Add to what is here</BigButton>}
            <BigButton variant="quiet" onClick={() => setPending(null)} disabled={busy}>Cancel</BigButton>
          </div>
        </div>
      )}
      {note && <p className="caption">{note}</p>}
    </div>
  );
}
