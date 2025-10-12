import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getAyat, getSurahIndex, getTafsir } from "../services/dataService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const surahId = Number(req.query.surah) || 1;
  const surah = getSurahIndex().find((item) => item.id === surahId);
  const ayat = getAyat().filter((ayah) => ayah.surah_id === surahId);
  const tafsir = getTafsir().filter((entry) => entry.surah_id === surahId);
  res.json({ surah, ayat, tafsir, recitations: [{ surah_id: surahId, url: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/001.mp3", reciter: "تجريبي" }] });
});

router.post("/tafsir", authenticate(["admin", "teacher"]), (req, res) => {
  const body = req.body as { surah_id: number; ayah_number: number; source: string; text_ar: string };
  // في نسخة أولية نقوم بإرجاع البيانات المستلمة دون تخزين دائم
  res.json({ message: "تم حفظ التفسير (محاكاة)", tafsir: body });
});

export const quranRouter = router;
