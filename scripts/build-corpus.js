// Regenerates src/study/corpus.json from the audio files in public/clips.
//
// A Clip's id is its filename stem, so renaming a published file detaches every
// Transcription already collected for it. Once a clip has shipped, its name is frozen.
//
// Pinyin cannot be read from the audio: it comes from data/words.json, matched by id.

const fs = require('node:fs');
const path = require('node:path');

const CLIPS_DIR = path.join(__dirname, '..', 'public', 'clips');
const WORDS = path.join(__dirname, '..', 'data', 'words.json');
const MANIFEST = path.join(__dirname, '..', 'src', 'study', 'corpus.json');
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.opus']);

if (!fs.existsSync(CLIPS_DIR)) {
  console.error(`No clips directory at ${CLIPS_DIR}. Run scripts/import-clips.js first.`);
  process.exit(1);
}

const byId = new Map(
  JSON.parse(fs.readFileSync(WORDS, 'utf8')).words.map(word => [word.id, word])
);

const clips = fs
  .readdirSync(CLIPS_DIR)
  .filter(file => AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()))
  .sort()
  .map(file => {
    const id = path.basename(file, path.extname(file));
    const word = byId.get(id);
    return word
      ? { id, file, pinyin: word.pinyin, hanzi: word.hanzi }
      : { id, file, pinyin: id, needsReview: true };
  });

fs.writeFileSync(MANIFEST, `${JSON.stringify({ clips }, null, 2)}\n`);

const review = clips.filter(clip => clip.needsReview);
console.log(`Wrote ${clips.length} clips to ${path.relative(process.cwd(), MANIFEST)}.`);
if (review.length > 0) {
  console.warn(
    `${review.length} clip(s) have no entry in data/words.json and carry a placeholder pinyin: ` +
      review.map(clip => clip.id).join(', ')
  );
}
