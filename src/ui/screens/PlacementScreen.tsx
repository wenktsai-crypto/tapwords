import { useMemo, useState } from 'react';
import { placementLists, suggestPlacement, type PlacementResult } from '../../engine/progression';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';

interface Props {
  onDone: (substepId: string) => void;
  onCancel: () => void;
}

type Phase = { name: 'intro' } | { name: 'list'; list: number; word: number; correct: number } | { name: 'result'; suggestion: string };

/** A parent sits with the child; words appear one at a time; the parent marks each. The check stops at
 * the first list under 75% and suggests the last list that passed (spec 5.1). */
export function PlacementScreen({ onDone, onCancel }: Props) {
  const { content, rng } = useServices();
  const lists = useMemo(() => placementLists(content, rng), [content, rng]);
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const [results, setResults] = useState<PlacementResult[]>([]);
  const [choice, setChoice] = useState('');

  const finish = (all: PlacementResult[]) => {
    const suggestion = suggestPlacement(all);
    setChoice(suggestion);
    setPhase({ name: 'result', suggestion });
  };

  const mark = (correct: boolean) => {
    if (phase.name !== 'list') return;
    const list = lists[phase.list];
    const total = list.words.length;
    const c = phase.correct + (correct ? 1 : 0);
    if (phase.word + 1 < total) {
      setPhase({ ...phase, word: phase.word + 1, correct: c });
      return;
    }
    const all = [...results, { substep: list.substep, correct: c, total }];
    setResults(all);
    const passed = c / total >= 0.75;
    if (passed && phase.list + 1 < lists.length) setPhase({ name: 'list', list: phase.list + 1, word: 0, correct: 0 });
    else finish(all);
  };

  if (phase.name === 'intro') {
    return (
      <div className="stage" data-testid="part" data-part="placement-intro">
        <h2>Find the starting point</h2>
        <p className="caption">Sit with your child. Words appear one at a time. Ask them to read each word out loud, then tap "Got it" or "Missed it". The check stops on its own when the words get too hard. It takes about five minutes.</p>
        <div className="row">
          <BigButton onClick={() => (lists.length ? setPhase({ name: 'list', list: 0, word: 0, correct: 0 }) : finish([]))}>Begin</BigButton>
          <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
        </div>
      </div>
    );
  }

  if (phase.name === 'list') {
    const list = lists[phase.list];
    const word = list.words[phase.word];
    return (
      <div className="stage" data-testid="part" data-part="placement" data-list={list.substep}>
        <p className="caption">List {phase.list + 1} of {lists.length}: word {phase.word + 1} of {list.words.length}</p>
        <p className="bigword">{word.text}</p>
        {word.kind === 'nonsense' && <p className="caption">(a made-up word)</p>}
        <div className="row">
          <BigButton onClick={() => mark(true)}>Got it</BigButton>
          <BigButton variant="quiet" onClick={() => mark(false)}>Missed it</BigButton>
        </div>
        <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
      </div>
    );
  }

  const sub = content.substeps.find((s) => s.id === phase.suggestion);
  return (
    <div className="stage" data-testid="part" data-part="placement-result">
      <h2>We suggest starting at {phase.suggestion}</h2>
      <p className="caption">{sub?.title}. {sub?.parentSummary}</p>
      <ul className="caption">
        {results.map((r) => <li key={r.substep}>{r.substep}: {r.correct} of {r.total}</li>)}
      </ul>
      <form className="card" onSubmit={(e) => { e.preventDefault(); onDone(choice); }}>
        <label>
          Start at
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            {content.substeps.map((s) => <option key={s.id} value={s.id}>{s.id} {s.title}</option>)}
          </select>
        </label>
        <div className="row">
          <button type="submit" className="big big-primary">Use this</button>
          <BigButton variant="quiet" onClick={onCancel}>Cancel</BigButton>
        </div>
      </form>
    </div>
  );
}
