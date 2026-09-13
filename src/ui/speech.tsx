import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useServices } from './services';

interface Speech {
  say: (text: string) => Promise<void>;
  caption: string;
}
const SpeechContext = createContext<Speech | null>(null);

export function SpeechProvider({ children }: { children: ReactNode }) {
  const { audio } = useServices();
  const [caption, setCaption] = useState('');
  const say = useCallback(async (text: string) => {
    setCaption(text);
    await audio.speak(text);
  }, [audio]);
  const value = useMemo(() => ({ say, caption }), [say, caption]);
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSay() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('SpeechProvider is missing');
  return ctx.say;
}

export function Caption() {
  const ctx = useContext(SpeechContext);
  if (!ctx || !ctx.caption) return null;
  return <p className="caption" aria-live="polite">{ctx.caption}</p>;
}
