import express, { Request, Response } from "express";

const router = express.Router();

// Get all Quran pages metadata
router.get("/", (_req: Request, res: Response) => {
  res.json({
    total_pages: 604,
    message: "صفحات المصحف الشريف - 604 صفحة",
    info: {
      juz_count: 30,
      hizb_count: 60,
      surah_count: 114
    }
  });
});

// Get specific page metadata
router.get("/:page", (req: Request, res: Response) => {
  const page = Number(req.params.page);
  
  if (isNaN(page) || page < 1 || page > 604) {
    return res.status(400).json({ message: "رقم الصفحة يجب أن يكون بين 1 و 604" });
  }
  
  // Calculate juz and hizb based on page number
  // Each juz has approximately 20 pages
  const juz = Math.ceil(page / 20);
  // Each hizb has approximately 10 pages
  const hizb = Math.ceil(page / 10);
  
  res.json({
    page,
    juz,
    hizb,
    image_url: `/quran-images/page_${String(page).padStart(3, '0')}.png`,
    coordinates_url: `/page_coords/page_${String(page).padStart(3, '0')}.json`,
    message: `صفحة ${page} من المصحف الشريف`
  });
});

// Get page coordinates (bounding boxes for verses)
router.get("/:page/coordinates", (req: Request, res: Response) => {
  const page = Number(req.params.page);
  
  if (isNaN(page) || page < 1 || page > 604) {
    return res.status(400).json({ message: "رقم الصفحة يجب أن يكون بين 1 و 604" });
  }
  
  // Sample coordinates structure
  // In a real implementation, these would be loaded from JSON files
  res.json({
    page,
    verses: [
      {
        surah_id: 1,
        ayah_number: 1,
        bbox: {
          x: 100,
          y: 150,
          width: 400,
          height: 50
        }
      }
      // More verses would be here in a real implementation
    ],
    message: "إحداثيات الآيات على الصفحة"
  });
});

// Get pages by juz
router.get("/juz/:juz", (req: Request, res: Response) => {
  const juz = Number(req.params.juz);
  
  if (isNaN(juz) || juz < 1 || juz > 30) {
    return res.status(400).json({ message: "رقم الجزء يجب أن يكون بين 1 و 30" });
  }
  
  const startPage = (juz - 1) * 20 + 1;
  const endPage = Math.min(juz * 20, 604);
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push({
      page: i,
      image_url: `/quran-images/page_${String(i).padStart(3, '0')}.png`
    });
  }
  
  res.json({
    juz,
    start_page: startPage,
    end_page: endPage,
    pages,
    total: pages.length
  });
});

export default router;
