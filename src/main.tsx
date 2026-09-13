import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import './ui/styles.css';
import App from './App';
import { CONTENT } from './content';
import { IdbStore } from './store/idb';
import { BrowserAudio } from './audio/browser';
import { BrowserRecorder } from './audio/recorder';
import { saveTextFile } from './ui/files';
import { DEFAULT_TIMING, ServicesContext, type Services } from './ui/services';

const store = new IdbStore();
const services: Services = {
  content: CONTENT,
  store,
  audio: new BrowserAudio(CONTENT.cards, store),
  recorder: new BrowserRecorder(),
  rng: Math.random,
  timing: DEFAULT_TIMING,
  saveFile: saveTextFile,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesContext.Provider value={services}>
      <App />
    </ServicesContext.Provider>
  </React.StrictMode>,
);
