import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  getRecitationConfig,
  getTafsir,
  getTafsirForSurah
} from "../services/dataService.js";
import { fetchSurahAyat, fetchSurahIndex } from "../services/quranRemoteService.js";

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
  const surahId = Number(req.query.surah) || 1;

  try {
    const [indexResult, ayatResult] = await Promise.all([
      fetchSurahIndex(),
      fetchSurahAyat(surahId)
    ]);

    const surah = indexResult.surahs.find((item) => item.id === surahId) ?? null;
    const tafsir = getTafsirForSurah(surahId);

    if (!surah) {
      return res.status(404).json({ message: "السورة غير موجودة في الفهرس" });
    }

    res.json({
      surah,
      ayat: ayatResult.ayat,
      tafsir,
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
