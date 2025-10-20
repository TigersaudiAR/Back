import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getRecitationTimings, getTafsir } from "../services/dataService.js";
import type { Recitation, Surah } from "../types/index.js";
import { fetchSurahAyat, fetchSurahIndex } from "../services/quranRemoteService.js";
import { findSurahBySlug } from "../utils/surah.js";

const router = express.Router();

const RECITERS = [
  { id: "mahermuaiqly", name: "الشيخ ماهر المعيقلي", bitrate: 128 },
  { id: "alafasy", name: "الشيخ مشاري العفاسي", bitrate: 128 },
  { id: "husary", name: "الشيخ محمود الحصري", bitrate: 64 }
];

const recitationTimings = getRecitationTimings();

const formatRecitations = (surahId: number): Recitation[] =>
  RECITERS.map((reciter) => {
    const timings = recitationTimings[reciter.id]?.[String(surahId)];
    return {
      surah_id: surahId,
      url: `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/ar.${reciter.id}/${String(surahId).padStart(3, "0")}.mp3`,
      reciter: reciter.name,
      bitrate: reciter.bitrate,
      reciter_id: reciter.id,
      timings: timings ? [...timings] : undefined
    };
  });

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
    const indexResult = await fetchSurahIndex();
    const surahIndex = indexResult.surahs;

    let surah: Surah | undefined;
    let surahId: number | undefined = Number.isNaN(rawSurah) ? undefined : rawSurah;

    if (slugQuery) {
      const slugMatch = findSurahBySlug(surahIndex, slugQuery);
      if (!slugMatch) {
        return res.status(404).json({ message: "تعذر العثور على السورة المطلوبة بالمعرّف النصي" });
      }
      surah = slugMatch;
      surahId = slugMatch.id;
    }

    if (!surah && typeof surahId === "number") {
      surah = surahIndex.find((item) => item.id === surahId);
    }

    if (!surah) {
      surah = surahIndex.find((item) => item.id === 1) ?? surahIndex[0];
      surahId = surah?.id;
    }

    if (!surah || typeof surahId !== "number") {
      return res.status(404).json({ message: "السورة غير موجودة في الفهرس" });
    }

    const tafsirList = getTafsir().filter((entry) => entry.surah_id === surahId);
    const ayatResult = await fetchSurahAyat(surahId);

    if (!ayatResult.ayat.length) {
      return res.status(503).json({
        message: "تعذر تحميل الآيات من المصدر الخارجي ولم تتوافر نسخة محلية لهذه السورة",
        surah,
        tafsir: tafsirList,
        recitations: formatRecitations(surahId),
        cached: true
      });
    }

    const message =
      ayatResult.fromCache || indexResult.fromCache
        ? "يتم عرض السورة من النسخة المخزنة لحين توفر الاتصال الخارجي."
        : undefined;

    res.json({
      surah,
      ayat: ayatResult.ayat,
      tafsir: tafsirList,
      recitations: formatRecitations(surahId),
      cached: ayatResult.fromCache || indexResult.fromCache,
      message
    });
  } catch (error) {
    console.error("Failed to load surah", error);
    res.status(502).json({ message: "تعذر تحميل بيانات السورة من الخدمة الخارجية" });
  }
});

router.post("/tafsir", authenticate(["admin", "teacher"]), (req, res) => {
  const body = req.body as { surah_id: number; ayah_number: number; source: string; text_ar: string };
  res.json({ message: "تم حفظ التفسير مؤقتًا للمراجعة", tafsir: body });
});

export const quranRouter = router;
