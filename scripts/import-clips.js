// Copies scraped audio into public/clips, renaming each file to its Clip id.
//
// Usage: node scripts/import-clips.js <source-dir>
//
// The source is a directory of folders named after the hanzi, each containing an mp3.
// Hanzi cannot be the Clip id — the id becomes a filename served from a GitHub Pages
// subpath — so the mapping in data/words.json is the bridge between the two.

const fs = require('node:fs');
const path = require('node:path');

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/import-clips.js <source-dir>');
  process.exit(1);
}

const WORDS = path.join(__dirname, '..', 'data', 'words.json');
const CLIPS_DIR = path.join(__dirname, '..', 'public', 'clips');
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.opus']);

const words = JSON.parse(fs.readFileSync(WORDS, 'utf8')).words;
const byHanzi = new Map(words.map(word => [word.hanzi, word]));

fs.mkdirSync(CLIPS_DIR, { recursive: true });

const imported = [];
const unmatchedFolders = [];
const emptyFolders = [];

for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  // Folder names may arrive in either Unicode normalisation form; NFC matches words.json.
  const hanzi = entry.name.normalize('NFC');
  const word = byHanzi.get(hanzi);
  if (!word) {
    unmatchedFolders.push(entry.name);
    continue;
  }

  const folder = path.join(source, entry.name);
  const audio = fs
    .readdirSync(folder)
    .filter(file => AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()[0];

  if (!audio) {
    emptyFolders.push(hanzi);
    continue;
  }

  const file = `${word.id}${path.extname(audio).toLowerCase()}`;
  fs.copyFileSync(path.join(folder, audio), path.join(CLIPS_DIR, file));
  imported.push({ id: word.id, file, pinyin: word.pinyin, hanzi });
}

imported.sort((a, b) => a.id.localeCompare(b.id));

const missing = words.filter(word => !imported.some(clip => clip.id === word.id));

console.log(`Imported ${imported.length} clips into public/clips.`);
if (unmatchedFolders.length > 0) {
  console.warn(
    `\n${unmatchedFolders.length} folder(s) matched no entry in data/words.json:\n  ${unmatchedFolders.join(', ')}`
  );
}
if (emptyFolders.length > 0) {
  console.warn(`\n${emptyFolders.length} folder(s) had no audio file:\n  ${emptyFolders.join(', ')}`);
}
if (missing.length > 0) {
  console.warn(
    `\n${missing.length} word(s) have no clip and are absent from the Corpus:\n  ${missing
      .map(word => `${word.hanzi} (${word.pinyin})`)
      .join(', ')}`
  );
}
console.log('\nNow run: npm run build-corpus');
