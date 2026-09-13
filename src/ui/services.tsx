import { createContext, useContext } from 'react';
import type { Content } from '../content/types';
import type { Store } from '../store/types';
import type { AudioPlayer } from '../audio/types';
import type { Rng } from '../engine/rng';

export interface Timing {
  demoDelayMs: number;   // pause between taps in a demonstration
  previewMs: number;     // how long a word is shown before "build it" hides it
  pauseMs: number;       // short pause after a correct answer
}
export const DEFAULT_TIMING: Timing = { demoDelayMs: 350, previewMs: 1500, pauseMs: 800 };

export interface Services {
  content: Content;
  store: Store;
  audio: AudioPlayer;
  rng: Rng;
  timing: Timing;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const s = useContext(ServicesContext);
  if (!s) throw new Error('ServicesContext is missing');
  return s;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
