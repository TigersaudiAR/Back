import express from "express";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const router = express.Router();

// Quran has 604 pages in the Uthmani script
const TOTAL_PAGES = 604;

// Get page information
router.get("/", (_req, res) => {
  res.json({
    total_pages: TOTAL_PAGES,
    message: "نظام عرض المصحف التفاعلي - 604 صفحة",
    message_en: "Interactive Quran Display System - 604 pages",
    endpoints: {
      page_info: "/api/quran-pages/:page",
      page_coords: "/api/quran-pages/:page/coordinates",
      verse_location: "/api/quran-pages/verse/:surah/:ayah"
    }
  });
});

// Get specific page information
router.get("/:page", (req, res) => {
  const pageNum = Number(req.params.page);
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > TOTAL_PAGES) {
    return res.status(400).json({ 
      message: `رقم الصفحة يجب أن يكون بين 1 و ${TOTAL_PAGES}` 
    });
  }
  
  // Return page metadata
  res.json({
    page_number: pageNum,
    image_url: `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-images@1/hafs/${pageNum.toString().padStart(3, '0')}.jpg`,
    has_coordinates: existsSync(join(process.cwd(), "public", "page_coords", `${pageNum.toString().padStart(3, '0')}.json`))
  });
});

// Get page coordinates for verse bounding boxes
router.get("/:page/coordinates", (req, res) => {
  const pageNum = Number(req.params.page);
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > TOTAL_PAGES) {
    return res.status(400).json({ 
      message: `رقم الصفحة يجب أن يكون بين 1 و ${TOTAL_PAGES}` 
    });
  }
  
  const coordsPath = join(
    process.cwd(), 
    "public", 
    "page_coords", 
    `${pageNum.toString().padStart(3, '0')}.json`
  );
  
  if (!existsSync(coordsPath)) {
    return res.status(404).json({ 
      message: "إحداثيات هذه الصفحة غير متوفرة حالياً",
      page: pageNum
    });
  }
  
  try {
    const coords = JSON.parse(readFileSync(coordsPath, "utf-8"));
    res.json(coords);
  } catch (error) {
    res.status(500).json({ message: "خطأ في قراءة الإحداثيات" });
  }
});

// Find which page contains a specific verse
router.get("/verse/:surah/:ayah", async (req, res) => {
  const surahId = Number(req.params.surah);
  const ayahNum = Number(req.params.ayah);
  
  if (isNaN(surahId) || isNaN(ayahNum)) {
    return res.status(400).json({ message: "رقم السورة والآية يجب أن يكونا أرقاماً صحيحة" });
  }
  
  // Import the service dynamically to get ayah page info
  try {
    const { getSurahAyat } = await import("../services/dataService.js");
    const ayat = getSurahAyat(surahId);
    const ayah = ayat.find(a => a.ayah_number === ayahNum);
    
    if (!ayah || !ayah.page) {
      return res.status(404).json({ message: "الآية غير موجودة" });
    }
    
    res.json({
      surah_id: surahId,
      ayah_number: ayahNum,
      page: ayah.page,
      juz: ayah.juz,
      image_url: `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-images@1/hafs/${ayah.page.toString().padStart(3, '0')}.jpg`
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديد موقع الآية" });
  }
});

// Get page range for a surah
router.get("/surah/:surahId/pages", async (req, res) => {
  const surahId = Number(req.params.surahId);
  
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return res.status(400).json({ message: "رقم السورة يجب أن يكون بين 1 و 114" });
  }
  
  try {
    const { getSurahAyat } = await import("../services/dataService.js");
    const ayat = getSurahAyat(surahId);
    
    if (!ayat.length) {
      return res.status(404).json({ message: "السورة غير موجودة" });
    }
    
    const pages = ayat
      .filter(a => a.page)
      .map(a => a.page as number);
    
    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);
    
    res.json({
      surah_id: surahId,
      pages: uniquePages,
      start_page: uniquePages[0],
      end_page: uniquePages[uniquePages.length - 1],
      total_pages: uniquePages.length
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في تحديد صفحات السورة" });
  }
});

export const quranPagesRouter = router;
