export interface AudioPlayer {
  /** Speak text with the computer voice. Resolves when finished or cut off. */
  speak(text: string): Promise<void>;
  /** Play a card's recorded clip, or speak its fallback label. */
  playCard(cardId: string): Promise<void>;
  /** Cut off anything currently playing. */
  stop(): void;
}
