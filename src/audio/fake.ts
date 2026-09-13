import type { AudioPlayer } from './types';

export class FakeAudio implements AudioPlayer {
  spoken: string[] = [];
  played: string[] = [];
  stops = 0;
  async speak(text: string) { this.spoken.push(text); }
  async playCard(cardId: string) { this.played.push(cardId); }
  stop() { this.stops++; }
}
