export interface AudioPlayer {
  /** Speak text with the computer voice. Resolves when finished or cut off. */
  speak(text: string): Promise<void>;
  /** Play a card's recorded clip, or speak its fallback label. */
  playCard(cardId: string): Promise<void>;
  /** Cut off anything currently playing. */
  stop(): void;
}

export interface Recorder {
  /** False when this browser has no microphone recording support. */
  supported(): boolean;
  /** Asks for the microphone on first use and starts recording. Rejects if the microphone is refused. */
  start(): Promise<void>;
  /** Stops and resolves with the recorded audio. */
  stop(): Promise<Blob>;
}
