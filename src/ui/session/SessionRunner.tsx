import { useEffect, useMemo, useRef, useState } from 'react';
import type { Profile } from '../../store/types';
import type { ScoredResponse, SessionLog } from '../../engine/types';
import { buildSession } from '../../engine/session';
import { finishSession, type FinishResult } from '../../engine/progression';
import { getSubstep } from '../../engine/availability';
import { useServices } from '../services';
import { BigButton } from '../components/BigButton';
import { SoundCardsPart } from './SoundCardsPart';
import { LessonPart } from './LessonPart';
import { WordWorkPart } from './WordWorkPart';
import { SpellingPart } from './SpellingPart';
import { ReadAloudPart } from './ReadAloudPart';
import { StoryPart } from './StoryPart';
import { SessionEnd } from './SessionEnd';

type PartName = 'sound' | 'lesson' | 'wordWork' | 'spelling' | 'readAloud' | 'story';

interface Props {
  profile: Profile;
  onExit: () => void;
}

export function SessionRunner({ profile, onExit }: Props) {
  const { content, store, rng, audio } = useServices();
  const plan = useMemo(() => buildSession(content, profile.state, rng), [content, profile.state, rng]);
  const order: PartName[] = plan.readAloudFirst
    ? ['readAloud', 'sound', 'lesson', 'wordWork', 'spelling', 'story']
    : ['sound', 'lesson', 'wordWork', 'spelling', 'readAloud', 'story'];
  const [partIndex, setPartIndex] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [readAloudDone, setReadAloudDone] = useState(false);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [finishing, setFinishing] = useState(false);
  // Belt-and-suspenders alongside the `finishing`/`result` state: state
  // updates are asynchronous, so two synchronous calls to finalize (e.g. a
  // rapid double-click on "Stop for now", or a part's onComplete firing
  // twice) could both read `finishing` as false before either commits.
  // The ref is set synchronously, so the second call is always rejected.
  const finishingRef = useRef(false);
  // Same reasoning for partDone: guards against a part's onComplete being
  // invoked twice synchronously for the same part before partIndex actually
  // changes. Only reset once the new part has actually committed (via the
  // effect below), not immediately inside partDone itself, otherwise a
  // second synchronous call in the same tick would slip through.
  const partDoneRef = useRef(false);
  useEffect(() => {
    partDoneRef.current = false;
  }, [partIndex]);

  const finalize = async (complete: boolean, rs: ScoredResponse[], raDone: boolean) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    audio.stop();
    const log: SessionLog = { sessionNumber: plan.sessionNumber, date: new Date().toISOString(), substep: plan.substep, complete, readAloudDone: raDone, responses: rs };
    const previous = await store.listLogs(profile.id);
    const out = finishSession(profile.state, log, previous, content);
    await store.appendLog(profile.id, log);
    await store.saveProfile({ ...profile, state: out.state });
    setResult(out);
  };

  const partDone = (rs: ScoredResponse[], raDone = readAloudDone) => {
    if (partDoneRef.current || finishingRef.current) return;
    partDoneRef.current = true;
    const all = [...responses, ...rs];
    setResponses(all);
    setReadAloudDone(raDone);
    if (partIndex + 1 < order.length) setPartIndex(partIndex + 1);
    else finalize(true, all, raDone);
  };

  if (result) return <SessionEnd plan={plan} result={result} onDone={onExit} />;

  const part = order[partIndex];
  const substep = getSubstep(content, plan.substep);
  return (
    <div className="screen">
      <div className="topbar">
        <span>{profile.name}</span>
        <BigButton variant="quiet" onClick={() => finalize(false, responses, readAloudDone)} disabled={finishing}>Stop for now</BigButton>
      </div>
      {part === 'sound' && <SoundCardsPart key="sound" forwardCards={plan.forwardCards} reverseItems={plan.reverseItems} onComplete={(rs) => partDone(rs)} />}
      {part === 'lesson' && <LessonPart key="lesson" steps={plan.lesson} substep={substep} onComplete={() => partDone([])} />}
      {part === 'wordWork' && <WordWorkPart key="wordWork" items={plan.wordWork} onComplete={(rs) => partDone(rs)} />}
      {part === 'spelling' && <SpellingPart key="spelling" items={plan.spelling} onComplete={(rs) => partDone(rs)} />}
      {part === 'readAloud' && <ReadAloudPart key="readAloud" words={plan.readAloud.words} sentences={plan.readAloud.sentences} substep={plan.substep} onComplete={(rs, done) => partDone(rs, done)} />}
      {part === 'story' && <StoryPart key="story" story={plan.story} substep={plan.substep} onComplete={(rs) => partDone(rs)} />}
    </div>
  );
}
