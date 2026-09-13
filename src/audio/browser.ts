import type { Card } from '../content/types';
import type { Store } from '../store/types';
import type { AudioPlayer } from './types';

export class BrowserAudio implements AudioPlayer {
  private current: HTMLAudioElement | null = null;
  private cards: Map<string, Card>;

  constructor(cards: Card[], private store: Store) {
    this.cards = new Map(cards.map((c) => [c.id, c]));
  }

  stop() {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
  }

  speak(text: string): Promise<void> {
    this.stop();
    return new Promise((resolve) => {
      if (typeof speechSynthesis === 'undefined') return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.lang = 'en-US';
      const voices = speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith('en') && v.localService) ?? voices.find((v) => v.lang.startsWith('en'));
      if (voice) u.voice = voice;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, 1500 + text.length * 90);
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
    });
  }

  async playCard(cardId: string): Promise<void> {
    this.stop();
    const clip = await this.store.getClip(cardId);
    if (!clip) return this.speak(this.cards.get(cardId)?.phonemeLabel ?? cardId);
    const url = URL.createObjectURL(clip);
    const el = new Audio(url);
    this.current = el;
    await new Promise<void>((resolve) => {
      el.onended = () => resolve();
      el.onerror = () => resolve();
      el.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
  }
}
