import { describe, it, expect } from 'vitest';
import { FakeAudio } from '../../src/audio/fake';

describe('FakeAudio', () => {
  it('records what was spoken and played, in order', async () => {
    const a = new FakeAudio();
    await a.speak('hello');
    await a.playCard('sh');
    a.stop();
    expect(a.spoken).toEqual(['hello']);
    expect(a.played).toEqual(['sh']);
    expect(a.stops).toBe(1);
  });
});
