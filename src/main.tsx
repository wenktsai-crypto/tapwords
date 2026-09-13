import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import './ui/styles.css';
import App from './App';
import { CONTENT } from './content';
import { IdbStore } from './store/idb';
import { BrowserAudio } from './audio/browser';
import { DEFAULT_TIMING, ServicesContext, type Services } from './ui/services';

const store = new IdbStore();
const services: Services = {
  content: CONTENT,
  store,
  audio: new BrowserAudio(CONTENT.cards, store),
  rng: Math.random,
  timing: DEFAULT_TIMING,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesContext.Provider value={services}>
      <App />
    </ServicesContext.Provider>
  </React.StrictMode>,
);
