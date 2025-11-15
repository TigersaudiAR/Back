import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data/seed');

async function loadJson(relativePath) {
  const filePath = path.join(dataDir, relativePath);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

const EXPECTED_TOTAL = 6236;

const ayatPromise = loadJson('ayahs.json');
const surahIndexPromise = loadJson('surah_index.json');

test('local ayah dataset contains complete Quran', async () => {
  const [ayat, surahIndex] = await Promise.all([ayatPromise, surahIndexPromise]);

  assert.equal(
    ayat.length,
    EXPECTED_TOTAL,
    `Expected ${EXPECTED_TOTAL} ayat in the dataset`,
  );

  const ayatBySurah = new Map();
  for (const ayah of ayat) {
    const key = ayah.surah_id;
    if (!ayatBySurah.has(key)) {
      ayatBySurah.set(key, 0);
    }
    ayatBySurah.set(key, ayatBySurah.get(key) + 1);
  }

  for (const surah of surahIndex) {
    const count = ayatBySurah.get(surah.id) ?? 0;
    assert.equal(
      count,
      surah.ayah_count,
      `Surah ${surah.id} should contain ${surah.ayah_count} ayat in the local dataset`,
    );
  }
});
