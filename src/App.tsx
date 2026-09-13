import { useState } from 'react';
import type { Profile } from './store/types';
import { Home } from './ui/screens/Home';
import { SessionRunner } from './ui/session/SessionRunner';
import { SpeechProvider } from './ui/speech';

type Screen = { name: 'home' } | { name: 'session'; profile: Profile } | { name: 'parent'; profile: Profile };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const home = () => setScreen({ name: 'home' });
  return (
    <SpeechProvider>
      {screen.name === 'home' && <Home onStart={(profile) => setScreen({ name: 'session', profile })} onParent={(profile) => setScreen({ name: 'parent', profile })} />}
      {screen.name === 'session' && <SessionRunner profile={screen.profile} onExit={home} />}
      {screen.name === 'parent' && <div className="screen"><p>Grown-up area coming soon.</p><button className="big big-quiet" onClick={home}>Back</button></div>}
    </SpeechProvider>
  );
}
