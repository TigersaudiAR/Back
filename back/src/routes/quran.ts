import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getRecitationConfig,
  getTafsir,
  getTafsirForSurah
} from "../services/dataService.js";
import { fetchSurahAyat, fetchSurahIndex } from "../services/quranRemoteService.js";
import { ensureSurahListSlugs, findSurahBySlug } from "../utils/surah.js";

const router = express.Router();

const buildRecitationUrl = (template: string, baseUrl: string, surahId: number) => {
  const surah = String(surahId);
  const padded = surah.padStart(3, "0");
  return template
    .replace(/{{\s*base_url\s*}}/g, baseUrl)
    .replace(/{{\s*surah_padded\s*}}/g, padded)
    .replace(/{{\s*surah\s*}}/g, surah);
};

const formatRecitations = (surahId: number) => {
  const config = getRecitationConfig();
  const template = config.url_template ?? "{{base_url}}{{surah_padded}}.mp3";
  return config.reciters.map((reciter) => ({
    surah_id: surahId,
    url: buildRecitationUrl(template, reciter.base_url, surahId),
    reciter: reciter.name,
    bitrate: reciter.bitrate
  }));
};

router.get("/index", async (_req, res) => {
  const result = await fetchSurahIndex();
  res.json({ surahs: result.surahs, cached: result.fromCache });
});

router.get("/tafsir", (_req, res) => {
  res.json({ tafsir: getTafsir() });
});

router.get("/", async (req, res) => {
  const rawSurah = Number(req.query.surah);
  const slugQuery = typeof req.query.slug === "string" ? req.query.slug.trim() : undefined;

  try {
    // Fetch surah index
    const indexResult = await fetchSurahIndex();
    const surahIndex = ensureSurahListSlugs(indexResult.surahs);

    // If no surah specified, return the index
    if (Number.isNaN(rawSurah) && !slugQuery) {
      return res.json({ surahs: surahIndex });
    }

    // Determine which surah to fetch
    let surahId: number | undefined;
    if (slugQuery) {
      const foundBySlug = findSurahBySlug(surahIndex, slugQuery);
      surahId = foundBySlug?.id;
    } else if (!Number.isNaN(rawSurah)) {
      surahId = rawSurah;
    }

    // Default to first surah if not found
    if (!surahId) {
      const firstSurah = surahIndex[0];
      surahId = firstSurah?.id ?? 1;
    }

    // Fetch the surah data
    const surah = surahIndex.find((item) => item.id === surahId);
    if (!surah) {
      return res.status(404).json({ message: "السورة غير موجودة في الفهرس" });
    }

    // Fetch ayat and tafsir
    const ayatResult = await fetchSurahAyat(surahId);
    const tafsirList = getTafsirForSurah(surahId);

    res.json({
      surah,
      ayat: ayatResult.ayat,
      tafsir: tafsirList,
      recitations: formatRecitations(surahId),
      cached: ayatResult.fromCache || indexResult.fromCache,
      message:
        ayatResult.fromCache || indexResult.fromCache
          ? "تم تحميل السورة من الذاكرة المؤقتة المحلية."
          : undefined
    });
  } catch (error) {
    console.error("Failed to load surah", error);
    res.status(500).json({ message: "تعذر تحميل بيانات السورة من المصدر المحلي" });
  }
});

router.post("/tafsir", authenticate(["admin", "teacher"]), (req, res) => {
  const body = req.body as { surah_id: number; ayah_number: number; source: string; text_ar: string };
  res.json({ message: "تم حفظ التفسير مؤقتًا للمراجعة", tafsir: body });
});

export const quranRouter = router;
