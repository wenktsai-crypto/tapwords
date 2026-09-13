import type { Card } from '../content/types';
import type { Store } from '../store/types';
import type { AudioPlayer } from './types';

export class BrowserAudio implements AudioPlayer {
  private current: HTMLAudioElement | null = null;
  private cards: Map<string, Card>;
  private voice: SpeechSynthesisVoice | undefined;

  constructor(cards: Card[], private store: Store) {
    this.cards = new Map(cards.map((c) => [c.id, c]));
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.getVoices();
      speechSynthesis.addEventListener('voiceschanged', () => {
        this.voice = this.pickVoice();
      });
    }
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = speechSynthesis.getVoices();
    return voices.find((v) => v.lang.startsWith('en') && v.localService) ?? voices.find((v) => v.lang.startsWith('en'));
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
      const voice = this.voice ?? this.pickVoice();
      if (voice) {
        u.voice = voice;
        this.voice = voice;
      }
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
    const clip = await this.store.getClip(cardId).catch(() => undefined);
    if (!clip) return this.speak(this.cards.get(cardId)?.phonemeLabel ?? cardId);
    const url = URL.createObjectURL(clip);
    const el = new Audio(url);
    this.current = el;
    await new Promise<void>((resolve) => {
      el.onended = () => {
        this.current = null;
        resolve();
      };
      el.onerror = () => {
        this.current = null;
        resolve();
      };
      el.play().catch(() => {
        this.current = null;
        resolve();
      });
    });
    URL.revokeObjectURL(url);
  }
}
