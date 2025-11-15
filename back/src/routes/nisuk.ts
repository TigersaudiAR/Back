import express, { Request, Response } from "express";
import hajjData from "../../data/seed/nisuk/hajj.json" with { type: "json" };
import umrahData from "../../data/seed/nisuk/umrah.json" with { type: "json" };
import prohibitionsData from "../../data/seed/nisuk/prohibitions.json" with { type: "json" };

const router = express.Router();

// Get all Hajj steps
router.get("/hajj", (_req: Request, res: Response) => {
  res.json({ steps: hajjData, total: hajjData.length });
});

// Get specific Hajj step by ID
router.get("/hajj/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const step = hajjData.find((s) => s.id === id);
  
  if (!step) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(step);
});

// Get all Umrah steps
router.get("/umrah", (_req: Request, res: Response) => {
  res.json({ steps: umrahData, total: umrahData.length });
});

// Get specific Umrah step by ID
router.get("/umrah/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const step = umrahData.find((s) => s.id === id);
  
  if (!step) {
    return res.status(404).json({ message: "المرحلة غير موجودة" });
  }
  
  res.json(step);
});

// Get all Ihram prohibitions
router.get("/prohibitions", (_req: Request, res: Response) => {
  res.json({ prohibitions: prohibitionsData, total: prohibitionsData.length });
});

// Get specific prohibition by ID
router.get("/prohibitions/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const prohibition = prohibitionsData.find((p) => p.id === id);
  
  if (!prohibition) {
    return res.status(404).json({ message: "المحظور غير موجود" });
  }
  
  res.json(prohibition);
});

// Get overview of Hajj and Umrah
router.get("/overview", (_req: Request, res: Response) => {
  res.json({
    hajj: {
      total_steps: hajjData.length,
      description: "مناسك الحج الكاملة من الإحرام حتى طواف الوداع"
    },
    umrah: {
      total_steps: umrahData.length,
      description: "مناسك العمرة الكاملة من الإحرام حتى التحلل"
    },
    prohibitions: {
      total: prohibitionsData.length,
      description: "محظورات الإحرام التي يجب على الحاج والمعتمر اجتنابها"
    }
  });
});

export default router;
