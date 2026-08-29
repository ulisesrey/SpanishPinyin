import { CORPUS, type Clip } from './corpus';

export const BATCH_SIZE = 20;

// Clips are drawn at random rather than by how many Transcriptions they already have: the
// browser cannot read the response table, so global coverage is unknowable here.
export function nextBatch(seenClipIds: string[]): Clip[] {
  const seen = new Set(seenClipIds);
  const unseen = CORPUS.filter(clip => !seen.has(clip.id));
  return shuffle(unseen).slice(0, BATCH_SIZE);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = indexBelow(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function indexBelow(bound: number): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] % bound;
}
