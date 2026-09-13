import { useEffect, useRef, useState } from 'react';
import type { SessionPlan } from '../../engine/session';
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

/** Plain-English label for a completed part, for the end-of-session recap. `readAloud` is only
 * listed when a grown-up actually marked it (a declined read-aloud still completes the part but
 * should not be reported as something that happened). */
function labelFor(part: PartName, plan: SessionPlan, readAloudDone: boolean): string | null {
  switch (part) {
    case 'sound': return 'sound cards';
    case 'lesson': return plan.lessonMode === 'full' ? 'a new lesson' : 'a quick review';
    case 'wordWork': return 'word work';
    case 'spelling': return 'spelling';
    case 'readAloud': return readAloudDone ? 'reading out loud' : null;
    case 'story': return 'a story';
    default: return null;
  }
}

interface Props {
  profile: Profile;
  onExit: () => void;
}

export function SessionRunner({ profile, onExit }: Props) {
  const { content, store, rng, audio } = useServices();
  // A lazy useState initializer (not useMemo) so the plan is built exactly
  // once for the life of this component and can never be silently recomputed
  // mid-session (useMemo only caches "usually", not "always").
  const [plan] = useState(() => buildSession(content, profile.state, rng));
  const order: PartName[] = plan.readAloudFirst
    ? ['readAloud', 'sound', 'lesson', 'wordWork', 'spelling', 'story']
    : ['sound', 'lesson', 'wordWork', 'spelling', 'readAloud', 'story'];
  const [partIndex, setPartIndex] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [readAloudDone, setReadAloudDone] = useState(false);
  const [completedParts, setCompletedParts] = useState<PartName[]>([]);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Belt-and-suspenders alongside the `finishing`/`result` state: state
  // updates are asynchronous, so two synchronous calls to finalize (e.g. a
  // rapid double-click on "Stop for now", or a part's onComplete firing
  // twice) could both read `finishing` as false before either commits.
  // The ref is set synchronously, so the second call is always rejected.
  // Reset explicitly on a failed save so a retry is allowed through.
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

  // The log built for this session's finalize attempt, and the FinishResult
  // computed from it — cached so a retry after a failed save reuses the same
  // log (same date, same responses) instead of building a fresh one, and
  // reuses the already-computed state transition instead of recomputing it
  // against a `previous` logs list that may now include the just-appended log.
  const logRef = useRef<SessionLog | null>(null);
  const outRef = useRef<FinishResult | null>(null);
  // True once `store.appendLog` has actually succeeded for this session, so a
  // retry that only needs to redo `store.saveProfile` never appends twice.
  const logSavedRef = useRef(false);
  // The arguments of the most recent finalize attempt, so "Try again" can
  // call finalize again exactly as it was first invoked.
  const retryArgsRef = useRef<{ complete: boolean; rs: ScoredResponse[]; raDone: boolean } | null>(null);

  const finalize = async (complete: boolean, rs: ScoredResponse[], raDone: boolean) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    retryArgsRef.current = { complete, rs, raDone };
    setSaveError(false);
    setFinishing(true);
    audio.stop();
    if (!logRef.current) {
      logRef.current = { sessionNumber: plan.sessionNumber, date: new Date().toISOString(), substep: plan.substep, complete, readAloudDone: raDone, responses: rs };
    }
    const log = logRef.current;
    try {
      if (!logSavedRef.current) {
        const previous = await store.listLogs(profile.id);
        outRef.current = finishSession(profile.state, log, previous, content);
        await store.appendLog(profile.id, log);
        logSavedRef.current = true;
      }
      await store.saveProfile({ ...profile, state: outRef.current!.state });
      setResult(outRef.current);
    } catch {
      // Release the guards so "Try again" can call finalize again; logSavedRef
      // is left untouched so a retry does not re-append a log that already saved.
      finishingRef.current = false;
      setFinishing(false);
      setSaveError(true);
    }
  };

  const retry = () => {
    const args = retryArgsRef.current;
    if (!args) return;
    finalize(args.complete, args.rs, args.raDone);
  };

  const partDone = (rs: ScoredResponse[], raDone = readAloudDone) => {
    if (partDoneRef.current || finishingRef.current) return;
    partDoneRef.current = true;
    const part = order[partIndex];
    const all = [...responses, ...rs];
    setResponses(all);
    setReadAloudDone(raDone);
    setCompletedParts((c) => [...c, part]);
    if (partIndex + 1 < order.length) setPartIndex(partIndex + 1);
    else finalize(true, all, raDone);
  };

  if (result) {
    const practiced = completedParts
      .map((p) => labelFor(p, plan, readAloudDone))
      .filter((l): l is string => l !== null);
    return <SessionEnd plan={plan} result={result} practiced={practiced} onDone={onExit} />;
  }

  if (saveError) {
    return (
      <div className="screen">
        <div className="stage">
          <p className="caption">We couldn't save that. Tap to try again.</p>
          <div className="row">
            <BigButton onClick={retry}>Try again</BigButton>
            <BigButton variant="quiet" onClick={onExit}>Back to start</BigButton>
          </div>
        </div>
      </div>
    );
  }

  const part = order[partIndex];
  const substep = getSubstep(content, plan.substep);
  return (
    <div className="screen">
      <div className="topbar">
        <span>{profile.name}</span>
        <BigButton variant="quiet" onClick={() => finalize(false, responses, readAloudDone)} disabled={finishing}>Stop for now</BigButton>
      </div>
      {finishing ? (
        <p className="caption">Saving…</p>
      ) : (
        <>
          {part === 'sound' && <SoundCardsPart key="sound" forwardCards={plan.forwardCards} reverseItems={plan.reverseItems} onComplete={(rs) => partDone(rs)} />}
          {part === 'lesson' && <LessonPart key="lesson" steps={plan.lesson} substep={substep} onComplete={() => partDone([])} />}
          {part === 'wordWork' && <WordWorkPart key="wordWork" items={plan.wordWork} onComplete={(rs) => partDone(rs)} />}
          {part === 'spelling' && <SpellingPart key="spelling" items={plan.spelling} onComplete={(rs) => partDone(rs)} />}
          {part === 'readAloud' && <ReadAloudPart key="readAloud" words={plan.readAloud.words} sentences={plan.readAloud.sentences} substep={plan.substep} onComplete={(rs, done) => partDone(rs, done)} />}
          {part === 'story' && <StoryPart key="story" story={plan.story} substep={plan.substep} onComplete={(rs) => partDone(rs)} />}
        </>
      )}
    </div>
  );
}
