import { useEffect, useState, type FormEvent } from 'react';
import type { Profile } from '../../store/types';
import { initialState } from '../../engine/types';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { HoldButton } from '../components/HoldButton';

export const COLORS = ['sky', 'moss', 'sand', 'plum'];

const newId = () => globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface Props {
  onStart: (p: Profile) => void;
  onParent: (p: Profile) => void;
}

export function Home({ onStart, onParent }: Props) {
  const { store, content } = useServices();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [start, setStart] = useState(content.substeps[0].id);
  const [error, setError] = useState<string | null>(null);

  // Storage can be unavailable (a locked-down browser, a full disk). Say so in plain words
  // and let the grown-up try again, rather than sitting on "Loading..." for ever.
  const load = () => {
    setError(null);
    store.listProfiles().then(setProfiles, () => setError("We couldn't open the saved children. Tap to try again."));
  };
  useEffect(load, [store]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p: Profile = { id: newId(), name: name.trim(), color, createdAt: new Date().toISOString(), state: initialState(start) };
    try {
      setError(null);
      await store.saveProfile(p);
      setProfiles(await store.listProfiles());
      setName('');
      setAdding(false);
    } catch {
      setError("We couldn't save that. Try again.");
    }
  };

  const examples = (id: string) => content.substeps.find((s) => s.id === id)!.words.filter((w) => w.kind === 'real').slice(0, 3).map((w) => w.text).join(', ');

  return (
    <div className="screen">
      <div className="stage">
        <h1>Tapwords</h1>
        {error && <p className="caption">{error}</p>}
        {profiles === null && error && <BigButton variant="quiet" onClick={load}>Try again</BigButton>}
        {profiles === null && !error && <p className="caption">Loading…</p>}
        {profiles !== null && !adding && (
          <div className="profiles">
            {profiles.length === 0 && <p className="caption">Add a child to get started.</p>}
            {profiles.map((p) => (
              <div className="profile-row" key={p.id}>
                <button type="button" className={`big big-primary swatch-${p.color}`} onClick={() => onStart(p)}>
                  {p.name}
                </button>
                <HoldButton onHold={() => onParent(p)}>Grown-ups (hold)</HoldButton>
              </div>
            ))}
            <BigButton variant="quiet" onClick={() => setAdding(true)}>Add a child</BigButton>
          </div>
        )}
        {adding && (
          <form className="card" onSubmit={save}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <label>
              Color
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Start at
              <select value={start} onChange={(e) => setStart(e.target.value)}>
                {content.substeps.map((s) => (
                  <option key={s.id} value={s.id}>{s.id} {s.title} (for example: {examples(s.id)})</option>
                ))}
              </select>
            </label>
            <p className="caption">Not sure where to start? Ask the tutor, or pick the first one. You can change this later in the grown-up area.</p>
            <div className="row">
              <button type="submit" className="big big-primary" disabled={!name.trim()}>Save</button>
              <BigButton variant="quiet" onClick={() => setAdding(false)}>Cancel</BigButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
