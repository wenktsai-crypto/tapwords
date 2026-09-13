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

  useEffect(() => {
    store.listProfiles().then(setProfiles);
  }, [store]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const p: Profile = { id: newId(), name: name.trim(), color, createdAt: new Date().toISOString(), state: initialState(start) };
    await store.saveProfile(p);
    setProfiles(await store.listProfiles());
    setName('');
    setAdding(false);
  };

  const examples = (id: string) => content.substeps.find((s) => s.id === id)!.words.filter((w) => w.kind === 'real').slice(0, 3).map((w) => w.text).join(', ');

  return (
    <div className="screen">
      <div className="stage">
        <h1>Tapwords</h1>
        {profiles === null && <p className="caption">Loading…</p>}
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
              <button type="submit" className="big big-primary">Save</button>
              <BigButton variant="quiet" onClick={() => setAdding(false)}>Cancel</BigButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
