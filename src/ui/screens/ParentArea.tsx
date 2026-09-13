import { useEffect, useMemo, useRef, useState } from 'react';
import type { Profile } from '../../store/types';
import type { SessionLog } from '../../engine/types';
import { accuracy, moveTo } from '../../engine/progression';
import { getSubstep } from '../../engine/availability';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { Path } from '../components/Path';

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
  // Guards a rapid double submit of the "Move" form: two synchronous submits
  // could both read the in-flight flag as false before either commits state,
  // so the ref is checked and set synchronously before any await.
  const movingRef = useRef(false);

  useEffect(() => {
    store.listLogs(profile.id).then(setLogs);
  }, [store, profile.id]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
    const recent = logs.filter((l) => new Date(l.date).getTime() >= cutoff).length;
    const here = logs.filter((l) => l.substep === profile.state.currentSubstep && l.complete).slice(-3);
    const acc = accuracy(here.flatMap((l) => l.responses).filter((r) => !r.isReview && !r.parentMarked));
    const weakest = Object.entries(profile.state.strengths)
      .sort((a, b) => a[1].value - b[1].value)
      .slice(0, 10)
      .map(([k]) => k.split(':').slice(-1)[0]);
    const lastRA = [...logs].reverse().find((l) => l.readAloudDone);
    return { recent, acc, weakest, lastRA: lastRA ? new Date(lastRA.date).toLocaleDateString() : 'never' };
  }, [logs, profile.state]);

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

  const sub = getSubstep(content, profile.state.currentSubstep);

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
      </div>
    </div>
  );
}
