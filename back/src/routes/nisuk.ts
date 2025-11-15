import express from "express";
import hajjData from "../../data/seed/nisuk/hajj.json" with { type: "json" };
import umrahData from "../../data/seed/nisuk/umrah.json" with { type: "json" };
import prohibitionsData from "../../data/seed/nisuk/prohibitions.json" with { type: "json" };

const router = express.Router();

// Get all Hajj stages
router.get("/hajj", (_req, res) => {
  res.json({ 
    stages: hajjData,
    total: hajjData.length 
  });
});

// Get specific Hajj stage by ID
router.get("/hajj/:id", (req, res) => {
  const { id } = req.params;
  const stage = hajjData.find((s) => s.id === id);
  
  if (!stage) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(stage);
});

// Get all Umrah stages
router.get("/umrah", (_req, res) => {
  res.json({ 
    stages: umrahData,
    total: umrahData.length 
  });
});

// Get specific Umrah stage by ID
router.get("/umrah/:id", (req, res) => {
  const { id } = req.params;
  const stage = umrahData.find((s) => s.id === id);
  
  if (!stage) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(stage);
});

// Get all Ihram prohibitions
router.get("/prohibitions", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const appliesTo = typeof req.query.applies_to === "string" ? req.query.applies_to : undefined;
  
  let filtered = prohibitionsData;
  
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  
  if (appliesTo) {
    filtered = filtered.filter((p) => p.applies_to === appliesTo || p.applies_to === "both");
  }
  
  res.json({ 
    prohibitions: filtered,
    total: filtered.length 
  });
});

// Get specific prohibition by ID
router.get("/prohibitions/:id", (req, res) => {
  const { id } = req.params;
  const prohibition = prohibitionsData.find((p) => p.id === id);
  
  if (!prohibition) {
    return res.status(404).json({ message: "المحظور غير موجود" });
  }
  
  res.json(prohibition);
});

// Get Nusuk guide - combined overview
router.get("/guide", (_req, res) => {
  res.json({
    hajj: {
      total_stages: hajjData.length,
      summary_ar: "دليل كامل لمناسك الحج بـ 15 مرحلة مفصلة",
      summary_en: "Complete Hajj guide with 15 detailed stages",
      stages: hajjData.map(s => ({ id: s.id, name_ar: s.name_ar, name_en: s.name_en, order: s.order }))
    },
    umrah: {
      total_stages: umrahData.length,
      summary_ar: "دليل كامل لمناسك العمرة بـ 7 مراحل",
      summary_en: "Complete Umrah guide with 7 stages",
      stages: umrahData.map(s => ({ id: s.id, name_ar: s.name_ar, name_en: s.name_en, order: s.order }))
    },
    prohibitions: {
      total: prohibitionsData.length,
      summary_ar: "17 محظوراً من محظورات الإحرام",
      summary_en: "17 Ihram prohibitions",
      categories: [...new Set(prohibitionsData.map(p => p.category))]
    },
    nusuk_platform: "https://www.nusuk.sa"
  });
});

export const nisukRouter = router;
