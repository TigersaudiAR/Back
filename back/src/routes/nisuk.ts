import express from "express";
import hajjData from "../../data/seed/nisuk/hajj.json" with { type: "json" };
import umrahData from "../../data/seed/nisuk/umrah.json" with { type: "json" };
import prohibitionsData from "../../data/seed/nisuk/prohibitions.json" with { type: "json" };

const router = express.Router();

// Get all Hajj stages
router.get("/hajj", (_req, res) => {
  res.json({ 
    stages: hajjData,
    total: hajjData.length,
    type: "hajj"
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

// Get Hajj stage by number
router.get("/hajj/stage/:number", (req, res) => {
  const stageNumber = Number(req.params.number);
  const stage = hajjData.find((s) => s.stage === stageNumber);
  
  if (!stage) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(stage);
});

// Get all Umrah stages
router.get("/umrah", (_req, res) => {
  res.json({ 
    stages: umrahData,
    total: umrahData.length,
    type: "umrah"
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

// Get Umrah stage by number
router.get("/umrah/stage/:number", (req, res) => {
  const stageNumber = Number(req.params.number);
  const stage = umrahData.find((s) => s.stage === stageNumber);
  
  if (!stage) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(stage);
});

// Get all prohibitions during Ihram
router.get("/prohibitions", (_req, res) => {
  res.json({ 
    prohibitions: prohibitionsData,
    total: prohibitionsData.length
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

// Get prohibition by number
router.get("/prohibitions/number/:number", (req, res) => {
  const prohibitionNumber = Number(req.params.number);
  const prohibition = prohibitionsData.find((p) => p.number === prohibitionNumber);
  
  if (!prohibition) {
    return res.status(404).json({ message: "المحظور غير موجود" });
  }
  
  res.json(prohibition);
});

// Get overview of all Nusuk content
router.get("/overview", (_req, res) => {
  res.json({
    hajj: {
      total_stages: hajjData.length,
      stages: hajjData.map((s) => ({
        id: s.id,
        stage: s.stage,
        title: s.title,
        title_en: s.title_en,
        importance: s.importance
      }))
    },
    umrah: {
      total_stages: umrahData.length,
      stages: umrahData.map((s) => ({
        id: s.id,
        stage: s.stage,
        title: s.title,
        title_en: s.title_en,
        importance: s.importance
      }))
    },
    prohibitions: {
      total: prohibitionsData.length,
      items: prohibitionsData.map((p) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        title_en: p.title_en,
        ruling: p.ruling
      }))
    }
  });
});

export const nisukRouter = router;
