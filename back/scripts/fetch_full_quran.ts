import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://api.alquran.cloud/v1/surah";
const SURAH_COUNT = 114;
const EXPECTED_TOTAL_AYAHS = 6236;

interface SurahIndexEntry {
  id: number;
  ayah_count: number;
}

interface FetchedAyah {
  numberInSurah: number;
  text: string;
}

interface FetchedSurahResponse {
  data: {
    number: number;
    ayahs: FetchedAyah[];
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data/seed");

async function loadSurahIndex(): Promise<SurahIndexEntry[]> {
  const indexPath = path.join(dataDir, "surah_index.json");
  const raw = await readFile(indexPath, "utf-8");
  return JSON.parse(raw) as SurahIndexEntry[];
}

async function fetchSurah(surahId: number): Promise<FetchedSurahResponse["data"]> {
  const response = await fetch(`${API_BASE}/${surahId}/quran-uthmani`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${surahId}: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as FetchedSurahResponse;
  if (!json?.data?.ayahs) {
    throw new Error(`Unexpected response format for surah ${surahId}`);
  }

  return json.data;
}

async function main(): Promise<void> {
  const surahIndex = await loadSurahIndex();
  const ayat: { surah_id: number; ayah_number: number; text_ar: string }[] = [];

  for (let surahId = 1; surahId <= SURAH_COUNT; surahId += 1) {
    const surahData = await fetchSurah(surahId);

    if (surahData.number !== surahId) {
      throw new Error(
        `Mismatched surah number. Expected ${surahId}, received ${surahData.number}`,
      );
    }

    const expectedAyahCount = surahIndex.find((entry) => entry.id === surahId)?.ayah_count;
    if (typeof expectedAyahCount !== "number") {
      throw new Error(`Missing ayah count for surah ${surahId} in surah_index.json`);
    }

    if (surahData.ayahs.length !== expectedAyahCount) {
      throw new Error(
        `Surah ${surahId} ayah count mismatch. Expected ${expectedAyahCount}, received ${surahData.ayahs.length}`,
      );
    }

    for (const ayah of surahData.ayahs) {
      ayat.push({
        surah_id: surahId,
        ayah_number: ayah.numberInSurah,
        text_ar: ayah.text.trim(),
      });
    }

    console.log(`Fetched surah ${surahId} with ${surahData.ayahs.length} ayat.`);
  }

  ayat.sort((a, b) => {
    if (a.surah_id !== b.surah_id) {
      return a.surah_id - b.surah_id;
    }
    return a.ayah_number - b.ayah_number;
  });

  if (ayat.length !== EXPECTED_TOTAL_AYAHS) {
    throw new Error(
      `Total ayah count mismatch. Expected ${EXPECTED_TOTAL_AYAHS}, received ${ayat.length}`,
    );
  }

  const outputPath = path.join(dataDir, "ayahs.json");
  await writeFile(outputPath, `${JSON.stringify(ayat, null, 2)}\n`, "utf-8");

  console.log(`Saved ${ayat.length} ayat to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
