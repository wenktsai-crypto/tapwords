import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CONTENT } from '../../src/content';
import { MemoryStore } from '../../src/store/memory';
import { FakeAudio } from '../../src/audio/fake';
import { seeded } from '../../src/engine/rng';
import { ServicesContext, type Services } from '../../src/ui/services';
import { SpeechProvider } from '../../src/ui/speech';

export function makeServices(over: Partial<Services> = {}): Services {
  return {
    content: CONTENT,
    store: new MemoryStore(),
    audio: new FakeAudio(),
    rng: seeded(1),
    timing: { demoDelayMs: 0, previewMs: 0, pauseMs: 0 },
    ...over,
  };
}

export function renderWithServices(ui: ReactElement, over: Partial<Services> = {}): RenderResult & { services: Services } {
  const services = makeServices(over);
  const utils = render(
    <ServicesContext.Provider value={services}>
      <SpeechProvider>{ui}</SpeechProvider>
    </ServicesContext.Provider>,
  );
  return { ...utils, services };
}
