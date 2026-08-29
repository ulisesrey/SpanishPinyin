import manifest from './corpus.json';

export type Clip = {
  id: string;
  file: string;
  pinyin: string;
  hanzi?: string;
};

export const CORPUS: Clip[] = manifest.clips;

// Clips are served from public/clips. The dev server serves that at the root, while GitHub
// Pages serves it under the repo subpath, so the base URL only applies to a real build.
export function clipUrl(clip: Clip): string {
  const base = __DEV__ ? '' : (process.env.EXPO_BASE_URL ?? '');
  return `${base}/clips/${clip.file}`;
}
