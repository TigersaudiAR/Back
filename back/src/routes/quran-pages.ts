import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Configuration for Quran page images
const QURAN_PAGE_BASE_URL = "https://quran-images.pages.dev/pages";
const TOTAL_PAGES = 604;

// Get list of all pages
router.get("/", (_req, res) => {
  const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => {
    const pageNumber = i + 1;
    const paddedNumber = String(pageNumber).padStart(3, "0");
    return {
      page: pageNumber,
      image_url: `${QURAN_PAGE_BASE_URL}/${paddedNumber}.png`,
      coords_url: `/api/quran-pages/${pageNumber}/coords`
    };
  });
  
  res.json({ total: TOTAL_PAGES, pages });
});

// Get specific page info
router.get("/:page", (req, res) => {
  const pageNumber = Number(req.params.page);
  
  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    return res.status(400).json({ 
      message: "رقم الصفحة غير صحيح. يجب أن يكون بين 1 و 604" 
    });
  }
  
  const paddedNumber = String(pageNumber).padStart(3, "0");
  
  res.json({
    page: pageNumber,
    image_url: `${QURAN_PAGE_BASE_URL}/${paddedNumber}.png`,
    coords_url: `/api/quran-pages/${pageNumber}/coords`
  });
});

// Get coordinates for a specific page
router.get("/:page/coords", (req, res) => {
  const pageNumber = Number(req.params.page);
  
  if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    return res.status(400).json({ 
      message: "رقم الصفحة غير صحيح. يجب أن يكون بين 1 و 604" 
    });
  }
  
  const paddedNumber = String(pageNumber).padStart(3, "0");
  const coordsPath = path.join(process.cwd(), "public", "page_coords", `${paddedNumber}.json`);
  
  // Check if coordinates file exists
  if (!fs.existsSync(coordsPath)) {
    // Return empty coordinates if file doesn't exist yet
    return res.json({
      page: pageNumber,
      verses: [],
      message: "إحداثيات هذه الصفحة غير متوفرة حاليًا"
    });
  }
  
  try {
    const coordsData = JSON.parse(fs.readFileSync(coordsPath, "utf-8"));
    res.json(coordsData);
  } catch (error) {
    console.error(`Error reading coords for page ${pageNumber}:`, error);
    res.status(500).json({ 
      message: "خطأ في تحميل إحداثيات الصفحة" 
    });
  }
});

export const quranPagesRouter = router;
