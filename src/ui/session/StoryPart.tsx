import { useEffect, useRef, useState } from 'react';
import type { Story } from '../../content/types';
import { storyKey, type ScoredResponse } from '../../engine/types';
import { useServices } from '../services';
import { Caption, useSay } from '../speech';
import { BigButton } from '../components/BigButton';

interface Props {
  story: Story;
  substep: string;
  onComplete: (responses: ScoredResponse[]) => void;
}

export function StoryPart({ story, substep, onComplete }: Props) {
  const { audio } = useServices();
  const say = useSay();
  const [phase, setPhase] = useState<'title' | 'read' | 'ask'>('title');
  const [i, setI] = useState(0);
  const [responses, setResponses] = useState<ScoredResponse[]>([]);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);
  // Guards against a second click/tap resolving the same sentence or
  // question twice (e.g. a rapid double-tap) before it advances. Reset
  // whenever the phase or index changes.
  const advancedRef = useRef(false);
  // Guards a second tap on "Hear the choices" from starting a second,
  // interleaved read-through of the choices while one is already speaking.
  const hearingChoicesRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onCompleteRef.current(rs);
  };

  useEffect(() => {
    advancedRef.current = false;
    let cancelled = false;
    // Deferred to the next microtask so that under StrictMode's dev-mode
    // mount/cleanup/remount, the throwaway first pass's cleanup can mark
    // itself cancelled before it actually speaks anything.
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (phase === 'title') say(`Story time. This one is called ${story.title}. Read each line, then tap Next.`);
      if (phase === 'ask') {
        const q = story.questions[i];
        if (!q) finish(responses);
        else say(q.prompt);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const nextSentence = () => {
    if (finishedRef.current || advancedRef.current) return;
    advancedRef.current = true;
    if (i + 1 < story.sentences.length) setI(i + 1);
    else {
      setPhase('ask');
      setI(0);
    }
  };

  const q = story.questions[i];
  const answer = async (k: number) => {
    if (!q || answered !== null || finishedRef.current || advancedRef.current) return;
    // Set for both branches (not just the correct one) so a second
    // synchronous tap on a choice — right or wrong — cannot push a second
    // response before `answered` state has actually committed. Released by
    // nextQuestion once the question's outcome has been committed.
    advancedRef.current = true;
    const correct = k === q.answer;
    const rs = [...responses, { itemKey: storyKey(substep, story.title, i), activity: 'story-question' as const, correct, isReview: false, parentMarked: false }];
    setResponses(rs);
    if (correct) return nextQuestion(rs);
    setAnswered(k);
    await say(`The answer is: ${q.choices[q.answer]}.`);
  };

  const nextQuestion = (rs: ScoredResponse[]) => {
    if (finishedRef.current) return;
    // Release the guard `answer` set (for the immediate correct-answer path,
    // this simply hands straight back off to the next question's own guard;
    // for the wrong-answer path this is what lets the "Next" button work).
    advancedRef.current = false;
    setAnswered(null);
    if (i + 1 < story.questions.length) setI(i + 1);
    else finish(rs);
  };

  if (finished) return null;

  if (phase === 'title') {
    return (
      <div className="stage" data-part="story-title">
        <Caption />
        <h2 className="bigtext">{story.title}</h2>
        <BigButton onClick={() => setPhase('read')}>Start</BigButton>
      </div>
    );
  }

  if (phase === 'read') {
    return (
      <div className="stage" data-part="story">
        <p className="bigtext">{story.sentences[i]}</p>
        <div className="row">
          <BigButton variant="quiet" onClick={() => audio.speak(story.sentences[i])}>Hear it</BigButton>
          <BigButton onClick={nextSentence}>Next</BigButton>
        </div>
        <p className="caption">{i + 1} of {story.sentences.length}</p>
      </div>
    );
  }

  if (!q) return null;
  return (
    <div className="stage" data-part="story-question">
      <Caption />
      <div className="row">
        {q.choices.map((c, k) => <BigButton key={k} variant={answered !== null && k === q.answer ? 'primary' : 'quiet'} onClick={() => answer(k)}>{c}</BigButton>)}
      </div>
      <div className="row">
        <BigButton
          variant="quiet"
          onClick={async () => {
            if (hearingChoicesRef.current) return;
            hearingChoicesRef.current = true;
            try {
              for (const c of q.choices) await audio.speak(c);
            } finally {
              hearingChoicesRef.current = false;
            }
          }}
        >
          Hear the choices
        </BigButton>
        {answered !== null && <BigButton onClick={() => nextQuestion(responses)}>Next</BigButton>}
      </div>
    </div>
  );
}
