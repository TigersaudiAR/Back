// Utility functions for calculating Juz and Hizb numbers from Surah and Ayah
// Based on standard Quran divisions (30 Juz, 60 Hizb)

interface SurahJuzMapping {
  surahId: number;
  startJuz: number;
  endJuz?: number;
}

// Simplified mapping - each Surah's starting Juz
const SURAH_JUZ_MAP: SurahJuzMapping[] = [
  { surahId: 1, startJuz: 1 },
  { surahId: 2, startJuz: 1, endJuz: 3 },
  { surahId: 3, startJuz: 3, endJuz: 4 },
  { surahId: 4, startJuz: 4, endJuz: 6 },
  { surahId: 5, startJuz: 6, endJuz: 7 },
  { surahId: 6, startJuz: 7, endJuz: 8 },
  { surahId: 7, startJuz: 8, endJuz: 9 },
  { surahId: 8, startJuz: 9, endJuz: 10 },
  { surahId: 9, startJuz: 10, endJuz: 11 },
  { surahId: 10, startJuz: 11 },
  { surahId: 11, startJuz: 11, endJuz: 12 },
  { surahId: 12, startJuz: 12, endJuz: 13 },
  { surahId: 13, startJuz: 13 },
  { surahId: 14, startJuz: 13 },
  { surahId: 15, startJuz: 14 },
  { surahId: 16, startJuz: 14 },
  { surahId: 17, startJuz: 15 },
  { surahId: 18, startJuz: 15, endJuz: 16 },
  { surahId: 19, startJuz: 16 },
  { surahId: 20, startJuz: 16 },
  { surahId: 21, startJuz: 17 },
  { surahId: 22, startJuz: 17 },
  { surahId: 23, startJuz: 18 },
  { surahId: 24, startJuz: 18 },
  { surahId: 25, startJuz: 18, endJuz: 19 },
  { surahId: 26, startJuz: 19 },
  { surahId: 27, startJuz: 19, endJuz: 20 },
  { surahId: 28, startJuz: 20 },
  { surahId: 29, startJuz: 20, endJuz: 21 },
  { surahId: 30, startJuz: 21 },
  { surahId: 31, startJuz: 21 },
  { surahId: 32, startJuz: 21 },
  { surahId: 33, startJuz: 21, endJuz: 22 },
  { surahId: 34, startJuz: 22 },
  { surahId: 35, startJuz: 22 },
  { surahId: 36, startJuz: 22, endJuz: 23 },
  { surahId: 37, startJuz: 23 },
  { surahId: 38, startJuz: 23 },
  { surahId: 39, startJuz: 23, endJuz: 24 },
  { surahId: 40, startJuz: 24 },
  { surahId: 41, startJuz: 24, endJuz: 25 },
  { surahId: 42, startJuz: 25 },
  { surahId: 43, startJuz: 25 },
  { surahId: 44, startJuz: 25 },
  { surahId: 45, startJuz: 25, endJuz: 26 },
  { surahId: 46, startJuz: 26 },
  { surahId: 47, startJuz: 26 },
  { surahId: 48, startJuz: 26 },
  { surahId: 49, startJuz: 26 },
  { surahId: 50, startJuz: 26 },
  { surahId: 51, startJuz: 26, endJuz: 27 },
  { surahId: 52, startJuz: 27 },
  { surahId: 53, startJuz: 27 },
  { surahId: 54, startJuz: 27 },
  { surahId: 55, startJuz: 27 },
  { surahId: 56, startJuz: 27 },
  { surahId: 57, startJuz: 27 },
  { surahId: 58, startJuz: 28 },
  { surahId: 59, startJuz: 28 },
  { surahId: 60, startJuz: 28 },
  { surahId: 61, startJuz: 28 },
  { surahId: 62, startJuz: 28 },
  { surahId: 63, startJuz: 28 },
  { surahId: 64, startJuz: 28 },
  { surahId: 65, startJuz: 28 },
  { surahId: 66, startJuz: 28 },
  { surahId: 67, startJuz: 29 },
  { surahId: 68, startJuz: 29 },
  { surahId: 69, startJuz: 29 },
  { surahId: 70, startJuz: 29 },
  { surahId: 71, startJuz: 29 },
  { surahId: 72, startJuz: 29 },
  { surahId: 73, startJuz: 29 },
  { surahId: 74, startJuz: 29 },
  { surahId: 75, startJuz: 29 },
  { surahId: 76, startJuz: 29 },
  { surahId: 77, startJuz: 29 },
  { surahId: 78, startJuz: 30 },
  { surahId: 79, startJuz: 30 },
  { surahId: 80, startJuz: 30 },
  { surahId: 81, startJuz: 30 },
  { surahId: 82, startJuz: 30 },
  { surahId: 83, startJuz: 30 },
  { surahId: 84, startJuz: 30 },
  { surahId: 85, startJuz: 30 },
  { surahId: 86, startJuz: 30 },
  { surahId: 87, startJuz: 30 },
  { surahId: 88, startJuz: 30 },
  { surahId: 89, startJuz: 30 },
  { surahId: 90, startJuz: 30 },
  { surahId: 91, startJuz: 30 },
  { surahId: 92, startJuz: 30 },
  { surahId: 93, startJuz: 30 },
  { surahId: 94, startJuz: 30 },
  { surahId: 95, startJuz: 30 },
  { surahId: 96, startJuz: 30 },
  { surahId: 97, startJuz: 30 },
  { surahId: 98, startJuz: 30 },
  { surahId: 99, startJuz: 30 },
  { surahId: 100, startJuz: 30 },
  { surahId: 101, startJuz: 30 },
  { surahId: 102, startJuz: 30 },
  { surahId: 103, startJuz: 30 },
  { surahId: 104, startJuz: 30 },
  { surahId: 105, startJuz: 30 },
  { surahId: 106, startJuz: 30 },
  { surahId: 107, startJuz: 30 },
  { surahId: 108, startJuz: 30 },
  { surahId: 109, startJuz: 30 },
  { surahId: 110, startJuz: 30 },
  { surahId: 111, startJuz: 30 },
  { surahId: 112, startJuz: 30 },
  { surahId: 113, startJuz: 30 },
  { surahId: 114, startJuz: 30 }
];

/**
 * Get the Juz number for a given Surah
 * @param surahId - The Surah number (1-114)
 * @returns The Juz number (1-30)
 */
export function getJuzNumber(surahId: number): number {
  const mapping = SURAH_JUZ_MAP.find(m => m.surahId === surahId);
  return mapping?.startJuz ?? 1;
}

/**
 * Get the Hizb number for a given Surah
 * Since each Juz contains 2 Hizbs, we calculate based on Juz
 * @param surahId - The Surah number (1-114)
 * @returns The Hizb number (1-60)
 */
export function getHizbNumber(surahId: number): number {
  const juz = getJuzNumber(surahId);
  // Each Juz has 2 Hizbs, so multiply by 2 and subtract 1 for the first Hizb
  return (juz * 2) - 1;
}

/**
 * Get page number (estimated) for a Surah
 * The Quran has 604 pages, with ~114 surahs
 * This is a simplified calculation
 * @param surahId - The Surah number (1-114)
 * @returns Estimated starting page number
 */
export function getPageNumber(surahId: number): number {
  // Simplified mapping of Surah to approximate page
  const pagesPerJuz = 20; // Approximately 20 pages per Juz
  const juz = getJuzNumber(surahId);
  return (juz - 1) * pagesPerJuz + 1;
}
