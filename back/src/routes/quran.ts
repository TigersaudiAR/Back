import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getTafsir } from "../services/dataService.js";
import { fetchSurahAyat, fetchSurahIndex } from "../services/quranRemoteService.js";

const router = express.Router();

const RECITERS = [
  { id: "mahermuaiqly", name: "الشيخ ماهر المعيقلي", bitrate: 128 },
  { id: "alafasy", name: "الشيخ مشاري العفاسي", bitrate: 128 },
  { id: "husary", name: "الشيخ محمود الحصري", bitrate: 64 }
];

const formatRecitations = (surahId: number) =>
  RECITERS.map((reciter) => ({
    surah_id: surahId,
    url: `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/ar.${reciter.id}/${String(surahId).padStart(3, "0")}.mp3`,
    reciter: reciter.name,
    bitrate: reciter.bitrate
  }));

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
    const tafsir = getTafsir().filter((entry) => entry.surah_id === surahId);

    if (!surah) {
      return res.status(404).json({ message: "السورة غير موجودة في الفهرس" });
    }

    if (!ayatResult.ayat.length) {
      return res.status(503).json({
        message: "تعذر تحميل الآيات من المصدر الخارجي ولم تتوافر نسخة محلية لهذه السورة",
        surah,
        tafsir,
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
      tafsir,
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
