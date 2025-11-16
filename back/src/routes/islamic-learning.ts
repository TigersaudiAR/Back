import express from "express";
import whatIsIslamData from "../../data/seed/what_is_islam.json" with { type: "json" };
import seerahData from "../../data/seed/seerah_events.json" with { type: "json" };

const router = express.Router();

// Get all "What is Islam" content
router.get("/what-is-islam", (_req, res) => {
  res.json({ items: whatIsIslamData });
});

// Get specific topic by ID
router.get("/what-is-islam/:id", (req, res) => {
  const { id } = req.params;
  const item = whatIsIslamData.find((q) => q.id === id);
  
  if (!item) {
    return res.status(404).json({ message: "المحتوى غير موجود" });
  }
  
  res.json(item);
});

// Get content by category
router.get("/what-is-islam/category/:category", (req, res) => {
  const { category } = req.params;
  const items = whatIsIslamData.filter((q) => q.category === category);
  res.json({ items });
});

// Get all Seerah events
router.get("/seerah", (_req, res) => {
  res.json({ events: seerahData });
});

// Get specific Seerah event by ID
router.get("/seerah/:id", (req, res) => {
  const { id } = req.params;
  const event = seerahData.find((e) => e.id === id);
  
  if (!event) {
    return res.status(404).json({ message: "الحدث غير موجود" });
  }
  
  res.json(event);
});

// Search in Islamic content
router.get("/search", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  
  if (!query) {
    return res.json({ results: [] });
  }
  
  const islamResults = whatIsIslamData.filter(
    (item) =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      (item.question_en && item.question_en.toLowerCase().includes(query))
  ).map((item) => ({ ...item, type: "islam-qa" }));
  
  const seerahResults = seerahData.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      (item.title_en && item.title_en.toLowerCase().includes(query))
  ).map((item) => ({ ...item, type: "seerah" }));
  
  res.json({ results: [...islamResults, ...seerahResults] });
});

export default router;
