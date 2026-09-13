import { useEffect, useMemo, useRef, useState } from 'react';
import type { Profile } from '../../store/types';
import type { SessionLog } from '../../engine/types';
import { accuracy, moveTo } from '../../engine/progression';
import { getSubstep } from '../../engine/availability';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { Path } from '../components/Path';
import { PlacementScreen } from './PlacementScreen';
import { RecordScreen } from './RecordScreen';
import { BackupPanel } from './BackupPanel';

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function ParentArea({ profile: initial, onBack }: Props) {
  const { store, content } = useServices();
  const [profile, setProfile] = useState(initial);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [target, setTarget] = useState(initial.state.currentSubstep);
  const [note, setNote] = useState('');
  const [view, setView] = useState<'main' | 'placement' | 'record'>('main');
  // Guards a rapid double submit of the "Move" form: two synchronous submits
  // could both read the in-flight flag as false before either commits state,
  // so the ref is checked and set synchronously before any await.
  const movingRef = useRef(false);

  useEffect(() => {
    store.listLogs(profile.id).then(setLogs, () => setNote("We couldn't load progress."));
  }, [store, profile.id]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
    const recent = logs.filter((l) => new Date(l.date).getTime() >= cutoff).length;
    const here = logs
      .filter((l) => l.substep === profile.state.currentSubstep && l.complete && l.sessionNumber > profile.state.substepEnteredAt)
      .slice(-3);
    const acc = accuracy(here.flatMap((l) => l.responses).filter((r) => !r.isReview && !r.parentMarked));
    // Only the things a grown-up can actually practise: a sound card, shown as its letters,
    // and a word, shown as the word. Sentence and story keys are skipped.
    const weakest = Object.entries(profile.state.strengths)
      .sort((a, b) => a[1].value - b[1].value)
      .flatMap(([k]) => {
        if (k.startsWith('card:')) {
          const card = content.cards.find((c) => c.id === k.slice('card:'.length));
          return card ? [card.grapheme] : [];
        }
        if (k.startsWith('word:')) return [k.split(':').slice(2).join(':')];
        return [];
      })
      .slice(0, 10);
    const lastRA = [...logs].reverse().find((l) => l.readAloudDone);
    return { recent, acc, weakest, lastRA: lastRA ? new Date(lastRA.date).toLocaleDateString() : 'never' };
  }, [logs, profile.state, content.cards]);

  const move = async () => {
    if (movingRef.current) return;
    movingRef.current = true;
    try {
      const next = { ...profile, state: moveTo(profile.state, target) };
      await store.saveProfile(next);
      setProfile(next);
      setNote(`Moved to ${target}. The next session starts with its lesson.`);
    } catch {
      setNote("We couldn't save that. Try again.");
    } finally {
      movingRef.current = false;
    }
  };

  const placed = async (substepId: string) => {
    try {
      const next = { ...profile, state: moveTo(profile.state, substepId) };
      await store.saveProfile(next);
      setProfile(next);
      setTarget(substepId);
      setNote(`Moved to ${substepId} after the placement check. The next session starts with its lesson.`);
    } catch {
      setNote("We couldn't save that. Try again.");
    }
    setView('main');
  };

  const sub = getSubstep(content, profile.state.currentSubstep);

  if (view === 'placement') {
    return (
      <div className="screen">
        <div className="topbar"><span>Grown-up area: {profile.name}</span></div>
        <PlacementScreen onDone={placed} onCancel={() => setView('main')} />
      </div>
    );
  }

  if (view === 'record') {
    return <RecordScreen onBack={() => setView('main')} />;
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span>Grown-up area: {profile.name}</span>
        <BigButton variant="quiet" onClick={onBack}>Back</BigButton>
      </div>
      <div className="stage">
        <Path current={profile.state.currentSubstep} />
        <p className="caption">{sub.parentSummary}</p>
        <dl className="stats">
          <div><dt>Sessions in the last 14 days</dt><dd>{stats.recent}</dd></div>
          <div><dt>Accuracy on current work (last 3 sessions)</dt><dd>{stats.acc === null ? 'no data yet' : `${Math.round(stats.acc * 100)}%`}</dd></div>
          <div><dt>Last read-aloud with a grown-up</dt><dd>{stats.lastRA}</dd></div>
          <div><dt>Needs the most practice</dt><dd>{stats.weakest.length ? stats.weakest.join(', ') : 'nothing yet'}</dd></div>
        </dl>
        <form className="card" onSubmit={(e) => { e.preventDefault(); move(); }}>
          <label>
            Move to
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {content.substeps.map((s) => <option key={s.id} value={s.id}>{s.id} {s.title}</option>)}
            </select>
          </label>
          <button type="submit" className="big big-primary">Move</button>
          {note && <p className="caption">{note}</p>}
        </form>
        <div className="card">
          <h2>Tools</h2>
          <div className="row">
            <BigButton variant="quiet" onClick={() => setView('placement')}>Run the placement check</BigButton>
            <BigButton variant="quiet" onClick={() => setView('record')}>Record sounds</BigButton>
          </div>
        </div>
        <BackupPanel onRestored={onBack} />
      </div>
    </div>
  );
}
